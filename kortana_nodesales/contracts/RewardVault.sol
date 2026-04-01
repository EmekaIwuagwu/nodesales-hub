// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./KortanaGuard.sol";

/**
 * @title RewardVault
 * @notice Holds DNR (wrapped ERC-20 on EVM layer) and distributes it
 *         to node license holders every epoch (24 hours / 86400 seconds).
 *         The off-chain reward engine calls distributeRewards() each epoch.
 *         Users can claim their pending DNR at any time via claimRewards().
 *
 * Kortana EVM notes:
 *  - KortanaGuard replaces OZ ReentrancyGuard (StorageSlot assembly is broken).
 *  - SafeERC20 removed — its assembly is incompatible with Kortana EVM.
 *    Direct IERC20.transfer/transferFrom calls are used instead.
 */
contract RewardVault is Ownable, Pausable, KortanaGuard {

    // ─── State ───────────────────────────────────────────────────────────────

    IERC20  public dnrToken;
    address public distributor;

    uint256 public epochDuration;          // seconds (default: 86400)
    uint256 public lastEpochTimestamp;
    uint256 public currentEpoch;

    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public lastClaimEpoch;
    mapping(uint256 => uint256) public epochTotalDistributed;

    // ─── Events ──────────────────────────────────────────────────────────────

    event RewardsDeposited(uint256 amount, uint256 timestamp);
    event RewardsDistributed(
        uint256 indexed epoch,
        uint256 totalRecipients,
        uint256 totalAmount,
        uint256 timestamp
    );
    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 epoch,
        uint256 timestamp
    );
    event DistributorUpdated(address indexed newDistributor);
    event EpochDurationUpdated(uint256 newDuration);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyDistributor() {
        require(msg.sender == distributor || msg.sender == owner(), "RewardVault: not distributor");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    /**
     * @param _dnrToken      Address of wrapped DNR ERC-20 on this chain
     * @param _distributor   Backend wallet authorised to call distributeRewards
     * @param _epochDuration Seconds per epoch (86400 = 24 h)
     */
    constructor(
        address _dnrToken,
        address _distributor,
        uint256 _epochDuration
    ) Ownable(msg.sender) {
        require(_dnrToken     != address(0), "RewardVault: zero dnr");
        require(_distributor  != address(0), "RewardVault: zero distributor");
        require(_epochDuration > 0,          "RewardVault: zero duration");

        dnrToken          = IERC20(_dnrToken);
        distributor       = _distributor;
        epochDuration     = _epochDuration;
        lastEpochTimestamp = block.timestamp;
        currentEpoch      = 0;
    }

    // ─── Deposit ─────────────────────────────────────────────────────────────

    /**
     * @notice Admin deposits DNR into the vault for distribution.
     */
    function depositRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "RewardVault: zero amount");
        require(dnrToken.transferFrom(msg.sender, address(this), amount), "RewardVault: transferFrom failed");
        emit RewardsDeposited(amount, block.timestamp);
    }

    // ─── Distribution ────────────────────────────────────────────────────────

    /**
     * @notice Called by the off-chain reward engine every epoch.
     *         Adds `amounts[i]` to pendingRewards[recipients[i]].
     *         Enforces one call per epoch via timestamp check.
     * @param recipients  Array of node holder wallet addresses
     * @param amounts     Corresponding DNR amounts (18-decimal)
     */
    function distributeRewards(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyDistributor whenNotPaused {
        require(recipients.length == amounts.length, "RewardVault: length mismatch");
        require(recipients.length > 0,               "RewardVault: empty recipients");
        require(
            block.timestamp >= lastEpochTimestamp + epochDuration,
            "RewardVault: epoch not elapsed"
        );

        uint256 total;
        for (uint256 i; i < amounts.length; ++i) {
            total += amounts[i];
        }
        require(
            dnrToken.balanceOf(address(this)) >= total,
            "RewardVault: insufficient vault balance"
        );

        // Update epoch tracking
        currentEpoch++;
        lastEpochTimestamp = block.timestamp;
        epochTotalDistributed[currentEpoch] = total;

        // Credit pending rewards
        for (uint256 i; i < recipients.length; ++i) {
            require(recipients[i] != address(0), "RewardVault: zero recipient");
            pendingRewards[recipients[i]] += amounts[i];
            totalEarned[recipients[i]]    += amounts[i];
        }

        emit RewardsDistributed(currentEpoch, recipients.length, total, block.timestamp);
    }

    // ─── Claiming ────────────────────────────────────────────────────────────

    /**
     * @notice User calls to withdraw their accumulated pending DNR.
     */
    function claimRewards() external nonReentrant whenNotPaused {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "RewardVault: nothing to claim");

        pendingRewards[msg.sender] = 0;
        lastClaimEpoch[msg.sender] = currentEpoch;

        require(dnrToken.transfer(msg.sender, amount), "RewardVault: transfer failed");
        emit RewardsClaimed(msg.sender, amount, currentEpoch, block.timestamp);
    }

    /**
     * @notice Distributor can auto-claim on behalf of a user (gasless UX).
     */
    function claimRewardsFor(address user) external onlyDistributor nonReentrant whenNotPaused {
        uint256 amount = pendingRewards[user];
        require(amount > 0, "RewardVault: nothing to claim");

        pendingRewards[user] = 0;
        lastClaimEpoch[user] = currentEpoch;

        require(dnrToken.transfer(user, amount), "RewardVault: transfer failed");
        emit RewardsClaimed(user, amount, currentEpoch, block.timestamp);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function getPendingRewards(address user) external view returns (uint256) {
        return pendingRewards[user];
    }

    function getTotalEarned(address user) external view returns (uint256) {
        return totalEarned[user];
    }

    function vaultBalance() external view returns (uint256) {
        return dnrToken.balanceOf(address(this));
    }

    function nextEpochTimestamp() external view returns (uint256) {
        return lastEpochTimestamp + epochDuration;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function setDistributor(address _distributor) external onlyOwner {
        require(_distributor != address(0), "RewardVault: zero address");
        distributor = _distributor;
        emit DistributorUpdated(_distributor);
    }

    function setEpochDuration(uint256 _duration) external onlyOwner {
        require(_duration > 0, "RewardVault: zero duration");
        epochDuration = _duration;
        emit EpochDurationUpdated(_duration);
    }

    /**
     * @notice Emergency withdrawal of DNR to owner. Resets all pending rewards.
     *         Use only in critical situations — pending user rewards are lost.
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "RewardVault: zero amount");
        require(dnrToken.transfer(owner(), amount), "RewardVault: transfer failed");
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
