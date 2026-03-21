// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IKortanaPool.sol";
import "./libraries/Position.sol";
import "./libraries/TickMath.sol";
import "./libraries/PoolAddress.sol";
import "./libraries/TransferHelper.sol";
import "./base/PeripheryImmutableState.sol";
import "./base/PeripheryPayments.sol";
import "./interfaces/IKortanaMintCallback.sol";

contract NonfungiblePositionManager is 
    ERC721, 
    ERC721Enumerable, 
    ReentrancyGuard, 
    PeripheryImmutableState, 
    PeripheryPayments,
    IKortanaMintCallback 
{
    struct PositionInfo {
        uint96 nonce;
        address operator;
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    uint176 private _nextId = 1;
    mapping(uint256 => PositionInfo) private _positions;

    constructor(address _factory, address _wdnr) 
        ERC721("Kortana LP Position", "K-LP") 
        PeripheryImmutableState(_factory, _wdnr) 
    {}

    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function mint(MintParams calldata params) 
        external 
        payable 
        checkDeadline(params.deadline) 
        returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) 
    {
        // Pool layout for KortanaSwap: token0, token1, fee
        address pool = PoolAddress.computeAddress(factory, PoolAddress.getPoolKey(params.token0, params.token1, params.fee));
        
        // This is a simplified mint. A full implementation would calculate liquidity from amount0/amount1
        // For now, let's assume UI provides a reasonable liquidity delta expectation or we calculate it.
        // Simplified version:
        liquidity = 1000000; // Placeholder for actual calculation logic

        (amount0, amount1) = IKortanaPool(pool).mint(
            address(this),
            params.tickLower,
            params.tickUpper,
            liquidity,
            abi.encode(msg.sender)
        );

        tokenId = _nextId++;
        _safeMint(params.recipient, tokenId);

        _positions[tokenId] = PositionInfo({
            nonce: 0,
            operator: address(0),
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            liquidity: liquidity,
            feeGrowthInside0LastX128: 0,
            feeGrowthInside1LastX128: 0,
            tokensOwed0: 0,
            tokensOwed1: 0
        });
    }

    function kortanaMintCallback(uint256 amount0, uint256 amount1, bytes calldata data) external override {
        address sender = abi.decode(data, (address));
        // Validate caller is a pool deployed by our factory
        // pay back
        if (amount0 > 0) pay(IKortanaPool(msg.sender).token0(), sender, msg.sender, amount0);
        if (amount1 > 0) pay(IKortanaPool(msg.sender).token1(), sender, msg.sender, amount1);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
