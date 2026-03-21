// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

/**
 * @title KortanaFactory
 * @notice Deploys KortanaSwap pools and manages protocol ownership
 * @dev Uniswap V3 style factory with concentrated liquidity pools
 *
 * Supported Fee Tiers:
 * → 100   (0.01%) — Stable pairs (DNRS/USDT)
 * → 500   (0.05%) — Correlated pairs
 * → 3000  (0.30%) — Standard pairs (DNR/USDT, DNR/DNRS)
 * → 10000 (1.00%) — Exotic pairs
 *
 * Kortana Chains:
 * → Testnet: 72511
 * → Mainnet: 9002
 */

import "./interfaces/IKortanaFactory.sol";
import "./KortanaPoolDeployer.sol";
import "./NoDelegateCall.sol";
import "./interfaces/IKortanaPool.sol";

contract KortanaFactory is IKortanaFactory, KortanaPoolDeployer, NoDelegateCall {

    // ============================================================
    // STATE
    // ============================================================

    address public override owner;
    address public override feeCollector; // Kortana Foundation treasury

    // feeAmountTickSpacing: fee => tickSpacing
    mapping(uint24 => int24) public override feeAmountTickSpacing;

    // getPool: token0 => token1 => fee => poolAddress
    mapping(address => mapping(address => mapping(uint24 => address)))
        public override getPool;

    // All deployed pools
    address[] public allPools;

    // Protocol fee: numerator/denominator (max 10%)
    uint8 public override feeProtocol; // default 0, max 10

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor(address _feeCollector) {
        owner = msg.sender;
        feeCollector = _feeCollector;
        emit OwnerChanged(address(0), msg.sender);

        // Initialize fee tiers
        _enableFeeAmount(100, 1);       // 0.01% — tick spacing 1
        _enableFeeAmount(500, 10);      // 0.05% — tick spacing 10
        _enableFeeAmount(3000, 60);     // 0.30% — tick spacing 60
        _enableFeeAmount(10000, 200);   // 1.00%  — tick spacing 200
    }

    // ============================================================
    // POOL CREATION
    // ============================================================

    /**
     * @notice Creates a new pool for the given token pair and fee tier
     * @dev tokenA and tokenB may be passed in either order
     * @param tokenA First token of the pair
     * @param tokenB Second token of the pair
     * @param fee Fee tier for the pool
     * @return pool Address of the created pool
     */
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external override noDelegateCall returns (address pool) {
        require(tokenA != tokenB, "KortanaFactory: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "KortanaFactory: ZERO_ADDRESS");
        require(feeAmountTickSpacing[fee] != 0, "KortanaFactory: FEE_NOT_ENABLED");
        require(
            getPool[token0][token1][fee] == address(0),
            "KortanaFactory: POOL_EXISTS"
        );

        int24 tickSpacing = feeAmountTickSpacing[fee];
        pool = deploy(address(this), token0, token1, fee, tickSpacing);

        getPool[token0][token1][fee] = pool;
        getPool[token1][token0][fee] = pool;
        allPools.push(pool);

        emit PoolCreated(token0, token1, fee, tickSpacing, pool);
    }

    // ============================================================
    // ADMIN
    // ============================================================

    function setOwner(address _owner) external override {
        require(msg.sender == owner, "KortanaFactory: NOT_OWNER");
        emit OwnerChanged(owner, _owner);
        owner = _owner;
    }

    function setFeeCollector(address _feeCollector) external {
        require(msg.sender == owner, "KortanaFactory: NOT_OWNER");
        feeCollector = _feeCollector;
    }

    function enableFeeAmount(uint24 fee, int24 tickSpacing) external override {
        require(msg.sender == owner, "KortanaFactory: NOT_OWNER");
        _enableFeeAmount(fee, tickSpacing);
    }

    function _enableFeeAmount(uint24 fee, int24 tickSpacing) internal {
        require(fee < 1000000, "KortanaFactory: FEE_TOO_LARGE");
        require(tickSpacing > 0 && tickSpacing < 16384, "KortanaFactory: INVALID_TICK_SPACING");
        require(feeAmountTickSpacing[fee] == 0, "KortanaFactory: FEE_ALREADY_ENABLED");
        feeAmountTickSpacing[fee] = tickSpacing;
        emit FeeAmountEnabled(fee, tickSpacing);
    }

    function setFeeProtocol(uint8 _feeProtocol) external {
        require(msg.sender == owner, "KortanaFactory: NOT_OWNER");
        require(_feeProtocol <= 10, "KortanaFactory: PROTOCOL_FEE_TOO_HIGH");
        feeProtocol = _feeProtocol;
        emit SetFeeProtocol(feeProtocol, _feeProtocol);
    }

    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }

    function collectProtocol(
        address pool,
        address recipient,
        uint128 amount0Requested,
        uint128 amount1Requested
    ) external returns (uint128 amount0, uint128 amount1) {
        require(msg.sender == owner, "KortanaFactory: NOT_OWNER");
        return IKortanaPool(pool).collectProtocol(
            recipient,
            amount0Requested,
            amount1Requested
        );
    }
}
