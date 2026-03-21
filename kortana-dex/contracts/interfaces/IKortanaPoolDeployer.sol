// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

interface IKortanaPoolDeployer {
    function parameters()
        external
        view
        returns (
            address factory,
            address token0,
            address token1,
            uint24 fee,
            int24 tickSpacing
        );
}
