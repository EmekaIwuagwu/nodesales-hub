// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/INodeLicense.sol";
import "./KortanaGuard.sol";

/**
 * @title NodeSale
 * @notice Core sale contract. Accepts USDT, mints NodeLicense ERC-20 to buyer.
 *
 * Kortana EVM notes:
 *  - bool/address stored as uint256 — Kortana EVM has slot-packing bugs where
 *    packed types in the same 32-byte slot are not reliably written or read back.
 *  - KortanaGuard replaces OZ ReentrancyGuard — OZ v5's ReentrancyGuard uses
 *    StorageSlot assembly (r.slot := slot) which causes a silent EVM revert on
 *    Kortana (data=null, reason=null).
 */
contract NodeSale is Ownable, Pausable, KortanaGuard {

    // ─── Structs ─────────────────────────────────────────────────────────────
    // All fields are uint256 / bytes32 — no packing. Each field gets its own
    // 32-byte storage slot, which is reliable on Kortana EVM.

    struct Tier {
        bytes32 name;
        uint256 priceUSDT;      // USDT, 6 decimals
        uint256 maxSupply;
        uint256 sold;
        uint256 dnrPerEpoch;    // DNR per epoch, 18 decimals
        uint256 licenseToken;   // address cast to uint256 (no packing)
        uint256 active;         // 1 = active, 0 = paused (no bool packing)
    }

    // ─── State ───────────────────────────────────────────────────────────────

    mapping(uint256 => Tier)                          public tiers;
    mapping(address => uint256[])                     public userPurchasedTiers;
    mapping(address => mapping(uint256 => uint256))   public userNodeCount;

    IERC20  public usdtToken;
    address public treasury;
    uint256 public totalRaised;
    uint256 public constant TIER_COUNT = 4;

    // ─── Events ──────────────────────────────────────────────────────────────

    event NodePurchased(address indexed buyer, uint256 indexed tierId, uint256 quantity, uint256 totalPaid, uint256 timestamp);
    event TierUpdated(uint256 indexed tierId, uint256 active, uint256 newPrice);
    event TreasuryUpdated(address indexed newTreasury);

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address _usdt, address _treasury) Ownable(msg.sender) {
        require(_usdt     != address(0), "NodeSale: zero usdt");
        require(_treasury != address(0), "NodeSale: zero treasury");
        usdtToken = IERC20(_usdt);
        treasury  = _treasury;
    }

    // ─── Tier initialisation (called post-deploy, one tx per tier) ───────────

    function initTier(
        uint256 tierId,
        bytes32 name,
        uint256 priceUSDT,
        uint256 maxSupply,
        uint256 dnrPerEpoch,
        address licenseToken
    ) external onlyOwner {
        require(tierId < TIER_COUNT,              "NodeSale: invalid tier");
        require(licenseToken != address(0),       "NodeSale: zero license");
        require(tiers[tierId].licenseToken == 0,  "NodeSale: already initialized");
        tiers[tierId].name         = name;
        tiers[tierId].priceUSDT    = priceUSDT;
        tiers[tierId].maxSupply    = maxSupply;
        tiers[tierId].sold         = 0;
        tiers[tierId].dnrPerEpoch  = dnrPerEpoch;
        tiers[tierId].licenseToken = uint256(uint160(licenseToken));
        tiers[tierId].active       = 1;
    }

    // ─── Purchase ────────────────────────────────────────────────────────────

    function purchaseNode(uint256 tierId, uint256 quantity)
        external nonReentrant whenNotPaused
    {
        require(tierId < TIER_COUNT,   "NodeSale: invalid tier");
        require(quantity > 0,          "NodeSale: zero quantity");

        Tier storage tier = tiers[tierId];
        require(tier.active == 1,      "NodeSale: tier not active");
        require(tier.sold + quantity <= tier.maxSupply, "NodeSale: supply exhausted");

        uint256 totalCost = tier.priceUSDT * quantity;

        require(
            usdtToken.transferFrom(msg.sender, treasury, totalCost),
            "NodeSale: USDT transfer failed"
        );

        tier.sold     += quantity;
        totalRaised   += totalCost;

        if (userNodeCount[msg.sender][tierId] == 0) {
            userPurchasedTiers[msg.sender].push(tierId);
        }
        userNodeCount[msg.sender][tierId] += quantity;

        address licAddr = address(uint160(tier.licenseToken));
        INodeLicense(licAddr).mint(msg.sender, quantity);

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

    function setTierActive(uint256 tierId, uint256 activeVal) external onlyOwner {
        require(tierId < TIER_COUNT, "NodeSale: invalid tier");
        tiers[tierId].active = activeVal;
        emit TierUpdated(tierId, activeVal, tiers[tierId].priceUSDT);
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
    }

    function withdrawStuckTokens(address token) external onlyOwner {
        require(token != address(usdtToken), "NodeSale: cannot recover USDT");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(IERC20(token).transfer(owner(), balance), "NodeSale: withdraw failed");
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
