// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PriceOracle — DNRS/USD TWAP Oracle
 * @notice Provides manipulation-resistant TWAP prices for the Treasury
 * @dev Two TWAP windows:
 *      → 12-hour TWAP: used by Treasury epoch decisions
 *      → 1-hour TWAP: used for rapid anomaly detection
 *
 * Price Sources (in priority):
 * 1. On-chain DEX cumulative price (preferred — manipulation resistant)
 * 2. Manual update (fallback — time-locked 1 hour before active)
 *
 * Testnet: Uses manual price feed initially (no DEX yet)
 * Mainnet: Connect to DNR/USDT pool on Kortana DEX or WhiteBIT price feed
 */
contract PriceOracle is AccessControl, ReentrancyGuard {

    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // TWAP configuration
    uint256 public constant TWAP_PERIOD_LONG = 12 hours;
    uint256 public constant TWAP_PERIOD_SHORT = 1 hours;
    uint256 public constant MAX_PRICE_DEVIATION = 2000; // 20% max change per update
    uint256 public constant STALE_THRESHOLD = 15 minutes;
    uint256 public constant MANUAL_UPDATE_TIMELOCK = 1 hours;

    // Price history for TWAP calculation
    struct PricePoint {
        uint256 price;      // Price in 1e18 units ($1 = 1e18)
        uint256 timestamp;
        bool isManual;
    }

    PricePoint[] public priceHistory;
    uint256 public constant MAX_PRICE_HISTORY = 100;

    // Pending manual price (time-locked)
    uint256 public pendingManualPrice;
    uint256 public pendingManualPriceTimestamp;
    bool public hasPendingManualPrice;

    // Current oracle mode
    bool public useManualPrice; // true on testnet, false when DEX available
    address public dexPool;     // DNR/USDT pool address

    // Events
    event PriceUpdated(uint256 price, uint256 timestamp, bool isManual);
    event ManualPriceQueued(uint256 price, uint256 activationTime);
    event ManualPriceActivated(uint256 price);
    event OracleModeChanged(bool useManual, address dexPool);

    constructor(
        uint256 initialPrice, // e.g., 1e18 for $1.00, or 124e13 for $0.00124
        address admin
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PRICE_UPDATER_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);

        useManualPrice = true; // Start with manual (testnet mode)
        priceHistory.push(PricePoint({
            price: initialPrice,
            timestamp: block.timestamp,
            isManual: true
        }));
    }

    // ---- TWAP CALCULATIONS ----

    /**
     * @notice Get 12-hour TWAP (used by Treasury for epoch decisions)
     */
    function getDNRSTWAP() external view returns (uint256) {
        return _calculateTWAP(TWAP_PERIOD_LONG);
    }

    /**
     * @notice Get 1-hour TWAP (used for rapid anomaly detection)
     */
    function getDNRSTWAPShort() external view returns (uint256) {
        return _calculateTWAP(TWAP_PERIOD_SHORT);
    }

    function _calculateTWAP(uint256 period) internal view returns (uint256) {
        if (priceHistory.length == 1) return priceHistory[0].price;

        uint256 cutoff = block.timestamp - period;
        uint256 weightedSum = 0;
        uint256 totalTime = 0;

        for (uint256 i = priceHistory.length - 1; i > 0; i--) {
            PricePoint memory current = priceHistory[i];
            PricePoint memory previous = priceHistory[i - 1];

            if (current.timestamp <= cutoff) break;

            uint256 startTime = previous.timestamp < cutoff ? cutoff : previous.timestamp;
            uint256 duration = current.timestamp - startTime;

            weightedSum += previous.price * duration;
            totalTime += duration;
        }

        if (totalTime == 0) return priceHistory[priceHistory.length - 1].price;
        return weightedSum / totalTime;
    }

    // ---- PRICE STALENESS ----

    function isDNRSPriceStale() external view returns (bool) {
        if (priceHistory.length == 0) return true;
        return block.timestamp - priceHistory[priceHistory.length - 1].timestamp > STALE_THRESHOLD;
    }

    // ---- PRICE UPDATES ----

    /**
     * @notice Queue a manual price update (time-locked for safety)
     * @dev Used on testnet. On mainnet, prefer DEX-based price.
     */
    function queueManualPriceUpdate(uint256 newPrice) external onlyRole(PRICE_UPDATER_ROLE) {
        require(newPrice > 0, "Oracle: zero price");

        // Check deviation from current price
        uint256 currentPrice = priceHistory[priceHistory.length - 1].price;
        uint256 deviation = newPrice > currentPrice
            ? ((newPrice - currentPrice) * 10000) / currentPrice
            : ((currentPrice - newPrice) * 10000) / currentPrice;
        require(deviation <= MAX_PRICE_DEVIATION, "Oracle: price deviation too high");

        pendingManualPrice = newPrice;
        pendingManualPriceTimestamp = block.timestamp;
        hasPendingManualPrice = true;

        emit ManualPriceQueued(newPrice, block.timestamp + MANUAL_UPDATE_TIMELOCK);
    }

    /**
     * @notice Activate pending manual price update after timelock
     */
    function activateManualPriceUpdate() external onlyRole(PRICE_UPDATER_ROLE) {
        require(hasPendingManualPrice, "Oracle: no pending price");
        require(
            block.timestamp >= pendingManualPriceTimestamp + MANUAL_UPDATE_TIMELOCK,
            "Oracle: timelock not expired"
        );

        _addPricePoint(pendingManualPrice, true);
        hasPendingManualPrice = false;

        emit ManualPriceActivated(pendingManualPrice);
    }

    /**
     * @notice Immediate price update — only for guardian in emergency
     */
    function emergencyPriceUpdate(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newPrice > 0, "Oracle: zero price");
        _addPricePoint(newPrice, true);
    }

    function _addPricePoint(uint256 price, bool isManual) internal {
        if (priceHistory.length >= MAX_PRICE_HISTORY) {
            // Shift array (remove oldest)
            for (uint256 i = 0; i < priceHistory.length - 1; i++) {
                priceHistory[i] = priceHistory[i + 1];
            }
            priceHistory.pop();
        }
        priceHistory.push(PricePoint({
            price: price,
            timestamp: block.timestamp,
            isManual: isManual
        }));
        emit PriceUpdated(price, block.timestamp, isManual);
    }

    // ---- CONFIGURATION ----

    function setDEXPool(address _dexPool) external onlyRole(OPERATOR_ROLE) {
        dexPool = _dexPool;
        useManualPrice = (_dexPool == address(0));
        emit OracleModeChanged(useManualPrice, _dexPool);
    }

    function getPriceDeviation() external view returns (uint256 deviation, bool abovePeg) {
        uint256 twap = _calculateTWAP(TWAP_PERIOD_LONG);
        uint256 target = 1e18;
        if (twap >= target) {
            return (((twap - target) * 10000) / target, true);
        } else {
            return (((target - twap) * 10000) / target, false);
        }
    }

    function getCurrentPrice() external view returns (uint256) {
        if (priceHistory.length == 0) return 1e18;
        return priceHistory[priceHistory.length - 1].price;
    }
}
