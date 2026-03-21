// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

import "../interfaces/IPeripheryImmutableState.sol";

abstract contract PeripheryImmutableState is IPeripheryImmutableState {
    address public immutable override factory;
    address public immutable override WDNR;

    constructor(address _factory, address _WDNR) {
        factory = _factory;
        WDNR = _WDNR;
    }
}
