// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

interface IKortanaFlashCallback {
    function kortanaFlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external;
}
