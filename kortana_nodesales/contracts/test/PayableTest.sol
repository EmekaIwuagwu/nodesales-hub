// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract PayableTest {
    address payable public treasury;
    constructor(address payable _treasury) payable { treasury = _treasury; }
    // Receive native token + forward to treasury
    function buy() external payable {
        require(msg.value >= 1 ether, "need 1 DNR");
        treasury.transfer(msg.value);
    }
    // Self-contained state write only
    mapping(address => uint256) public balances;
    function buyAndRecord() external payable {
        require(msg.value >= 1 ether, "need 1 DNR");
        balances[msg.sender] += msg.value;
        treasury.transfer(msg.value);
    }
}
