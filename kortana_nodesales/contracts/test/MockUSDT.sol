// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 10_000_000 * 1e6); // 10M USDT
    }

    function decimals() public pure override returns (uint8) { return 6; }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
