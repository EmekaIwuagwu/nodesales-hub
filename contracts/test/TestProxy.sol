// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/// @dev Minimal proxy to test if Kortana EVM supports contract-to-contract CALL.
contract TestProxy {
    address public lastCaller;
    uint256 public lastResult;

    function getBalance(address token, address account) external returns (uint256 result) {
        lastCaller = msg.sender;
        result = IERC20(token).balanceOf(account);
        lastResult = result;
    }
}
