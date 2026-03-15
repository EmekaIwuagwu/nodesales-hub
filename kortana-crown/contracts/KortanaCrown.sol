// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title  Kortana Crown (wKUD)
 * @author IDX - Antigravity Smart Contract Engineering
 * @notice BEP-20 wrapped representation of KUD on BNB Smart Chain.
 *         Total fixed supply: 250,000,000 wKUD (18 decimals).
 *
 * Architecture:
 *   +------------------------------------------------------+
 *   |  ERC-20/BEP-20 Core  -------------  OpenZeppelin    |
 *   |  Ownable             -------------  Access Control  |
 *   |  Pausable            -------------  Emergency Stop  |
 *   |  Blacklist           -------------  Compliance Gate |
 *   |  Anti-Bot            -------------  Launch Guard    |
 *   |  Burn Mechanism      -------------  Deflationary    |
 *   +------------------------------------------------------+
 */
contract KortanaCrown is ERC20, ERC20Burnable, ERC20Permit, Ownable2Step, Pausable {

    /// @notice Maximum supply of wKUD: 250,000,000 tokens.
    uint256 public constant MAX_SUPPLY        = 250_000_000 * 10 ** 18;
    /// @notice Maximum transaction amount (1% of supply).
    uint256 public constant MAX_TX_AMOUNT     = 2_500_000  * 10 ** 18;
    /// @notice Maximum wallet amount (2% of supply).
    uint256 public constant MAX_WALLET_AMOUNT = 5_000_000  * 10 ** 18;

    /// @notice Indicates if an address is blacklisted.
    mapping(address => bool) public isBlacklisted;
    /// @notice Indicates if an address is exempt from limits.
    mapping(address => bool) public isExemptFromLimits;

    /// @notice True if public trading is enabled.
    bool  public tradingEnabled;
    /// @notice True if tx/wallet limits are active.
    bool  public limitsEnabled = true;

    /// @notice Address of the project treasury.
    address public treasuryWallet;
    /// @notice Address authorized to mint/burn via bridge.
    address public bridgeOperator;

    /// @notice Block number when trading was enabled.
    uint256 public launchBlock;

    // --- ERRORS ----------------------------------------------
    error Unauthorized();
    error TradingNotEnabled();
    error LaunchBlockRestricted();
    error TransactionExceedsMax();
    error WalletExceedsMax();
    error BlacklistedSender(address account);
    error BlacklistedRecipient(address account);

    // --- EVENTS ----------------------------------------------
    /**
     * @notice Emitted when trading is enabled.
     * @param blockNumber The block number when trading started.
     */
    event TradingEnabled(uint256 indexed blockNumber);
    /**
     * @notice Emitted when blacklist status is updated.
     * @param account The address affected.
     * @param status The new blacklist status.
     */
    event Blacklisted(address indexed account, bool indexed status);
    /**
     * @notice Emitted when treasury address is updated.
     * @param newTreasury The new treasury address.
     */
    event TreasuryUpdated(address indexed newTreasury);
    /**
     * @notice Emitted when bridge operator address is updated.
     * @param newOperator The new bridge operator address.
     */
    event BridgeOperatorUpdated(address indexed newOperator);
    /**
     * @notice Emitted when limits are toggled.
     * @param enabled True if limits are now enabled.
     */
    event LimitsToggled(bool indexed enabled);
    /**
     * @notice Emitted on bridge mint.
     * @param to Recipient address.
     * @param amount Token amount minted.
     */
    event BridgeMint(address indexed to, uint256 indexed amount);
    /**
     * @notice Emitted on bridge burn.
     * @param from Source address.
     * @param amount Token amount burned.
     */
    event BridgeBurn(address indexed from, uint256 indexed amount);

    // --- MODIFIERS -------------------------------------------
    modifier onlyBridgeOrOwner() {
        if (msg.sender != bridgeOperator && msg.sender != owner()) {
            revert Unauthorized();
        }
        _;
    }

    // --- CONSTRUCTOR -----------------------------------------
    /**
     * @notice Initializes the contract with treasury and bridge operator.
     * @param _treasury Primary treasury for initial supply.
     * @param _bridgeOperator Authorized bridge manager.
     */
    constructor(
        address _treasury,
        address _bridgeOperator
    )
        ERC20("Kortana Crown", "wKUD")
        ERC20Permit("Kortana Crown")
        Ownable(msg.sender)
    {
        if (_treasury == address(0)) revert Unauthorized();
        if (_bridgeOperator == address(0)) revert Unauthorized();

        treasuryWallet  = _treasury;
        bridgeOperator  = _bridgeOperator;

        // Exempt privileged addresses from tx/wallet limits
        isExemptFromLimits[msg.sender]      = true;
        isExemptFromLimits[_treasury]       = true;
        isExemptFromLimits[_bridgeOperator] = true;
        isExemptFromLimits[address(0xdead)] = true;

        // Mint full supply to deployer - deployer allocates to treasury / DEX
        _mint(msg.sender, MAX_SUPPLY);
    }

    // --- TRADING CONTROL -------------------------------------
    /**
     * @notice Enable trading. Irreversible once called.
     */
    function enableTrading() external onlyOwner {
        if (tradingEnabled) revert Unauthorized();
        tradingEnabled = true;
        launchBlock    = block.number;
        emit TradingEnabled(block.number);
    }

    // --- COMPLIANCE ------------------------------------------
    /**
     * @notice Add/remove address to blacklist.
     * @param account Target address.
     * @param status True to blacklist.
     */
    function setBlacklist(address account, bool status) external onlyOwner {
        if (account == owner()) revert Unauthorized();
        isBlacklisted[account] = status;
        emit Blacklisted(account, status);
    }

    /**
     * @notice Set exemption status for limits.
     * @param account Target address.
     * @param status True to exempt.
     */
    function setExempt(address account, bool status) external onlyOwner {
        isExemptFromLimits[account] = status;
    }

    /**
     * @notice Toggle transaction and wallet limits.
     * @param enabled True to enable.
     */
    function toggleLimits(bool enabled) external onlyOwner {
        limitsEnabled = enabled;
        emit LimitsToggled(enabled);
    }

    // --- ADMIN -----------------------------------------------
    /**
     * @notice Update treasury wallet.
     * @param _treasury New address.
     */
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert Unauthorized();
        treasuryWallet = _treasury;
        isExemptFromLimits[_treasury] = true;
        emit TreasuryUpdated(_treasury);
    }

    /**
     * @notice Update bridge operator.
     * @param _bridge New address.
     */
    function setBridgeOperator(address _bridge) external onlyOwner {
        if (_bridge == address(0)) revert Unauthorized();
        bridgeOperator = _bridge;
        isExemptFromLimits[_bridge] = true;
        emit BridgeOperatorUpdated(_bridge);
    }

    /// @notice Pause all transfers.
    function pause()   external onlyOwner { _pause(); }
    /// @notice Resume all transfers.
    function unpause() external onlyOwner { _unpause(); }

    // --- BRIDGE HOOKS ----------------------------------------
    /**
     * @notice Called by bridge when KUD is locked on Kortana chain.
     * @param to Recipient address.
     * @param amount Token amount.
     */
    function bridgeMint(address to, uint256 amount) external onlyBridgeOrOwner {
        if (totalSupply() + amount > MAX_SUPPLY) revert Unauthorized();
        _mint(to, amount);
        emit BridgeMint(to, amount);
    }

    /**
     * @notice Called by bridge when user wants to exit to Kortana chain.
     * @param from Source address.
     * @param amount Token amount.
     */
    function bridgeBurn(address from, uint256 amount) external onlyBridgeOrOwner {
        _burn(from, amount);
        emit BridgeBurn(from, amount);
    }

    // --- INTERNAL - TRANSFER HOOK ----------------------------
    /**
     * @notice Hook that is called before any transfer of tokens.
     * @param from Address sending tokens.
     * @param to Address receiving tokens.
     * @param amount Amount of tokens transferred.
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        if (isBlacklisted[from]) revert BlacklistedSender(from);
        if (isBlacklisted[to]) revert BlacklistedRecipient(to);

        if (from != address(0) && to != address(0)) {
            if (!tradingEnabled) {
                if (!isExemptFromLimits[from] && !isExemptFromLimits[to]) {
                    revert TradingNotEnabled();
                }
            }

            if (tradingEnabled && block.number == launchBlock) {
                if (!isExemptFromLimits[from] && !isExemptFromLimits[to]) {
                    revert LaunchBlockRestricted();
                }
            }
        }

        if (limitsEnabled && from != address(0) && to != address(0)) {
            if (!isExemptFromLimits[from] && !isExemptFromLimits[to]) {
                if (amount > MAX_TX_AMOUNT) revert TransactionExceedsMax();
                if (balanceOf(to) + amount > MAX_WALLET_AMOUNT) revert WalletExceedsMax();
            }
        }

        super._update(from, to, amount);
    }

    /**
     * @notice Returns current circulating supply.
     * @return Current circulating supply (excluding dead address).
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply() - balanceOf(address(0xdead));
    }
}
