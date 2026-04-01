// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract ETHSenderTest2 {
    receive() external payable {}
    // No explicit gas param - let EVM use 63/64 rule
    function sendTo(address target, uint256 amount) external {
        (bool ok,) = payable(target).call{value: amount}("");
        require(ok, "send failed");
    }
    // Also test Solidity's transfer()
    function transferTo(address payable target, uint256 amount) external {
        target.transfer(amount);
    }
}
