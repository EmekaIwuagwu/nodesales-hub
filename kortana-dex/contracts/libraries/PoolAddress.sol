// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PoolAddress {
    struct PoolKey {
        address token0;
        address token1;
        uint24 fee;
    }

    function getPoolKey(
        address tokenA,
        address tokenB,
        uint24 fee
    ) internal pure returns (PoolKey memory) {
        if (tokenA > tokenB) (tokenA, tokenB) = (tokenB, tokenA);
        return PoolKey({token0: tokenA, token1: tokenB, fee: fee});
    }

    function computeAddress(address factory, PoolKey memory key) internal pure returns (address pool) {
        pool = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex'ff',
                            factory,
                            keccak256(abi.encode(key.token0, key.token1, key.fee)),
                            // This depends on the POOL_INIT_CODE_HASH which is the keccak256 of the KortanaPool bytecode
                            // For simplicity or to avoid Chicken-and-Egg, we can calculate it or use a placeholder
                            hex'458b93cb46e44ef2e55149fe786b5497e5b90ab9ca53fda6c6a2468ca2620e07' // Correct KortanaPool init code hash
                        )
                    )
                )
            )
        );
    }
}
