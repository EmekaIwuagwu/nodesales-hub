// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IKortanaFactory.sol";
import "./interfaces/IKortanaPair.sol";

contract KortanaFactory is IKortanaFactory {
    address public override feeTo;
    address public override feeToSetter;

    mapping(address => mapping(address => address)) public override getPair;
    address[] public override allPairs;

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view override returns (uint) {
        return allPairs.length;
    }

    // createPair is kept for interface compatibility but will revert on Kortana —
    // Kortana EVM cannot deploy contracts from within contract calls (no CREATE/CREATE2).
    // Use registerPair instead: deploy KortanaPair directly via EOA then register here.
    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        revert("Kortana: use registerPair instead");
    }

    // Admin: register a pre-deployed KortanaPair with this factory.
    // The pair must already be initialized with the correct token0/token1.
    function registerPair(address tokenA, address tokenB, address pair) external {
        require(tokenA != tokenB, "Kortana: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Kortana: ZERO_ADDRESS");
        require(pair != address(0), "Kortana: ZERO_PAIR");
        require(getPair[token0][token1] == address(0), "Kortana: PAIR_EXISTS");
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, "Kortana: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(msg.sender == feeToSetter, "Kortana: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
