// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Math library for liquidity
library LiquidityMath {
    /// @notice Add a signed liquidity delta to liquidity and check for overflow/underflow
    /// @param x The liquidity before the delta was applied
    /// @param y The delta to be applied to liquidity
    /// @return z The liquidity after the delta was applied
    function addDelta(uint128 x, int128 y) internal pure returns (uint128 z) {
        if (y < 0) {
            require((z = x - uint128(-y)) < x, 'LS');
        } else {
            require((z = x + uint128(y)) >= x, 'LA');
        }
    }
}
