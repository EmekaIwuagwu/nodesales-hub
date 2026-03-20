// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ERC-4337 interfaces
struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

interface IEntryPoint {
    function depositTo(address account) external payable;
    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external;
    function addStake(uint32 unstakeDelaySec) external payable;
    function unlockStake() external;
    function withdrawStake(address payable withdrawAddress) external;
    function balanceOf(address account) external view returns (uint256);
    function getDepositInfo(address account) external view returns (
        uint112 deposit,
        bool staked,
        uint112 stake,
        uint32 unstakeDelaySec,
        uint48 withdrawTime
    );
}

interface IStabilityModule {
    function redeemDNRS(uint256 dnrsAmount) external;
}

enum PostOpMode { opSucceeded, opReverted, postOpReverted }

/**
 * @title DNRSPaymaster — ERC-4337 Gasless Payments for Kortana
 * @notice Allows users to pay ALL transaction gas in DNRS
 *         Users NEVER need DNR in their wallet
 *         This is the key UX innovation for BelloMundo and MyHealthFriend
 *
 * @dev Implementation of ERC-4337 Paymaster interface
 *      Integrated with DNRS stablecoin
 *
 * Flow:
 * 1. User creates UserOperation (Tx) in Kortana Wallet
 * 2. User's wallet specifies this Paymaster
 * 3. EntryPoint calls validatePaymasterUserOp
 * 4. Paymaster checks user has enough DNRS
 * 5. Paymaster pre-charges DNRS (holds in escrow)
 * 6. Transaction executes
 * 7. EntryPoint calls postOp
 * 8. Paymaster charges exact DNRS used, refunds excess
 * 9. Paymaster background: converts accumulated DNRS → DNR to stay funded
 *
 * Paymaster needs DNR balance in EntryPoint to function
 * Keep funded: monitor balance, top up from protocol revenue
 */
contract DNRSPaymaster is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Core contracts
    IEntryPoint public immutable entryPoint;
    IERC20 public dnrsToken;
    IStabilityModule public stabilityModule;

    // Gas pricing
    uint256 public gasMarkupBps = 1000; // 10% markup on gas costs
    uint256 public constant MAX_GAS_MARKUP = 3000; // max 30%

    // Minimum DNRS to use paymaster
    uint256 public minDNRSBalance = 1e16; // 0.01 DNRS minimum

    // Maximum gas per UserOperation
    uint256 public maxGasPerOp = 500_000;

    // Exchange rate: how much DNRS per unit of DNR gas
    // This is updated periodically from oracle
    uint256 public dnrsToDnrRate; // DNRS amount per 1 DNR of gas (1e18 scale)

    // Track pre-charged amounts per UserOperation
    mapping(bytes32 => uint256) public preChargedDNRS;

    // Accumulated DNRS to convert back to DNR
    uint256 public accumulatedDNRS;
    uint256 public autoConvertThreshold = 100 * 1e18; // Convert when 100 DNRS accumulated

    // Events
    event GasPaidInDNRS(
        address indexed user,
        bytes32 indexed userOpHash,
        uint256 dnrsCharged,
        uint256 actualGasCost,
        bool success
    );
    event RateUpdated(uint256 newRate, uint256 timestamp);
    event PaymasterFunded(uint256 amount, uint256 totalDeposit);
    event DNRSConverted(uint256 dnrsAmount, uint256 dnrReceived);
    event AutoConvertTriggered(uint256 dnrsAmount);

    constructor(
        address _entryPoint,
        address _dnrsToken,
        address _stabilityModule,
        uint256 _initialDnrsToDnrRate
    ) Ownable(msg.sender) {
        entryPoint = IEntryPoint(_entryPoint);
        dnrsToken = IERC20(_dnrsToken);
        stabilityModule = IStabilityModule(_stabilityModule);
        dnrsToDnrRate = _initialDnrsToDnrRate;
    }

    // ---- ERC-4337 REQUIRED: VALIDATE ----

    /**
     * @notice Called by EntryPoint to validate if this paymaster will pay for the UserOperation
     * @dev Returns validation data and context for postOp
     */
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData) {
        require(msg.sender == address(entryPoint), "Paymaster: not EntryPoint");

        // Check gas limit
        require(
            userOp.callGasLimit + userOp.verificationGasLimit <= maxGasPerOp,
            "Paymaster: gas limit exceeded"
        );

        // Calculate maximum DNRS cost with markup
        uint256 maxDNRSCost = _calculateDNRSCost(maxCost);

        // Check user has enough DNRS
        require(
            dnrsToken.balanceOf(userOp.sender) >= maxDNRSCost + minDNRSBalance,
            "Paymaster: insufficient DNRS balance"
        );

        // Check allowance
        require(
            dnrsToken.allowance(userOp.sender, address(this)) >= maxDNRSCost,
            "Paymaster: insufficient DNRS allowance"
        );

        // Pre-charge maximum DNRS (will refund excess in postOp)
        dnrsToken.safeTransferFrom(userOp.sender, address(this), maxDNRSCost);
        preChargedDNRS[userOpHash] = maxDNRSCost;

        // Encode context for postOp
        context = abi.encode(userOp.sender, userOpHash, maxDNRSCost);

        // validationData = 0 means valid (no time range restrictions)
        validationData = 0;

        return (context, validationData);
    }

    // ---- ERC-4337 REQUIRED: POST OP ----

    /**
     * @notice Called by EntryPoint after UserOperation execution
     * @dev Charges actual gas cost in DNRS, refunds excess
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external {
        require(msg.sender == address(entryPoint), "Paymaster: not EntryPoint");

        (address user, bytes32 userOpHash, uint256 preCharged) =
            abi.decode(context, (address, bytes32, uint256));

        // Calculate actual DNRS cost
        uint256 actualDNRSCost = _calculateDNRSCost(actualGasCost);

        // Refund excess DNRS to user
        if (preCharged > actualDNRSCost) {
            uint256 refund = preCharged - actualDNRSCost;
            dnrsToken.safeTransfer(user, refund);
        }

        // Accumulate DNRS for later conversion back to DNR
        accumulatedDNRS += actualDNRSCost;
        delete preChargedDNRS[userOpHash];

        bool success = (mode == PostOpMode.opSucceeded);
        emit GasPaidInDNRS(user, userOpHash, actualDNRSCost, actualGasCost, success);

        // Auto-convert DNRS → DNR when threshold reached
        if (accumulatedDNRS >= autoConvertThreshold) {
            _convertDNRSToFundPaymaster();
        }
    }

    // ---- INTERNAL: CONVERT DNRS BACK TO DNR ----

    /**
     * @notice Convert accumulated DNRS back to DNR to keep paymaster funded
     * @dev Uses stability module to redeem DNRS for DNR
     *      This is how the paymaster stays self-funded
     */
    function _convertDNRSToFundPaymaster() internal {
        uint256 toConvert = accumulatedDNRS;
        accumulatedDNRS = 0;

        // Approve stability module to take DNRS
        dnrsToken.approve(address(stabilityModule), toConvert);

        // Record DNR balance before
        uint256 dnrBefore = address(this).balance;

        // Redeem DNRS for DNR through stability module
        // NOTE: Stability module must be updated to send native DNR to caller
        stabilityModule.redeemDNRS(toConvert);

        uint256 dnrReceived = address(this).balance - dnrBefore;

        // Deposit DNR into EntryPoint
        if (dnrReceived > 0) {
            entryPoint.depositTo{value: dnrReceived}(address(this));
        }

        emit DNRSConverted(toConvert, dnrReceived);
        emit AutoConvertTriggered(toConvert);
    }

    // ---- PRICE CALCULATION ----

    /**
     * @notice Calculate DNRS cost for given gas cost in DNR
     * @param gasCostInDNR Gas cost denominated in DNR (wei)
     * @return DNRS amount required including markup
     */
    function _calculateDNRSCost(uint256 gasCostInDNR) internal view returns (uint256) {
        // Convert DNR gas cost to DNRS
        // dnrsToDnrRate = how many DNRS per 1 DNR (1e18 scale)
        uint256 baseCost = (gasCostInDNR * dnrsToDnrRate) / 1e18;

        // Add markup
        uint256 markup = (baseCost * gasMarkupBps) / 10000;
        return baseCost + markup;
    }

    function calculateDNRSCost(uint256 gasUsed, uint256 gasPrice) external view returns (uint256) {
        return _calculateDNRSCost(gasUsed * gasPrice);
    }

    // ---- MANAGEMENT ----

    // Fund the paymaster with native DNR
    function deposit() external payable onlyOwner {
        entryPoint.depositTo{value: msg.value}(address(this));
        emit PaymasterFunded(msg.value, entryPoint.balanceOf(address(this)));
    }

    // Add stake to EntryPoint (required for paymaster operation)
    function addStake(uint32 unstakeDelaySec) external payable onlyOwner {
        entryPoint.addStake{value: msg.value}(unstakeDelaySec);
    }

    function unlockStake() external onlyOwner {
        entryPoint.unlockStake();
    }

    function withdrawStake(address payable recipient) external onlyOwner {
        entryPoint.withdrawStake(recipient);
    }

    function withdrawDeposit(address payable recipient, uint256 amount) external onlyOwner {
        entryPoint.withdrawTo(recipient, amount);
    }

    // Update DNR/DNRS exchange rate from oracle
    function updateRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Paymaster: zero rate");
        dnrsToDnrRate = newRate;
        emit RateUpdated(newRate, block.timestamp);
    }

    function setGasMarkup(uint256 markupBps) external onlyOwner {
        require(markupBps <= MAX_GAS_MARKUP, "Paymaster: markup too high");
        gasMarkupBps = markupBps;
    }

    function setAutoConvertThreshold(uint256 threshold) external onlyOwner {
        autoConvertThreshold = threshold;
    }

    function setMinDNRSBalance(uint256 minBalance) external onlyOwner {
        minDNRSBalance = minBalance;
    }

    function manualConvert() external onlyOwner nonReentrant {
        _convertDNRSToFundPaymaster();
    }

    function getDeposit() external view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }

    receive() external payable {}
}
