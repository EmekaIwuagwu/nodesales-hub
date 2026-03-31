// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDNR is ERC20 {
    constructor() ERC20("Mock DNR", "DNR") {
        _mint(msg.sender, 100_000_000 * 1e18); // 100M DNR
    }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
