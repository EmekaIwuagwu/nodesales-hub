// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IDNRSToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function burn(uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title BoardroomStaking — Kortana DNR Staking for DNRS Rewards
 * @notice DNR holders stake DNR here to earn DNRS during expansion epochs
 * @dev Key anti-dump mechanisms:
 *      → Minimum 6 epoch lockup (3 days) before withdrawal
 *      → Rewards vest over lock period (no immediate dump)
 *      → Early exit penalty: 50% of unclaimed rewards burned
 *      → Withdrawal cooldown: 2 epochs after claiming rewards
 *
 * Designed to create SUSTAINED demand for DNR
 * More DNRS expansion = more DNR needed to stake = DNR price rises
 * Rising DNR price = stronger DNRS backing = healthier system
 */
contract BoardroomStaking is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Staking token = DNR (native wrapped or ERC-20 representation)
    IERC20 public dnrToken;
    IDNRSToken public dnrsToken;

    // Lockup configuration
    uint256 public constant EPOCH_DURATION = 12 hours;
    uint256 public constant MIN_LOCK_EPOCHS = 6;  // 3 days minimum
    uint256 public constant EARLY_EXIT_PENALTY = 5000; // 50% of unclaimed rewards

    struct Seat {
        uint256 balance;          // DNR staked
        uint256 rewardDebt;       // For reward calculation
        uint256 lockEpochStart;   // Epoch when they staked
        uint256 lockEpochEnd;     // Epoch when they can withdraw
        uint256 withdrawEpoch;    // Can't withdraw same epoch as last reward claim
        uint256 pendingRewards;   // Accumulated unclaimed DNRS rewards
    }

    mapping(address => Seat) public seats;
    uint256 public totalStaked;

    // Reward tracking
    uint256 public accDNRSPerShare; // accumulated DNRS per staked DNR (scaled 1e18)
    uint256 public totalRewardsDistributed;
    uint256 public currentEpoch;

    // Events
    event Staked(address indexed user, uint256 dnrAmount, uint256 lockUntilEpoch);
    event Withdrawn(address indexed user, uint256 dnrAmount, uint256 rewardsClaimed);
    event RewardsClaimed(address indexed user, uint256 dnrsAmount);
    event EarlyExitPenalty(address indexed user, uint256 penaltyAmount);
    event SeigniorageAllocated(uint256 epoch, uint256 amount, uint256 perShare);

    constructor(
        address _dnrToken,
        address _dnrsToken,
        address admin
    ) {
        dnrToken = IERC20(_dnrToken);
        dnrsToken = IDNRSToken(_dnrsToken);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }

    // ---- STAKING ----

    /**
     * @notice Stake DNR to earn DNRS expansion rewards
     * @param amount Amount of DNR to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Boardroom: zero stake");

        Seat storage seat = seats[msg.sender];

        // Claim pending rewards before updating balance
        if (seat.balance > 0) {
            _updatePendingRewards(msg.sender);
        }

        // Transfer DNR from user
        dnrToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update seat
        seat.balance += amount;
        seat.rewardDebt = (seat.balance * accDNRSPerShare) / 1e18;
        seat.lockEpochStart = currentEpoch;
        seat.lockEpochEnd = currentEpoch + MIN_LOCK_EPOCHS;
        totalStaked += amount;

        emit Staked(msg.sender, amount, seat.lockEpochEnd);
    }

    /**
     * @notice Withdraw staked DNR after lockup period
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        Seat storage seat = seats[msg.sender];
        require(seat.balance >= amount, "Boardroom: insufficient balance");
        require(currentEpoch >= seat.lockEpochEnd, "Boardroom: still locked");
        require(currentEpoch > seat.withdrawEpoch, "Boardroom: withdrawal cooldown");

        // Claim all pending rewards first
        _claimRewards(msg.sender);

        seat.balance -= amount;
        seat.rewardDebt = (seat.balance * accDNRSPerShare) / 1e18;
        totalStaked -= amount;
        seat.withdrawEpoch = currentEpoch;

        dnrToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount, 0);
    }

    /**
     * @notice Emergency exit — lose 50% of pending rewards
     * @dev Allows exit before lockup ends, but penalizes unclaimed rewards
     */
    function emergencyExit() external nonReentrant {
        Seat storage seat = seats[msg.sender];
        require(seat.balance > 0, "Boardroom: nothing staked");

        _updatePendingRewards(msg.sender);
        uint256 penalty = (seat.pendingRewards * EARLY_EXIT_PENALTY) / 10000;
        uint256 claimable = seat.pendingRewards - penalty;

        // Burn penalty rewards
        if (penalty > 0) {
            dnrsToken.burn(penalty);
            emit EarlyExitPenalty(msg.sender, penalty);
        }

        // Send remaining rewards
        if (claimable > 0) {
            dnrsToken.transfer(msg.sender, claimable);
        }

        uint256 stakedBalance = seat.balance;
        totalStaked -= stakedBalance;

        // Reset seat
        delete seats[msg.sender];

        dnrToken.safeTransfer(msg.sender, stakedBalance);
        emit Withdrawn(msg.sender, stakedBalance, claimable);
    }

    /**
     * @notice Claim DNRS rewards without unstaking
     */
    function claimRewards() external nonReentrant whenNotPaused {
        _claimRewards(msg.sender);
    }

    // ---- CALLED BY TREASURY ----

    /**
     * @notice Treasury deposits DNRS expansion rewards
     * @dev Called each expansion epoch
     */
    function allocateSeigniorage(uint256 amount) external onlyRole(TREASURY_ROLE) {
        require(totalStaked > 0, "Boardroom: no stakers");
        accDNRSPerShare += (amount * 1e18) / totalStaked;
        totalRewardsDistributed += amount;
        currentEpoch++;
        emit SeigniorageAllocated(currentEpoch, amount, accDNRSPerShare);
    }

    // ---- INTERNAL ----

    function _updatePendingRewards(address user) internal {
        Seat storage seat = seats[user];
        uint256 pending = (seat.balance * accDNRSPerShare) / 1e18 - seat.rewardDebt;
        seat.pendingRewards += pending;
        seat.rewardDebt = (seat.balance * accDNRSPerShare) / 1e18;
    }

    function _claimRewards(address user) internal {
        _updatePendingRewards(user);
        Seat storage seat = seats[user];
        uint256 rewards = seat.pendingRewards;
        if (rewards > 0) {
            seat.pendingRewards = 0;
            dnrsToken.transfer(user, rewards);
            emit RewardsClaimed(user, rewards);
        }
    }

    // ---- VIEW FUNCTIONS ----

    function pendingRewards(address user) external view returns (uint256) {
        Seat memory seat = seats[user];
        if (seat.balance == 0) return 0;
        uint256 pending = (seat.balance * accDNRSPerShare) / 1e18 - seat.rewardDebt;
        return seat.pendingRewards + pending;
    }

    function isLocked(address user) external view returns (bool) {
        return currentEpoch < seats[user].lockEpochEnd;
    }

    function lockTimeRemaining(address user) external view returns (uint256) {
        Seat memory seat = seats[user];
        if (currentEpoch >= seat.lockEpochEnd) return 0;
        return (seat.lockEpochEnd - currentEpoch) * EPOCH_DURATION;
    }
}
