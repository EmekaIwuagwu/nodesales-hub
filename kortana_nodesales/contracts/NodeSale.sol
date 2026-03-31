// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/INodeLicense.sol";

/**
 * @title NodeSale
 * @notice Core sale contract. Accepts USDT, verifies tier availability,
 *         mints the corresponding NodeLicense ERC-20 to the buyer,
 *         and records purchases on-chain for backend indexing.
 */
contract NodeSale is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Tier {
        string  name;
        uint256 priceUSDT;       // USDT with 6 decimals
        uint256 maxSupply;
        uint256 sold;
        uint256 dnrPerEpoch;     // DNR per 24 h epoch (18-decimal integer)
        address licenseToken;    // NodeLicense ERC-20 for this tier
        bool    active;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    mapping(uint256 => Tier)          public tiers;
    mapping(address => uint256[])     public userPurchasedTiers;  // tier IDs bought by wallet
    mapping(address => mapping(uint256 => uint256)) public userNodeCount; // wallet → tier → qty

    IERC20  public usdtToken;
    address public treasury;
    uint256 public totalRaised;     // USDT (6 decimals)
    uint256 public constant TIER_COUNT = 4;

    // ─── Events ──────────────────────────────────────────────────────────────

    event NodePurchased(
        address indexed buyer,
        uint256 indexed tierId,
        uint256 quantity,
        uint256 totalPaid,
        uint256 timestamp
    );
    event TierUpdated(uint256 indexed tierId, bool active, uint256 newPrice);
    event TreasuryUpdated(address indexed newTreasury);
    event USDTAddressUpdated(address indexed newUSDT);

    // ─── Constructor ─────────────────────────────────────────────────────────

    /**
     * @param _usdt       USDT token address (6 decimals)
     * @param _treasury   Multisig wallet that receives all USDT
     * @param licenses    Array of 4 NodeLicense ERC-20 addresses [Genesis, Early, Full, Premium]
     */
    constructor(
        address _usdt,
        address _treasury,
        address[4] memory licenses
    ) Ownable(msg.sender) {
        require(_usdt     != address(0), "NodeSale: zero usdt");
        require(_treasury != address(0), "NodeSale: zero treasury");

        usdtToken = IERC20(_usdt);
        treasury  = _treasury;

        // Genesis
        tiers[0] = Tier({
            name:         "Genesis",
            priceUSDT:    300 * 1e6,
            maxSupply:    1000,
            sold:         0,
            dnrPerEpoch:  1 * 1e18,
            licenseToken: licenses[0],
            active:       true
        });
        // Early
        tiers[1] = Tier({
            name:         "Early",
            priceUSDT:    500 * 1e6,
            maxSupply:    2000,
            sold:         0,
            dnrPerEpoch:  2 * 1e18,
            licenseToken: licenses[1],
            active:       true
        });
        // Full
        tiers[2] = Tier({
            name:         "Full",
            priceUSDT:    1000 * 1e6,
            maxSupply:    1000,
            sold:         0,
            dnrPerEpoch:  5 * 1e18,
            licenseToken: licenses[2],
            active:       true
        });
        // Premium
        tiers[3] = Tier({
            name:         "Premium",
            priceUSDT:    2000 * 1e6,
            maxSupply:    500,
            sold:         0,
            dnrPerEpoch:  10 * 1e18,
            licenseToken: licenses[3],
            active:       true
        });
    }

    // ─── Purchase ────────────────────────────────────────────────────────────

    /**
     * @notice Purchase node licenses for a given tier.
     *         Caller must have approved this contract to spend `price * quantity` USDT.
     * @param tierId    0 = Genesis, 1 = Early, 2 = Full, 3 = Premium
     * @param quantity  Number of licenses to buy (≥ 1)
     */
    function purchaseNode(uint256 tierId, uint256 quantity)
        external
        nonReentrant
        whenNotPaused
    {
        require(tierId < TIER_COUNT,    "NodeSale: invalid tier");
        require(quantity > 0,           "NodeSale: quantity must be > 0");

        Tier storage tier = tiers[tierId];
        require(tier.active,            "NodeSale: tier not active");
        require(tier.sold + quantity <= tier.maxSupply, "NodeSale: supply exhausted");

        uint256 totalCost = tier.priceUSDT * quantity;

        // Pull USDT from buyer → treasury (SafeERC20)
        usdtToken.safeTransferFrom(msg.sender, treasury, totalCost);

        // Update state before external mint call (CEI)
        tier.sold += quantity;
        totalRaised += totalCost;

        if (userNodeCount[msg.sender][tierId] == 0) {
            userPurchasedTiers[msg.sender].push(tierId);
        }
        userNodeCount[msg.sender][tierId] += quantity;

        // Mint license ERC-20 to buyer
        INodeLicense(tier.licenseToken).mint(msg.sender, quantity);

        emit NodePurchased(msg.sender, tierId, quantity, totalCost, block.timestamp);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function getTier(uint256 tierId) external view returns (Tier memory) {
        return tiers[tierId];
    }

    function remainingSupply(uint256 tierId) external view returns (uint256) {
        return tiers[tierId].maxSupply - tiers[tierId].sold;
    }

    function getUserTiers(address user) external view returns (uint256[] memory) {
        return userPurchasedTiers[user];
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function setTierActive(uint256 tierId, bool active) external onlyOwner {
        require(tierId < TIER_COUNT, "NodeSale: invalid tier");
        tiers[tierId].active = active;
        emit TierUpdated(tierId, active, tiers[tierId].priceUSDT);
    }

    function updateTierPrice(uint256 tierId, uint256 newPrice) external onlyOwner {
        require(tierId < TIER_COUNT, "NodeSale: invalid tier");
        require(newPrice > 0,        "NodeSale: zero price");
        tiers[tierId].priceUSDT = newPrice;
        emit TierUpdated(tierId, tiers[tierId].active, newPrice);
    }

    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "NodeSale: zero address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function updateUSDT(address newUSDT) external onlyOwner {
        require(newUSDT != address(0), "NodeSale: zero address");
        usdtToken = IERC20(newUSDT);
        emit USDTAddressUpdated(newUSDT);
    }

    /**
     * @notice Recover any ERC-20 accidentally sent to this contract.
     *         Cannot recover USDT (use treasury directly).
     */
    function withdrawStuckTokens(address token) external onlyOwner {
        require(token != address(usdtToken), "NodeSale: cannot recover USDT");
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(owner(), balance);
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
