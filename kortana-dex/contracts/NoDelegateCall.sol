// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

/**
 * @title NoDelegateCall
 * @notice Prevents delegatecall to a contract
 * @dev This is used to protect contracts that might be vulnerable to delegatecall-based attacks
 */
abstract contract NoDelegateCall {
    address private immutable originalAddress;

    constructor() {
        originalAddress = address(this);
    }

    modifier noDelegateCall() {
        require(address(this) == originalAddress, "No delegatecall");
        _;
    }
}
