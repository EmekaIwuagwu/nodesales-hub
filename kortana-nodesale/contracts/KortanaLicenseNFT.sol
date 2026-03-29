// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract KortanaLicenseNFT is ERC721, Ownable, Pausable, ReentrancyGuard {
    
    enum Tier { GenesisNode, EarlyNode, FullNode, PremiumNode }

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

    // ============ REWARDS ARCHITECTURE ============
    uint256 public constant EPOCH_DURATION = 86400; // 24 hours = 86400 seconds
    uint256 public currentEpoch;
    uint256 public lastEpochTime;

    mapping(uint8 => uint256) public rewardPerEpoch;
    mapping(uint256 => uint256) public lastClaimedEpoch; 
    uint256 public totalDistributed;

    event LicenseMinted(address indexed buyer, uint256 indexed licenseId, Tier tier, uint256 timestamp);
    event LicenseRevoked(uint256 indexed licenseId);
    
    event RewardDistributed(address indexed holder, uint256 indexed licenseId, uint256 dnrAmount, uint256 epoch);
    event EpochAdvanced(uint256 newEpoch, uint256 timestamp);
    event RewardPoolFunded(uint256 dnrAmount, address funder);
    event RewardRateUpdated(uint8 tier, uint256 newRate);
    event EmergencyWithdraw(uint256 amount);
    event InsufficientBalance(uint256 licenseId, uint256 requiredAmount);

    constructor() ERC721("Kortana Node License", "KNL") Ownable(msg.sender) {
        maxSupply[Tier.GenesisNode] = 1000;
        maxSupply[Tier.EarlyNode] = 2000;
        maxSupply[Tier.FullNode] = 1000;
        maxSupply[Tier.PremiumNode] = 500;

        lastEpochTime = block.timestamp;
        currentEpoch = 1; // Fixes 0-Epoch snapshot loop natively
        
        rewardPerEpoch[0] = 40 * 10**18;  // Genesis Node - 40 DNR
        rewardPerEpoch[1] = 80 * 10**18;  // Early Node - 80 DNR
        rewardPerEpoch[2] = 200 * 10**18; // Full Node - 200 DNR
        rewardPerEpoch[3] = 400 * 10**18; // Premium Node - 400 DNR
    }

    receive() external payable {
        emit RewardPoolFunded(msg.value, msg.sender);
    }

    function mintLicense(address buyer, Tier tier) external onlyOwner nonReentrant {
        _performMint(buyer, tier);
    }

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

    // ============ REWARDS LOGIC ============
    function advanceEpoch() external {
        require(block.timestamp >= lastEpochTime + EPOCH_DURATION, "Epoch duration not reached");
        currentEpoch++;
        lastEpochTime = block.timestamp;
        emit EpochAdvanced(currentEpoch, block.timestamp);
    }

    function distributeReward(uint256 licenseId) public nonReentrant whenNotPaused {
        _distribute(licenseId);
    }

    function distributeAllRewards(uint256 startId, uint256 endId) external nonReentrant whenNotPaused {
        uint256 maxId = nextLicenseId;
        uint256 actualEnd = endId < maxId ? endId : maxId - 1;
        
        for (uint256 i = startId; i <= actualEnd; i++) {
            if (i == 0) continue;
            _distribute(i);
        }
    }

    function _distribute(uint256 licenseId) internal {
        if (!_licenseDetails[licenseId].active) return;
        
        uint256 lastClaimed = lastClaimedEpoch[licenseId];
        if (lastClaimed == 0) {
            lastClaimedEpoch[licenseId] = currentEpoch;
            return;
        }

        if (currentEpoch <= lastClaimed) return;

        uint256 epochsToClaim = currentEpoch - lastClaimed;
        uint8 tier = uint8(_licenseDetails[licenseId].tier);
        uint256 amount = epochsToClaim * rewardPerEpoch[tier];

        if (address(this).balance < amount) {
            emit InsufficientBalance(licenseId, amount);
            return;
        }

        address nodeOwner = ownerOf(licenseId);
        lastClaimedEpoch[licenseId] = currentEpoch;
        totalDistributed += amount;

        (bool success, ) = payable(nodeOwner).call{value: amount}("");
        require(success, "DNR Transfer Failed");
        emit RewardDistributed(nodeOwner, licenseId, amount, currentEpoch);
    }

    function getLicenses(address holder) external view returns (uint256[] memory) { return _ownerLicenses[holder]; }
    function getRemainingSupply(Tier tier) external view returns (uint256) { return maxSupply[tier] - totalMinted[tier]; }
    function licenseActive(uint256 licenseId) external view returns (bool) { return _licenseDetails[licenseId].active; }
    function tierOf(uint256 licenseId) external view returns (uint8) { return uint8(_licenseDetails[licenseId].tier); }

    function revokeLicense(uint256 licenseId) external onlyOwner {
        _licenseDetails[licenseId].active = false;
        emit LicenseRevoked(licenseId);
    }

    string private _baseTokenURI;
    function _baseURI() internal view virtual override returns (string memory) { return _baseTokenURI; }
    function setBaseURI(string calldata baseURI_) external onlyOwner { _baseTokenURI = baseURI_; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
