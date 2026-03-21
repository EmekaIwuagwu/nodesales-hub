// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

interface IKortanaMintCallback {
    function kortanaMintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external;
}
