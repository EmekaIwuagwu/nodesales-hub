// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract mdUSD is ERC20, ERC20Permit, ERC20Pausable, Ownable {
    uint256 public cap;
    mapping(address => bool) public isOperator;

    event OperatorUpdated(address indexed operator, bool status);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _cap,
        address initialOwner
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(initialOwner) {
        require(_cap > 0, "Cap must be > 0");
        cap = _cap;
        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
            emit Mint(initialOwner, initialSupply);
        }
    }

    modifier onlyOperator() {
        require(owner() == _msgSender() || isOperator[_msgSender()], "Not operator or owner");
        _;
    }

    function setCap(uint256 _cap) external onlyOwner {
        require(_cap >= totalSupply(), "Cap cannot be less than total supply");
        cap = _cap;
    }

    function setOperator(address operator, bool status) external onlyOwner {
        isOperator[operator] = status;
        emit OperatorUpdated(operator, status);
    }

    function mint(address to, uint256 amount) external onlyOperator {
        require(totalSupply() + amount <= cap, "Exceeds cap");
        _mint(to, amount);
        emit Mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (from != _msgSender()) {
            _spendAllowance(from, _msgSender(), amount);
        }
        _burn(from, amount);
        emit Burn(from, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Required override by OpenZeppelin
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
