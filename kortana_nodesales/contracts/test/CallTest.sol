// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
interface IERC20 { function transferFrom(address,address,uint256) external returns (bool); }

contract CallTest {
    address public usdtAddr;
    constructor(address _usdt) { usdtAddr = _usdt; }
    // Just calls transferFrom — nothing else
    function justTransfer(address treasury, uint256 amount) external {
        require(IERC20(usdtAddr).transferFrom(msg.sender, treasury, amount), "fail");
    }
}
