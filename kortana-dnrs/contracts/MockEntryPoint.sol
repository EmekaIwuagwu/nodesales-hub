// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DNRSPaymaster.sol";

contract MockEntryPoint {
    function callPaymasterValidate(address paymaster, UserOperation calldata userOp, bytes32 userOpHash, uint256 maxCost) external {
        DNRSPaymaster(payable(paymaster)).validatePaymasterUserOp(userOp, userOpHash, maxCost);
    }

    function callPaymasterPostOp(address paymaster, uint8 mode, bytes calldata context, uint256 actualGasCost, address user, bytes32 userOpHash, uint256 preCharged) external {
        bytes memory mockContext = abi.encode(user, userOpHash, preCharged);
        DNRSPaymaster(payable(paymaster)).postOp(PostOpMode(mode), mockContext, actualGasCost);
    }

    // Mock functions for paymaster to call
    function depositTo(address account) external payable {}
    function addStake(uint32 unstakeDelaySec) external payable {}
    function balanceOf(address account) external view returns (uint256) { return 0; }
    
    receive() external payable {}
}
