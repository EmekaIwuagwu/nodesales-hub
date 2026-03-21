// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

/**
 * @title SwapRouter
 * @notice Routes swaps through KortanaSwap pools
 */

import "./interfaces/ISwapRouter.sol";
import "./interfaces/IKortanaPool.sol";
import "./interfaces/IKortanaSwapCallback.sol";
import "./libraries/Path.sol";
import "./libraries/PoolAddress.sol";
import "./libraries/CallbackValidation.sol";
import "./libraries/TransferHelper.sol";
import "./base/PeripheryPayments.sol";
import "./base/PeripheryImmutableState.sol";
import "./libraries/SafeCast.sol";
import "./libraries/TickMath.sol";

contract SwapRouter is
    ISwapRouter,
    IKortanaSwapCallback,
    PeripheryImmutableState,
    PeripheryPayments
{
    using Path for bytes;
    using SafeCast for uint256;

    // Cache for swap callbacks
    struct SwapCallbackData {
        bytes path;
        address payer;
    }

    constructor(address _factory, address _WDNR) 
        PeripheryImmutableState(_factory, _WDNR) {}

    // ---- CALLBACK ----

    function kortanaSwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata _data
    ) external override {
        require(amount0Delta > 0 || amount1Delta > 0, "SwapRouter: ZERO_DELTA");

        SwapCallbackData memory data = abi.decode(_data, (SwapCallbackData));
        (address tokenIn, address tokenOut, uint24 fee) = data.path.decodeFirstPool();

        CallbackValidation.verifyCallback(factory, tokenIn, tokenOut, fee);

        (bool isExactInput, uint256 amountToPay) = amount0Delta > 0
            ? (tokenIn < tokenOut, uint256(amount0Delta))
            : (tokenOut < tokenIn, uint256(amount1Delta));

        if (isExactInput) {
            pay(tokenIn, data.payer, msg.sender, amountToPay);
        } else {
            if (data.path.hasMultiplePools()) {
                data.path = data.path.skipToken();
                exactOutputInternal(amountToPay, msg.sender, 0, data);
            } else {
                pay(tokenOut, data.payer, msg.sender, amountToPay);
            }
        }
    }

    // ---- EXACT INPUT SINGLE ----

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountOut)
    {
        amountOut = exactInputInternal(
            params.amountIn,
            params.recipient,
            params.sqrtPriceLimitX96,
            SwapCallbackData({
                path: abi.encodePacked(
                    params.tokenIn,
                    params.fee,
                    params.tokenOut
                ),
                payer: msg.sender
            })
        );
        require(
            amountOut >= params.amountOutMinimum,
            "SwapRouter: INSUFFICIENT_OUTPUT"
        );
    }

    // ---- EXACT INPUT MULTI-HOP ----

    function exactInput(ExactInputParams memory params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountOut)
    {
        address payer = msg.sender;

        while (true) {
            bool hasMultiplePools = params.path.hasMultiplePools();

            params.amountIn = exactInputInternal(
                params.amountIn,
                hasMultiplePools ? address(this) : params.recipient,
                0,
                SwapCallbackData({
                    path: params.path.getFirstPool(),
                    payer: payer
                })
            );

            if (hasMultiplePools) {
                payer = address(this);
                params.path = params.path.skipToken();
            } else {
                amountOut = params.amountIn;
                break;
            }
        }
        require(
            amountOut >= params.amountOutMinimum,
            "SwapRouter: INSUFFICIENT_OUTPUT"
        );
    }

    // ---- EXACT OUTPUT SINGLE ----

    function exactOutputSingle(ExactOutputSingleParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountIn)
    {
        amountIn = exactOutputInternal(
            params.amountOut,
            params.recipient,
            params.sqrtPriceLimitX96,
            SwapCallbackData({
                path: abi.encodePacked(
                    params.tokenOut,
                    params.fee,
                    params.tokenIn
                ),
                payer: msg.sender
            })
        );
        require(
            amountIn <= params.amountInMaximum,
            "SwapRouter: EXCESSIVE_INPUT"
        );
    }

    // ---- EXACT OUTPUT MULTI-HOP ----

    function exactOutput(ExactOutputParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountIn)
    {
        exactOutputInternal(
            params.amountOut,
            params.recipient,
            0,
            SwapCallbackData({ path: params.path, payer: msg.sender })
        );
        amountIn = amountInCached;
        require(
            amountIn <= params.amountInMaximum,
            "SwapRouter: EXCESSIVE_INPUT"
        );
        amountInCached = DEFAULT_AMOUNT_IN_CACHED;
    }

    // ---- INTERNAL ----

    function exactInputInternal(
        uint256 amountIn,
        address recipient,
        uint160 sqrtPriceLimitX96,
        SwapCallbackData memory data
    ) private returns (uint256 amountOut) {
        if (recipient == address(0)) recipient = address(this);

        (address tokenIn, address tokenOut, uint24 fee) = data
            .path
            .decodeFirstPool();

        bool zeroForOne = tokenIn < tokenOut;

        (int256 amount0, int256 amount1) = IKortanaPool(getPool(tokenIn, tokenOut, fee)).swap(
            recipient,
            zeroForOne,
            amountIn.toInt256(),
            sqrtPriceLimitX96 == 0
                ? (
                    zeroForOne
                        ? TickMath.MIN_SQRT_RATIO + 1
                        : TickMath.MAX_SQRT_RATIO - 1
                )
                : sqrtPriceLimitX96,
            abi.encode(data)
        );

        return uint256(-(zeroForOne ? amount1 : amount0));
    }

    uint256 private constant DEFAULT_AMOUNT_IN_CACHED = type(uint256).max;
    uint256 private amountInCached = DEFAULT_AMOUNT_IN_CACHED;

    function exactOutputInternal(
        uint256 amountOut,
        address recipient,
        uint160 sqrtPriceLimitX96,
        SwapCallbackData memory data
    ) private returns (uint256 amountIn) {
        if (recipient == address(0)) recipient = address(this);

        (address tokenOut, address tokenIn, uint24 fee) = data
            .path
            .decodeFirstPool();

        bool zeroForOne = tokenIn < tokenOut;

        (int256 amount0Delta, int256 amount1Delta) = IKortanaPool(getPool(
            tokenIn,
            tokenOut,
            fee
        )).swap(
            recipient,
            zeroForOne,
            -amountOut.toInt256(),
            sqrtPriceLimitX96 == 0
                ? (
                    zeroForOne
                        ? TickMath.MIN_SQRT_RATIO + 1
                        : TickMath.MAX_SQRT_RATIO - 1
                )
                : sqrtPriceLimitX96,
            abi.encode(data)
        );

        uint256 amountOutReceived;
        (amountIn, amountOutReceived) = zeroForOne
            ? (uint256(amount0Delta), uint256(-amount1Delta))
            : (uint256(amount1Delta), uint256(-amount0Delta));

        if (sqrtPriceLimitX96 == 0)
            require(
                amountOutReceived == amountOut,
                "SwapRouter: INVALID_AMOUNT"
            );

        amountInCached = amountIn;
    }

    function getPool(address tokenA, address tokenB, uint24 fee) private view returns (address) {
        return PoolAddress.computeAddress(factory, PoolAddress.getPoolKey(tokenA, tokenB, fee));
    }
}
