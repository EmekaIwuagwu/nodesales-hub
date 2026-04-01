// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NodeLicense
 * @notice ERC-20 token representing ownership of a Kortana Node License.
 *
 * Kortana EVM: contract-to-contract CALL opcode is broken (silent no-op).
 * Purchase flow is therefore off-chain verified:
 *   1. User sends USDT directly to treasury (EOA → ERC20, works fine).
 *   2. Backend detects Transfer event, verifies amount, calls mint() directly
 *      from the distributor EOA (EOA → NodeLicense, works fine).
 *
 * The `minter` role replaces the old `nodeSaleContract` — it is set to the
 * backend distributor wallet address, not a contract.
 */
contract NodeLicense is ERC20, Ownable, Pausable {

    uint256 public immutable maxSupply;
    uint256 public totalMinted;
    uint8   public immutable tierId;
    address public minter;

    event LicenseMinted(address indexed buyer, uint256 amount, uint8 tier);
    event MinterUpdated(address indexed newMinter);

    modifier onlyMinter() {
        require(msg.sender == minter || msg.sender == owner(), "NodeLicense: not minter");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _maxSupply,
        uint8   _tierId,
        address _minter
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        require(_minter != address(0), "NodeLicense: zero minter");
        maxSupply = _maxSupply;
        tierId    = _tierId;
        minter    = _minter;
    }

    function decimals() public pure override returns (uint8) { return 0; }

    function mint(address to, uint256 amount) external onlyMinter whenNotPaused {
        require(totalMinted + amount <= maxSupply, "NodeLicense: supply cap exceeded");
        totalMinted += amount;
        _mint(to, amount);
        emit LicenseMinted(to, amount, tierId);
    }

    function remainingSupply() external view returns (uint256) {
        return maxSupply - totalMinted;
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "NodeLicense: zero minter");
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
