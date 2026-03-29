// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IKortanaLicenseNFT {
    function ownerOf(uint256 licenseId) external view returns (address);
    function tierOf(uint256 licenseId) external view returns (uint8);
    function licenseActive(uint256 licenseId) external view returns (bool);
    function nextLicenseId() external view returns (uint256);
}

contract KortanaRewards is Ownable, Pausable, ReentrancyGuard {

    IKortanaLicenseNFT public licenseContract;

    uint256 public constant EPOCH_DURATION = 1; // 1 second for instant testing
    uint256 public currentEpoch;
    uint256 public lastEpochTime;

    mapping(uint8 => uint256) public rewardPerEpoch;
    mapping(uint256 => uint256) public lastClaimedEpoch; 
    
    uint256 public totalDistributed;

    event RewardDistributed(address indexed holder, uint256 indexed licenseId, uint256 dnrAmount, uint256 epoch);
    event EpochAdvanced(uint256 newEpoch, uint256 timestamp);
    event RewardPoolFunded(uint256 dnrAmount, address funder);
    event RewardRateUpdated(uint8 tier, uint256 newRate);
    event EmergencyWithdraw(uint256 amount);
    event InsufficientBalance(uint256 licenseId, uint256 requiredAmount);

    constructor(address _licenseContract) Ownable(msg.sender) {
        licenseContract = IKortanaLicenseNFT(_licenseContract);
        lastEpochTime = block.timestamp;
        currentEpoch = 1; // FIX: Initialize to 1 to prevent 'lastClaimed == 0' EVM zero-trap
        
        rewardPerEpoch[0] = 1 * 10**18; // Genesis Node
        rewardPerEpoch[1] = 2 * 10**18; // Early Node
        rewardPerEpoch[2] = 5 * 10**18; // Full Node
        rewardPerEpoch[3] = 10 * 10**18; // Premium Node
    }

    receive() external payable {
        emit RewardPoolFunded(msg.value, msg.sender);
    }

    function advanceEpoch() external {
        require(block.timestamp >= lastEpochTime + EPOCH_DURATION, "Epoch duration not reached");
        currentEpoch++;
        lastEpochTime = block.timestamp;
        emit EpochAdvanced(currentEpoch, block.timestamp);
    }

    function distributeReward(uint256 licenseId) public nonReentrant whenNotPaused {
        _distribute(licenseId);
    }

    function distributeRewardBatch(uint256[] calldata licenseIds) external nonReentrant whenNotPaused {
        for (uint256 i = 0; i < licenseIds.length; i++) {
            _distribute(licenseIds[i]);
        }
    }

    function distributeAllRewards(uint256 startId, uint256 endId) external nonReentrant whenNotPaused {
        uint256 maxId = licenseContract.nextLicenseId();
        uint256 actualEnd = endId < maxId ? endId : maxId - 1;
        
        for (uint256 i = startId; i <= actualEnd; i++) {
            if (i == 0) continue;
            _distribute(i);
        }
    }

    function _distribute(uint256 licenseId) internal {
        if (!licenseContract.licenseActive(licenseId)) return;
        
        uint256 lastClaimed = lastClaimedEpoch[licenseId];
        if (lastClaimed == 0) {
            lastClaimedEpoch[licenseId] = currentEpoch;
            return;
        }

        if (currentEpoch <= lastClaimed) return;

        uint256 epochsToClaim = currentEpoch - lastClaimed;
        uint8 tier = licenseContract.tierOf(licenseId);
        uint256 amount = epochsToClaim * rewardPerEpoch[tier];

        if (address(this).balance < amount) {
            emit InsufficientBalance(licenseId, amount);
            return;
        }

        address owner = licenseContract.ownerOf(licenseId);
        lastClaimedEpoch[licenseId] = currentEpoch;
        totalDistributed += amount;

        (bool success, ) = payable(owner).call{value: amount}("");
        if (success) {
            emit RewardDistributed(owner, licenseId, amount, currentEpoch);
        }
    }

    function pendingRewards(uint256 licenseId) public view returns (uint256) {
        if (!licenseContract.licenseActive(licenseId)) return 0;
        uint256 lastClaimed = lastClaimedEpoch[licenseId];
        if (lastClaimed == 0 || currentEpoch <= lastClaimed) return 0;
        
        uint256 epochsToClaim = currentEpoch - lastClaimed;
        uint8 tier = licenseContract.tierOf(licenseId);
        return epochsToClaim * rewardPerEpoch[tier];
    }

    function getRewardRate(uint8 tier) external view returns (uint256) {
        return rewardPerEpoch[tier];
    }

    function setRewardRate(uint8 tier, uint256 newRate) external onlyOwner {
        rewardPerEpoch[tier] = newRate;
        emit RewardRateUpdated(tier, newRate);
    }

    function poolBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function epochsRemaining() external view returns (uint256) {
        uint256 totalRate;
        uint256 maxId = licenseContract.nextLicenseId();
        for (uint256 i = 1; i < maxId; i++) {
            if (licenseContract.licenseActive(i)) {
                totalRate += rewardPerEpoch[licenseContract.tierOf(i)];
            }
        }
        if (totalRate == 0) return 0;
        return address(this).balance / totalRate;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdraw failed");
        emit EmergencyWithdraw(amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
