// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IKortanaFactory.sol";
import "./KortanaPair.sol";

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

    function INIT_CODE_PAIR_HASH() public pure returns (bytes32) {
        return keccak256(type(KortanaPair).creationCode);
    }

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, "Kortana: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Kortana: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "Kortana: PAIR_EXISTS"); // single check is sufficient
        bytes memory bytecode = type(KortanaPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IKortanaPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
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
