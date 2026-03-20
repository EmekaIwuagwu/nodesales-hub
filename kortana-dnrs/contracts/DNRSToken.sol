// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DNRS — Kortana Dinar Stable
 * @notice 100% algorithmic stablecoin pegged to $1 USD
 * @dev ERC-20 with controlled mint/burn via Treasury only
 *      Part of Neo-Seigniorage system on Kortana Blockchain
 *
 * Chain IDs: 72511 (testnet), 9002 (mainnet)
 * Supply: Elastic — expands and contracts algorithmically
 */
contract DNRSToken is ERC20, ERC20Burnable, AccessControl, ReentrancyGuard, Pausable {
    
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Anti-manipulation: track mints per block
    uint256 public constant MAX_MINT_PER_BLOCK = 500_000 * 1e18;
    mapping(uint256 => uint256) public mintedPerBlock;

    // Transfer tax during contraction (discourages panic selling)
    uint256 public transferTaxBps = 0; // starts at 0, Treasury can increase
    uint256 public constant MAX_TRANSFER_TAX = 200; // max 2%
    address public taxRecipient; // burned or sent to Treasury

    // Events
    event TreasuryMint(address indexed to, uint256 amount, uint256 blockNumber);
    event TreasuryBurn(address indexed from, uint256 amount);
    event TransferTaxUpdated(uint256 oldTax, uint256 newTax);
    event EmergencyPause(address indexed caller, uint256 timestamp);

    constructor(address admin, address _taxRecipient) ERC20("Kortana Dinar Stable", "DNRS") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        taxRecipient = _taxRecipient;
    }

    // Called by Treasury during EXPANSION
    function mint(address to, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        onlyRole(TREASURY_ROLE)
    {
        require(amount > 0, "DNRS: zero mint");
        require(
            mintedPerBlock[block.number] + amount <= MAX_MINT_PER_BLOCK,
            "DNRS: block mint limit exceeded"
        );
        mintedPerBlock[block.number] += amount;
        _mint(to, amount);
        emit TreasuryMint(to, amount, block.number);
    }

    // Called by Treasury during CONTRACTION (bond purchase burns DNRS)
    function burnFrom(address from, uint256 amount)
        public
        override
        nonReentrant
        whenNotPaused
    {
        // Allow Treasury to burn without allowance check
        if (hasRole(TREASURY_ROLE, msg.sender)) {
            _burn(from, amount);
            emit TreasuryBurn(from, amount);
            return;
        }
        // Standard burnFrom for users
        super.burnFrom(from, amount);
    }

    // Transfer with optional tax during contraction phases
    function _update(address from, address to, uint256 amount)
        internal
        override
    {
        if (transferTaxBps > 0 && from != address(0) && to != address(0)) {
            // Skip tax for Treasury and system contracts
            if (!hasRole(TREASURY_ROLE, from) && !hasRole(OPERATOR_ROLE, from)) {
                uint256 tax = (amount * transferTaxBps) / 10000;
                uint256 netAmount = amount - tax;
                super._update(from, taxRecipient, tax);
                super._update(from, to, netAmount);
                return;
            }
        }
        super._update(from, to, amount);
    }

    // Treasury sets tax during contraction (discourages bank run)
    function setTransferTax(uint256 taxBps) external onlyRole(TREASURY_ROLE) {
        require(taxBps <= MAX_TRANSFER_TAX, "DNRS: tax too high");
        uint256 old = transferTaxBps;
        transferTaxBps = taxBps;
        emit TransferTaxUpdated(old, taxBps);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, block.timestamp);
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
