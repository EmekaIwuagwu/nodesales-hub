// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DNRBond — Kortana Dinar Bond
 * @notice Contraction mechanism — burn DNRS to get bonds,
 *         redeem bonds for DNRS when peg is restored
 * @dev ERC-20 bond token. No expiry. FIFO redemption queue.
 *
 * Bond Lifecycle:
 * 1. DNRS at $0.95 → User burns 0.95 DNRS → receives 1 DNRBond
 * 2. DNRS recovers to $1.05 → User redeems 1 DNRBond → receives 1 DNRS
 * 3. Net profit = 0.05 DNRS per bond = ~5.26% return
 *
 * Higher discount = more profit incentive = more demand = faster recovery
 */
contract DNRBond is ERC20, AccessControl, ReentrancyGuard {

    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // Track bond purchase epochs for FIFO redemption
    struct BondLot {
        uint256 amount;
        uint256 epochPurchased;
        uint256 redemptionPrice; // DNRS price at redemption (1e18 = $1)
    }

    mapping(address => BondLot[]) public bondLots;
    uint256 public totalBondsOutstanding;

    // Bond premium: bonds redeem at 1:1 DNRS (no premium for simplicity)
    // Profit comes from buying discounted DNRS to purchase bonds

    // Events
    event BondIssued(address indexed buyer, uint256 dnrsBurned, uint256 bondsIssued, uint256 epoch);
    event BondRedeemed(address indexed holder, uint256 bondsRedeemed, uint256 dnrsReceived, uint256 epoch);

    constructor(address admin) ERC20("Kortana Dinar Bond", "DNRB") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // Called by Treasury when user purchases bonds
    // bondAmount = how many bonds to issue (1 bond = 1 DNRS at redemption)
    function issueBonds(address to, uint256 bondAmount, uint256 currentEpoch)
        external
        nonReentrant
        onlyRole(TREASURY_ROLE)
    {
        require(bondAmount > 0, "DNRBond: zero amount");
        _mint(to, bondAmount);
        bondLots[to].push(BondLot({
            amount: bondAmount,
            epochPurchased: currentEpoch,
            redemptionPrice: 1e18 // 1 bond = 1 DNRS
        }));
        totalBondsOutstanding += bondAmount;
        emit BondIssued(to, bondAmount, bondAmount, currentEpoch);
    }

    // Called by Treasury when bonds are redeemed
    function redeemBonds(address from, uint256 bondAmount, uint256 currentEpoch)
        external
        nonReentrant
        onlyRole(TREASURY_ROLE)
        returns (uint256 dnrsToMint)
    {
        require(balanceOf(from) >= bondAmount, "DNRBond: insufficient bonds");
        _burn(from, bondAmount);
        totalBondsOutstanding -= bondAmount;
        dnrsToMint = bondAmount; // 1:1 redemption
        emit BondRedeemed(from, bondAmount, dnrsToMint, currentEpoch);
        return dnrsToMint;
    }

    // View: how much DNRS would user get for redeeming all bonds
    function getRedemptionValue(address holder) external view returns (uint256) {
        return balanceOf(holder); // 1:1 ratio
    }
}
