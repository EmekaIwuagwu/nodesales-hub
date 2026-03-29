// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KortanaLicenseNFT
 * @notice Node License NFT for Kortana Blockchain
 * @dev Deployed on Kortana EVM — Chain ID 9002 (Mainnet) / 72511 (Testnet)
 *
 * RULES:
 * - Only Foundation wallet can mint
 * - Payment verified off-chain
 * - Foundation calls mintLicense() after verifying USDT payment
 * - License holders receive DNR rewards automatically
 * - Licenses are transferable between wallets
 * - Supply caps enforced per tier
 */
contract KortanaLicenseNFT is ERC721, Ownable, Pausable, ReentrancyGuard {
    
    enum Tier {
        GenesisNode,      // Tier 0 — $300
        EarlyNode,        // Tier 1 — $500
        FullNode,         // Tier 2 — $1,000
        PremiumNode       // Tier 3 — $2,000
    }

    struct License {
        Tier tier;
        bool active;
        uint256 mintedAt;
    }

    uint256 public nextLicenseId = 1;

    mapping(uint256 => License) private _licenseDetails;
    mapping(Tier => uint256) public maxSupply;
    mapping(Tier => uint256) public totalMinted;
    mapping(address => uint256[]) private _ownerLicenses;

    event LicenseMinted(address indexed buyer, uint256 indexed licenseId, Tier tier, uint256 timestamp);
    event LicenseRevoked(uint256 indexed licenseId);

    constructor() ERC721("Kortana Node License", "KNL") Ownable(msg.sender) {
        maxSupply[Tier.GenesisNode] = 1000;
        maxSupply[Tier.EarlyNode] = 2000;
        maxSupply[Tier.FullNode] = 1000;
        maxSupply[Tier.PremiumNode] = 500;
    }

    /**
     * @notice Mint new license NFT to buyer
     * @param buyer Kortana wallet address of the buyer
     * @param tier The license tier being purchased
     */
    function mintLicense(address buyer, Tier tier) external onlyOwner nonReentrant {
        _performMint(buyer, tier);
    }

    /**
     * @notice Batch mint multiple licenses at once
     */
    function batchMintLicense(address[] calldata buyers, Tier[] calldata tiers) external onlyOwner nonReentrant {
        require(buyers.length == tiers.length, "Array lengths must match");
        for (uint256 i = 0; i < buyers.length; i++) {
            _performMint(buyers[i], tiers[i]);
        }
    }

    function _performMint(address buyer, Tier tier) internal {
        require(totalMinted[tier] < maxSupply[tier], "Supply exceeded for this tier");
        
        uint256 licenseId = nextLicenseId++;
        _safeMint(buyer, licenseId);
        
        _licenseDetails[licenseId] = License({
            tier: tier,
            active: true,
            mintedAt: block.timestamp
        });
        
        totalMinted[tier]++;
        _ownerLicenses[buyer].push(licenseId);
        
        emit LicenseMinted(buyer, licenseId, tier, block.timestamp);
    }

    /**
     * @notice Transfer license to new owner
     * @dev Overriding to track owner's licenses
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        if (from != address(0)) {
            _removeLicenseFromOwner(from, tokenId);
        }
        if (to != address(0)) {
            _ownerLicenses[to].push(tokenId);
        }
        
        return from;
    }

    function _removeLicenseFromOwner(address owner, uint256 licenseId) internal {
        uint256[] storage licenses = _ownerLicenses[owner];
        for (uint256 i = 0; i < licenses.length; i++) {
            if (licenses[i] == licenseId) {
                licenses[i] = licenses[licenses.length - 1];
                licenses.pop();
                break;
            }
        }
    }

    /**
     * @notice Get all licenses owned by address
     */
    function getLicenses(address holder) external view returns (uint256[] memory) {
        return _ownerLicenses[holder];
    }

    /**
     * @notice Get remaining supply for a tier
     */
    function getRemainingSupply(Tier tier) external view returns (uint256) {
        return maxSupply[tier] - totalMinted[tier];
    }

    /**
     * @notice Get full license details
     */
    function getLicenseDetails(uint256 licenseId) external view 
        returns (address owner, Tier tier, bool active, uint256 mintedAt) 
    {
        require(_licenseDetails[licenseId].mintedAt > 0, "License does not exist");
        return (ownerOf(licenseId), _licenseDetails[licenseId].tier, _licenseDetails[licenseId].active, _licenseDetails[licenseId].mintedAt);
    }

    function tierOf(uint256 licenseId) external view returns (uint8) {
        require(_licenseDetails[licenseId].mintedAt > 0, "License does not exist");
        return uint8(_licenseDetails[licenseId].tier);
    }

    function licenseActive(uint256 licenseId) external view returns (bool) {
        return _licenseDetails[licenseId].active;
    }

    /**
     * @notice Emergency revocation of license
     */
    function revokeLicense(uint256 licenseId) external onlyOwner {
        _licenseDetails[licenseId].active = false;
        emit LicenseRevoked(licenseId);
    }

    /**
     * @notice Update foundation wallet address
     */
    function updateFoundation(address newFoundation) external onlyOwner {
        transferOwnership(newFoundation);
    }

    string private _baseTokenURI;

    /**
     * @dev Overriding baseURI to return the metadata endpoint
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Set base URI for NFT metadata
     * @param baseURI_ The new base URI (e.g., ipfs://CID/)
     */
    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
