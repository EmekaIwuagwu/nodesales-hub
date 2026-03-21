// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Safe casting methods
/// @notice Contains methods for safely casting between types
library SafeCast {
    /// @notice Cast a uint256 to a uint160
    /// @param y The uint256 to be casted
    /// @return z The uint160 casted value
    function toUint160(uint256 y) internal pure returns (uint160 z) {
        require((z = uint160(y)) == y);
    }

    /// @notice Cast a uint256 to a uint128
    /// @param y The uint256 to be casted
    /// @return z The uint128 casted value
    function toUint128(uint256 y) internal pure returns (uint128 z) {
        require((z = uint128(y)) == y);
    }

    /// @notice Cast a uint256 to a int256
    /// @param y The uint256 to be casted
    /// @return z The int256 casted value
    function toInt256(uint256 y) internal pure returns (int256 z) {
        require(y < 2**255);
        z = int256(y);
    }

    /// @notice Cast a int256 to a int128
    /// @param y The int256 to be casted
    /// @return z The int128 casted value
    function toInt128(int256 y) internal pure returns (int128 z) {
        require(y >= -2**127 && y < 2**127);
        z = int128(y);
    }

    function toInt128(uint256 y) internal pure returns (int128 z) {
        require(y < 2**127);
        z = int128(int256(y));
    }
    
    function toInt56(int256 y) internal pure returns (int56 z) {
        require(y >= -2**55 && y < 2**55);
        z = int56(y);
    }
}
