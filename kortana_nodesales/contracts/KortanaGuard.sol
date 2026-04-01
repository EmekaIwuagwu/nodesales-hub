// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KortanaGuard
 * @notice Reentrancy guard using a plain uint256 state variable.
 *
 * OZ v5's ReentrancyGuard uses StorageSlot assembly (`r.slot := slot`) to
 * write to a keccak-hash-derived slot. The Kortana EVM does not support
 * assembly storage-pointer assignment — it causes a silent EVM revert with
 * data=null. This version avoids all assembly; the guard lives at a normal
 * sequential Solidity storage slot.
 */
abstract contract KortanaGuard {
    uint256 private _guardStatus;

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED     = 2;

    constructor() {
        _guardStatus = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_guardStatus != _ENTERED, "ReentrancyGuard: reentrant call");
        _guardStatus = _ENTERED;
        _;
        _guardStatus = _NOT_ENTERED;
    }
}
