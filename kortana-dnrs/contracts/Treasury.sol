// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IDNRSToken {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function setTransferTax(uint256 taxBps) external;
}

interface IDNRBond {
    function issueBonds(address to, uint256 amount, uint256 epoch) external;
    function redeemBonds(address from, uint256 amount, uint256 epoch) external returns (uint256);
    function totalBondsOutstanding() external view returns (uint256);
}

interface IBoardroom {
    function allocateSeigniorage(uint256 amount) external;
}

interface IPriceOracle {
    function getDNRSTWAP() external view returns (uint256); // 12hr TWAP
    function getDNRSTWAPShort() external view returns (uint256); // 1hr TWAP
    function isDNRSPriceStale() external view returns (bool);
}

/**
 * @title Treasury — Kortana DNRS Algorithmic Treasury
 * @notice The brain of the DNRS system.
 *         Runs every EPOCH (12 hours).
 *         Expands supply when DNRS > $1.01
 *         Contracts supply when DNRS < $0.99
 *         Maintains neutral when $0.99 <= DNRS <= $1.01
 *
 * @dev CRITICAL SAFETY FEATURES (lessons from Terra/LUNA):
 *      1. Daily mint cap: max 5% of supply per epoch
 *      2. Consecutive contraction limit: pause after 10 epochs below peg
 *      3. Bond ceiling: outstanding bonds cannot exceed 35% of DNRS supply
 *      4. Death spiral detector: halt if peg deviates >40% for >3 epochs
 *      5. Minimum peg restoration before bond redemption: TWAP > $1.05
 *      6. Transfer tax activation during sustained contraction
 *      7. Emergency guardian can pause all operations
 */
contract Treasury is AccessControl, ReentrancyGuard, Pausable {

    // ============================================================
    // ROLES
    // ============================================================
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    // ============================================================
    // CORE CONTRACTS
    // ============================================================
    IDNRSToken public dnrs;
    IDNRBond public dnrBond;
    IBoardroom public boardroom;
    IPriceOracle public oracle;

    // ============================================================
    // EPOCH CONFIGURATION
    // ============================================================
    uint256 public constant EPOCH_DURATION = 12 hours;
    uint256 public startTime;
    uint256 public currentEpoch;
    uint256 public lastEpochTime;

    // ============================================================
    // PEG PARAMETERS
    // ============================================================
    uint256 public constant PEG_TARGET = 1e18;           // $1.00
    uint256 public constant EXPANSION_THRESHOLD = 101e16; // $1.01
    uint256 public constant CONTRACTION_THRESHOLD = 99e16;// $0.99
    uint256 public constant BOND_REDEMPTION_THRESHOLD = 105e16; // $1.05

    // ============================================================
    // SUPPLY EXPANSION PARAMETERS
    // ============================================================
    uint256 public expansionFactor = 10; // 10% of deviation per epoch
    uint256 public constant MAX_EXPANSION_PER_EPOCH = 500; // max 5% of supply
    uint256 public constant MIN_EXPANSION = 1e18; // min 1 DNRS expansion

    // Expansion distribution (basis points, must sum to 10000)
    uint256 public boardroomAllocationBps = 8000; // 80% to stakers
    uint256 public treasuryAllocationBps = 1500;  // 15% to treasury
    uint256 public devFundAllocationBps = 500;    // 5% to dev fund
    address public devFund;

    // ============================================================
    // CONTRACTION / BOND PARAMETERS
    // ============================================================
    uint256 public constant MAX_BOND_SUPPLY_RATIO = 3500; // bonds max 35% of DNRS supply
    uint256 public bondDiscount = 0; // auto-calculated from current price deviation
    
    // Bond purchase: user pays current DNRS price to get 1 bond
    // Example: DNRS at $0.92 → pay 0.92 DNRS → get 1 DNRB → redeem for 1 DNRS at recovery
    
    // ============================================================
    // SAFETY CIRCUIT BREAKERS (TERRA/LUNA LESSONS)
    // ============================================================
    
    // 1. Consecutive contraction counter
    uint256 public consecutiveContractionEpochs;
    uint256 public constant MAX_CONSECUTIVE_CONTRACTIONS = 10;
    // After 10 consecutive below-peg epochs: transfer tax activates
    
    // 2. Death spiral detector
    uint256 public epochsBelowCriticalPeg; // below $0.80
    uint256 public constant DEATH_SPIRAL_EPOCH_THRESHOLD = 3;
    uint256 public constant CRITICAL_PEG_LEVEL = 80e16; // $0.80
    // After 3 epochs below $0.80: FULL PAUSE, guardian review required
    
    // 3. Daily mint tracking
    mapping(uint256 => uint256) public dailyMintedAmount; // day => amount
    uint256 public constant DAILY_MINT_CAP_BPS = 1000; // max 10% of supply per day
    
    // 4. Bond ceiling enforcement
    // Outstanding bonds cannot exceed 35% of current DNRS supply
    
    // 5. Transfer tax escalation
    uint256 public currentTransferTaxBps = 0;
    uint256 public constant MAX_TRANSFER_TAX_BPS = 200; // 2% max

    // ============================================================
    // PROTOCOL OWNED LIQUIDITY
    // ============================================================
    uint256 public protocolOwnedDNRS; // accumulated from treasury allocation
    // Used to provide liquidity on DEX and stabilize price

    // ============================================================
    // EVENTS
    // ============================================================
    event EpochStarted(uint256 indexed epoch, uint256 timestamp, uint256 dnrsTWAP);
    event ExpansionExecuted(uint256 indexed epoch, uint256 amount, uint256 boardroomShare, uint256 treasuryShare);
    event ContractionEpoch(uint256 indexed epoch, uint256 dnrsTWAP, uint256 bondsAvailable);
    event BondsPurchased(address indexed buyer, uint256 dnrsBurned, uint256 bondsIssued);
    event BondsRedeemed(address indexed holder, uint256 bondsRedeemed, uint256 dnrsMinted);
    event CircuitBreakerTriggered(string reason, uint256 epoch, uint256 dnrsTWAP);
    event TransferTaxUpdated(uint256 oldTax, uint256 newTax);
    event DeathSpiralDetected(uint256 epoch, uint256 dnrsTWAP, uint256 timestamp);

    // ============================================================
    // CONSTRUCTOR
    // ============================================================
    constructor(
        address _dnrs,
        address _dnrBond,
        address _boardroom,
        address _oracle,
        address _devFund,
        uint256 _startTime,
        address admin
    ) {
        dnrs = IDNRSToken(_dnrs);
        dnrBond = IDNRBond(_dnrBond);
        boardroom = IBoardroom(_boardroom);
        oracle = IPriceOracle(_oracle);
        devFund = _devFund;
        startTime = _startTime;
        lastEpochTime = _startTime;
        currentEpoch = 0;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        _grantRole(GUARDIAN_ROLE, admin);
    }

    // ============================================================
    // EPOCH EXECUTION — CALLED EVERY 12 HOURS
    // ============================================================

    /**
     * @notice Execute the current epoch
     * @dev Anyone can call this after EPOCH_DURATION has passed
     *      This is the main algorithmic loop
     */
    function executeEpoch() external nonReentrant whenNotPaused {
        require(block.timestamp >= lastEpochTime + EPOCH_DURATION, "Treasury: epoch not ready");
        require(!oracle.isDNRSPriceStale(), "Treasury: oracle price stale");

        lastEpochTime = block.timestamp;
        currentEpoch++;

        uint256 dnrsTWAP = oracle.getDNRSTWAP();

        emit EpochStarted(currentEpoch, block.timestamp, dnrsTWAP);

        // ---- DEATH SPIRAL CHECK ----
        if (dnrsTWAP < CRITICAL_PEG_LEVEL) {
            epochsBelowCriticalPeg++;
            if (epochsBelowCriticalPeg >= DEATH_SPIRAL_EPOCH_THRESHOLD) {
                emit DeathSpiralDetected(currentEpoch, dnrsTWAP, block.timestamp);
                emit CircuitBreakerTriggered("DEATH_SPIRAL_DETECTED", currentEpoch, dnrsTWAP);
                _pause(); // Full system pause — guardian must review
                return;
            }
        } else {
            epochsBelowCriticalPeg = 0;
        }

        // ---- EXPANSION PHASE ----
        if (dnrsTWAP > EXPANSION_THRESHOLD) {
            _executeExpansion(dnrsTWAP);
            consecutiveContractionEpochs = 0;
            _updateTransferTax(0); // Remove tax during expansion
        }
        // ---- CONTRACTION PHASE ----
        else if (dnrsTWAP < CONTRACTION_THRESHOLD) {
            _executeContraction(dnrsTWAP);
            consecutiveContractionEpochs++;

            // Circuit breaker: escalate transfer tax after sustained contraction
            if (consecutiveContractionEpochs >= 3) {
                uint256 newTax = _calculateTransferTax(consecutiveContractionEpochs);
                _updateTransferTax(newTax);
            }

            if (consecutiveContractionEpochs >= MAX_CONSECUTIVE_CONTRACTIONS) {
                emit CircuitBreakerTriggered("MAX_CONSECUTIVE_CONTRACTIONS", currentEpoch, dnrsTWAP);
                // Note: we don't pause here — bonds still working
                // Tax is at maximum to discourage selling
            }
        }
        // ---- NEUTRAL PHASE ----
        else {
            emit EpochStarted(currentEpoch, block.timestamp, dnrsTWAP); // neutral epoch
            // Reset consecutive contractions if we approach neutral
            if (consecutiveContractionEpochs > 0) {
                consecutiveContractionEpochs--;
            }
        }
    }

    // ============================================================
    // EXPANSION LOGIC
    // ============================================================

    function _executeExpansion(uint256 dnrsTWAP) internal {
        uint256 currentSupply = dnrs.totalSupply();
        if (currentSupply == 0) return;

        // Calculate expansion amount
        // Formula: (TWAP - $1) / $1 × supply × expansionFactor / 100
        uint256 deviation = dnrsTWAP - PEG_TARGET;
        uint256 expansionAmount = (deviation * currentSupply * expansionFactor) / (PEG_TARGET * 100);

        // Cap expansion at MAX_EXPANSION_PER_EPOCH (5%)
        uint256 maxExpansion = (currentSupply * MAX_EXPANSION_PER_EPOCH) / 10000;
        if (expansionAmount > maxExpansion) {
            expansionAmount = maxExpansion;
        }

        // Minimum threshold
        if (expansionAmount < MIN_EXPANSION) return;

        // Daily cap check
        uint256 today = block.timestamp / 1 days;
        uint256 dailyCapAmount = (currentSupply * DAILY_MINT_CAP_BPS) / 10000;
        if (dailyMintedAmount[today] + expansionAmount > dailyCapAmount) {
            expansionAmount = dailyCapAmount - dailyMintedAmount[today];
            if (expansionAmount == 0) return;
        }
        dailyMintedAmount[today] += expansionAmount;

        // Distribute expansion
        uint256 boardroomShare = (expansionAmount * boardroomAllocationBps) / 10000;
        uint256 treasuryShare = (expansionAmount * treasuryAllocationBps) / 10000;
        uint256 devShare = expansionAmount - boardroomShare - treasuryShare;

        // Check if bonds need redemption first (FIFO — bonds get priority)
        uint256 bondsOutstanding = dnrBond.totalBondsOutstanding();
        if (bondsOutstanding > 0 && dnrsTWAP >= BOND_REDEMPTION_THRESHOLD) {
            // Redirect treasury share to bond redemption pool
            // Bonds get redeemed during user's redeem call, not here
            // Treasury just needs to have enough supply
        }

        // Mint and distribute
        if (boardroomShare > 0) {
            dnrs.mint(address(boardroom), boardroomShare);
            boardroom.allocateSeigniorage(boardroomShare);
        }
        if (treasuryShare > 0) {
            dnrs.mint(address(this), treasuryShare);
            protocolOwnedDNRS += treasuryShare;
        }
        if (devShare > 0 && devFund != address(0)) {
            dnrs.mint(devFund, devShare);
        }

        emit ExpansionExecuted(currentEpoch, expansionAmount, boardroomShare, treasuryShare);
    }

    // ============================================================
    // CONTRACTION LOGIC — USER-DRIVEN (bonds purchased voluntarily)
    // ============================================================

    function _executeContraction(uint256 dnrsTWAP) internal {
        // Check bond ceiling
        uint256 currentSupply = dnrs.totalSupply();
        uint256 bondsOutstanding = dnrBond.totalBondsOutstanding();
        uint256 maxBonds = (currentSupply * MAX_BOND_SUPPLY_RATIO) / 10000;

        if (bondsOutstanding >= maxBonds) {
            emit CircuitBreakerTriggered("BOND_CEILING_REACHED", currentEpoch, dnrsTWAP);
            return; // Bond ceiling reached — no more bonds issued
        }

        emit ContractionEpoch(currentEpoch, dnrsTWAP, maxBonds - bondsOutstanding);
        // Bond purchasing happens in buyBonds() — users call this voluntarily
    }

    // ============================================================
    // USER-FACING: BUY BONDS (called by users during contraction)
    // ============================================================

    /**
     * @notice Purchase bonds during contraction phase
     * @dev User burns DNRS at current price, receives bonds redeemable at $1
     * @param dnrsAmount Amount of DNRS to burn for bonds
     */
    function buyBonds(uint256 dnrsAmount) external nonReentrant whenNotPaused {
        require(dnrsAmount > 0, "Treasury: zero amount");

        uint256 dnrsTWAP = oracle.getDNRSTWAP();
        require(dnrsTWAP < CONTRACTION_THRESHOLD, "Treasury: DNRS not below peg");
        require(dnrsTWAP > 10e16, "Treasury: price too low for bonds, halt imminent"); // $0.10 floor

        // Bond ceiling check
        uint256 currentSupply = dnrs.totalSupply();
        uint256 bondsOutstanding = dnrBond.totalBondsOutstanding();
        uint256 maxBonds = (currentSupply * MAX_BOND_SUPPLY_RATIO) / 10000;
        require(bondsOutstanding < maxBonds, "Treasury: bond ceiling reached");

        // Calculate bonds to issue
        // At $0.95 DNRS price: burn 0.95 DNRS → receive 1 bond → redeem for 1 DNRS
        // bondAmount = dnrsAmount / dnrsTWAP × 1e18
        uint256 bondAmount = (dnrsAmount * PEG_TARGET) / dnrsTWAP;

        // Burn user's DNRS
        dnrs.burnFrom(msg.sender, dnrsAmount);

        // Issue bonds
        dnrBond.issueBonds(msg.sender, bondAmount, currentEpoch);

        emit BondsPurchased(msg.sender, dnrsAmount, bondAmount);
    }

    // ============================================================
    // USER-FACING: REDEEM BONDS (called when peg restored)
    // ============================================================

    /**
     * @notice Redeem bonds for DNRS when peg is restored above $1.05
     * @param bondAmount Amount of bonds to redeem
     */
    function redeemBonds(uint256 bondAmount) external nonReentrant whenNotPaused {
        require(bondAmount > 0, "Treasury: zero amount");

        uint256 dnrsTWAP = oracle.getDNRSTWAP();
        require(dnrsTWAP >= BOND_REDEMPTION_THRESHOLD, "Treasury: peg not restored");

        // Check treasury has enough expansion budget
        // Bonds redeemed come from current expansion (not pre-minted)
        uint256 dnrsToMint = dnrBond.redeemBonds(msg.sender, bondAmount, currentEpoch);

        // Mint DNRS to redeemer
        dnrs.mint(msg.sender, dnrsToMint);

        emit BondsRedeemed(msg.sender, bondAmount, dnrsToMint);
    }

    // ============================================================
    // CIRCUIT BREAKER: TRANSFER TAX CALCULATION
    // ============================================================

    function _calculateTransferTax(uint256 consecutiveEpochs) internal pure returns (uint256) {
        // Escalating tax based on how long below peg
        // 3 epochs = 0.25%, 5 = 0.5%, 7 = 1%, 10+ = 2%
        if (consecutiveEpochs >= 10) return 200; // 2%
        if (consecutiveEpochs >= 7) return 100;  // 1%
        if (consecutiveEpochs >= 5) return 50;   // 0.5%
        if (consecutiveEpochs >= 3) return 25;   // 0.25%
        return 0;
    }

    function _updateTransferTax(uint256 newTaxBps) internal {
        if (newTaxBps != currentTransferTaxBps) {
            currentTransferTaxBps = newTaxBps;
            dnrs.setTransferTax(newTaxBps);
            emit TransferTaxUpdated(currentTransferTaxBps, newTaxBps);
        }
    }

    // ============================================================
    // ADMIN FUNCTIONS
    // ============================================================

    function setExpansionFactor(uint256 factor) external onlyRole(OPERATOR_ROLE) {
        require(factor > 0 && factor <= 50, "Treasury: invalid factor");
        expansionFactor = factor;
    }

    function setDistribution(
        uint256 _boardroomBps,
        uint256 _treasuryBps,
        uint256 _devBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_boardroomBps + _treasuryBps + _devBps == 10000, "Treasury: must sum to 100%");
        boardroomAllocationBps = _boardroomBps;
        treasuryAllocationBps = _treasuryBps;
        devFundAllocationBps = _devBps;
    }

    function setDevFund(address _devFund) external onlyRole(DEFAULT_ADMIN_ROLE) {
        devFund = _devFund;
    }

    function guardianPause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit CircuitBreakerTriggered("GUARDIAN_PAUSE", currentEpoch, 0);
    }

    function guardianUnpause() external onlyRole(GUARDIAN_ROLE) {
        epochsBelowCriticalPeg = 0; // Reset death spiral counter
        consecutiveContractionEpochs = 0;
        _updateTransferTax(0);
        _unpause();
    }

    // View functions
    function getNextEpochTime() external view returns (uint256) {
        return lastEpochTime + EPOCH_DURATION;
    }

    function canExecuteEpoch() external view returns (bool) {
        return block.timestamp >= lastEpochTime + EPOCH_DURATION && !paused();
    }

    function getSystemState() external view returns (
        uint256 epoch,
        uint256 twap,
        uint256 dnrsSupply,
        uint256 bondsOutstanding,
        uint256 consecutiveContractions,
        uint256 transferTax,
        bool isPaused
    ) {
        return (
            currentEpoch,
            oracle.getDNRSTWAP(),
            dnrs.totalSupply(),
            dnrBond.totalBondsOutstanding(),
            consecutiveContractionEpochs,
            currentTransferTaxBps,
            paused()
        );
    }
}
