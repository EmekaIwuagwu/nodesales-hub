// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import './PoolAddress.sol';
import '../interfaces/IKortanaPool.sol';

library CallbackValidation {
    function verifyCallback(
        address factory,
        address tokenA,
        address tokenB,
        uint24 fee
    ) internal view returns (IKortanaPool pool) {
        pool = IKortanaPool(PoolAddress.computeAddress(factory, PoolAddress.getPoolKey(tokenA, tokenB, fee)));
        require(msg.sender == address(pool), "Invalid callback");
    }
}
