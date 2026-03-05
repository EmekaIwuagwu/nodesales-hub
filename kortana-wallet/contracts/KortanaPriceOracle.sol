// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KortanaPriceOracle
 * @dev Professional Price Oracle for the Kortana Enclave Ecosystem.
 * Allows authorized feeders to push real-time market data to the Mainnet.
 */
contract KortanaPriceOracle {
    address public owner;

    struct PriceData {
        uint256 price; // Price in USD with 8 decimals (e.g., $1.42 = 142000000)
        uint256 timestamp;
    }

    mapping(string => PriceData) private prices;
    mapping(address => bool) public authorizedFeeders;

    event PriceUpdated(string indexed symbol, uint256 price, uint256 timestamp);
    event FeederAuthorized(address indexed feeder, bool status);

    constructor() {
        owner = msg.sender;
        authorizedFeeders[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedFeeders[msg.sender], "Not authorized to feed prices");
        _;
    }

    /**
     * @dev Updates the price for a specific asset symbol.
     * @param _symbol The ticker symbol (e.g., "DNR")
     * @param _price The new price in 8-decimal precision
     */
    function updatePrice(
        string calldata _symbol,
        uint256 _price
    ) external onlyAuthorized {
        prices[_symbol] = PriceData({
            price: _price,
            timestamp: block.timestamp
        });
        emit PriceUpdated(_symbol, _price, block.timestamp);
    }

    /**
     * @dev Retrieves the latest price and timestamp for an asset.
     */
    function getPrice(
        string calldata _symbol
    ) external view returns (uint256 price, uint256 lastUpdated) {
        PriceData memory data = prices[_symbol];
        require(data.timestamp > 0, "Price not seeded for this asset");
        return (data.price, data.timestamp);
    }

    /**
     * @dev Authorizes or revokes a feeder address.
     */
    function setFeederStatus(address _feeder, bool _status) external onlyOwner {
        authorizedFeeders[_feeder] = _status;
        emit FeederAuthorized(_feeder, _status);
    }

    /**
     * @dev Transfers ownership to a new address.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner is zero address");
        owner = _newOwner;
    }
}
