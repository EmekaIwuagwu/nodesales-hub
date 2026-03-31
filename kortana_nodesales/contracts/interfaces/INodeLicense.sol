// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INodeLicense {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function remainingSupply() external view returns (uint256);
    function totalMinted() external view returns (uint256);
    function maxSupply() external view returns (uint256);
    function tierId() external view returns (uint8);
}
