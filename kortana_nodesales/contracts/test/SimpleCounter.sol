// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract Counter { 
    uint256 public count;
    function inc() external { count++; }
}
contract CallerContract {
    address public target;
    constructor(address _target) { target = _target; }
    function callInc() external {
        Counter(target).inc();
    }
}
