// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NodeLicense
 * @notice ERC-20 token representing ownership of a Kortana Node License.
 *         Each tier (Genesis / Early / Full / Premium) deploys its own instance.
 *         Decimals = 0 — whole licenses only.
 *         Only the designated NodeSale contract can mint.
 */
contract NodeLicense is ERC20, Ownable, Pausable, ReentrancyGuard {

    // ─── State ───────────────────────────────────────────────────────────────

    uint256 public immutable maxSupply;
    uint256 public totalMinted;
    uint8   public immutable tierId;
    address public nodeSaleContract;

    // ─── Events ──────────────────────────────────────────────────────────────

    event LicenseMinted(address indexed buyer,  uint256 amount, uint8 tier);
    event LicenseBurned(address indexed holder, uint256 amount);
    event NodeSaleContractUpdated(address indexed newContract);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyNodeSale() {
        require(msg.sender == nodeSaleContract, "NodeLicense: caller is not NodeSale");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    /**
     * @param name_       e.g. "Kortana Genesis License"
     * @param symbol_     e.g. "KGL"
     * @param _maxSupply  Tier supply cap
     * @param _tierId     0 = Genesis, 1 = Early, 2 = Full, 3 = Premium
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _maxSupply,
        uint8   _tierId
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        tierId    = _tierId;
    }

    // ─── ERC-20 Override — 0 decimals ────────────────────────────────────────

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    // ─── Minting ─────────────────────────────────────────────────────────────

    /**
     * @notice Mint license tokens to a buyer. Only callable by NodeSale.
     */
    function mint(address to, uint256 amount) external onlyNodeSale whenNotPaused nonReentrant {
        require(totalMinted + amount <= maxSupply, "NodeLicense: supply cap exceeded");
        totalMinted += amount;
        _mint(to, amount);
        emit LicenseMinted(to, amount, tierId);
    }

    // ─── Burning ─────────────────────────────────────────────────────────────

    /**
     * @notice Burn licenses from a holder. Admin only (revocation).
     */
    function burn(address from, uint256 amount) external onlyOwner nonReentrant {
        _burn(from, amount);
        emit LicenseBurned(from, amount);
    }

    // ─── Remaining Supply ────────────────────────────────────────────────────

    function remainingSupply() external view returns (uint256) {
        return maxSupply - totalMinted;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function setNodeSaleContract(address _contract) external onlyOwner {
        require(_contract != address(0), "NodeLicense: zero address");
        nodeSaleContract = _contract;
        emit NodeSaleContractUpdated(_contract);
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
