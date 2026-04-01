// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LowLevelTest {
    address public usdtAddr;
    constructor(address _usdt) { usdtAddr = _usdt; }
    
    // Test A: high-level interface call
    function testHighLevel(address from, address to, uint256 amount) external returns (bool) {
        bytes memory data = abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount);
        (bool ok, bytes memory ret) = usdtAddr.call(data);
        return ok;
    }
    
    // Test B: check return size and value
    function testWithReturnData(address from, address to, uint256 amount) external returns (bool ok, uint256 retSize, bytes memory retData) {
        bytes memory data = abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount);
        (ok, retData) = usdtAddr.call(data);
        retSize = retData.length;
    }
    
    // Test C: just read storage (does SLOAD work?)
    function readUsdt() external view returns (address) {
        return usdtAddr;
    }
}
