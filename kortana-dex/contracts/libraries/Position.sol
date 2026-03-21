// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import './FixedPoint128.sol';
import './FullMath.sol';

library Position {
    struct Info {
        uint128 liquidity;
        uint256 feeGrowthInside0X128;
        uint256 feeGrowthInside1X128;
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    function get(
        mapping(bytes32 => Info) storage self,
        address owner,
        int24 tickLower,
        int24 tickUpper
    ) internal view returns (Info storage info) {
        bytes32 key = keccak256(abi.encodePacked(owner, tickLower, tickUpper));
        info = self[key];
    }

    function update(
        Info storage self,
        int128 liquidityDelta,
        uint256 feeGrowthInside0X128,
        uint256 feeGrowthInside1X128
    ) internal {
        uint128 liquidityBefore = self.liquidity;
        uint128 liquidityAfter = liquidityDelta < 0
            ? liquidityBefore - uint128(-liquidityDelta)
            : liquidityBefore + uint128(liquidityDelta);

        if (liquidityDelta != 0) self.liquidity = liquidityAfter;

        uint128 tokensOwed0 = uint128(
            FullMath.mulDiv(
                feeGrowthInside0X128 - self.feeGrowthInside0X128,
                liquidityBefore,
                FixedPoint128.Q128
            )
        );
        uint128 tokensOwed1 = uint128(
            FullMath.mulDiv(
                feeGrowthInside1X128 - self.feeGrowthInside1X128,
                liquidityBefore,
                FixedPoint128.Q128
            )
        );

        if (tokensOwed0 > 0 || tokensOwed1 > 0) {
            self.tokensOwed0 += tokensOwed0;
            self.tokensOwed1 += tokensOwed1;
        }

        self.feeGrowthInside0X128 = feeGrowthInside0X128;
        self.feeGrowthInside1X128 = feeGrowthInside1X128;
    }
}
