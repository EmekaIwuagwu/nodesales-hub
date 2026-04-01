// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DNRToken
 * @notice ERC20 reward token for the Kortana Node ecosystem.
 *         The deployer receives the full initial supply and can
 *         mint additional tokens (e.g. to top up the NFT treasury).
 */
contract DNRToken is ERC20, ERC20Burnable, Ownable {

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion hard cap

    event TokensMinted(address indexed to, uint256 amount);

    constructor(uint256 initialSupply)
        ERC20("Kortana DNR", "DNR")
        Ownable(msg.sender)
    {
        require(initialSupply <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Mint new tokens up to MAX_SUPPLY. Only owner.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
