// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 { function transferFrom(address,address,uint256) external returns (bool); }
interface ILicense { function mint(address,uint256) external; }

/**
 * Minimal sale — NO OZ inheritance, NO modifiers. 
 * Just the bare purchase logic.
 */
contract MinimalSale {
    address public owner;
    address public usdtToken;
    address public treasury;
    address public licenseToken;
    uint256 public price;

    constructor(address _usdt, address _treasury, address _license, uint256 _price) {
        owner        = msg.sender;
        usdtToken    = _usdt;
        treasury     = _treasury;
        licenseToken = _license;
        price        = _price;
    }

    function buy() external {
        require(IERC20(usdtToken).transferFrom(msg.sender, treasury, price), "usdt failed");
        ILicense(licenseToken).mint(msg.sender, 1);
    }
}
