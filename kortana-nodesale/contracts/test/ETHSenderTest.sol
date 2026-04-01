// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract ETHSenderTest {
    receive() external payable {}
    function sendTo(address target, uint256 amount) external {
        (bool ok,) = payable(target).call{value: amount, gas: 100000}("");
        require(ok, "send failed");
    }
}
