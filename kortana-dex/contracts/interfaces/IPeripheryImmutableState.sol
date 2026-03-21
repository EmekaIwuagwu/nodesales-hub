// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

interface IPeripheryImmutableState {
    function factory() external view returns (address);
    function WDNR() external view returns (address);
}
