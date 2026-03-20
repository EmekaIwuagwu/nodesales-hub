// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IDNRSToken {
    function burnFrom(address from, uint256 amount) external;
}

/**
 * @title StabilityModule — Kortana DNRS Stability Mechanism
 * @notice Handles DNRS redemption for DNR or other assets
 *         Initially used by Paymaster to convert DNRS → DNR
 */
contract StabilityModule is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    IDNRSToken public dnrsToken;

    event DNRSRedeemed(address indexed user, uint256 dnrsAmount, uint256 dnrAmount);

    constructor(address _dnrsToken, address admin) {
        dnrsToken = IDNRSToken(_dnrsToken);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }

    /**
     * @notice Redeem DNRS for native DNR at 1:1 ratio (for Paymaster)
     * @dev Simple implementation for testnet. Mainnet will use oracle price.
     */
    function redeemDNRS(uint256 dnrsAmount) external {
        uint256 dnrToReturn = dnrsAmount; // 1:1 for now (testnet/init)
        require(address(this).balance >= dnrToReturn, "StabilityModule: insufficient DNR");

        // Burn user's DNRS
        dnrsToken.burnFrom(msg.sender, dnrsAmount);

        // Send DNR to caller
        (bool success, ) = payable(msg.sender).call{value: dnrToReturn}("");
        require(success, "StabilityModule: DNR transfer failed");

        emit DNRSRedeemed(msg.sender, dnrsAmount, dnrToReturn);
    }

    // Allow funding the contract with DNR
    receive() external payable {}
}
