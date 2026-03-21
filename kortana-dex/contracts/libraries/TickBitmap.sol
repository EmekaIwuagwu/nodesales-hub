// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TickBitmap {
    function flipTick(
        mapping(int16 => uint256) storage self,
        int24 tick,
        int24 tickSpacing
    ) internal {
        require(tick % tickSpacing == 0);
        int24 compressed = tick / tickSpacing;
        int16 wordPos = int16(compressed >> 8);
        uint8 bitPos = uint8(uint24(compressed) & 0xFF);
        uint256 mask = 1 << bitPos;
        self[wordPos] ^= mask;
    }

    function nextInitializedTickWithinOneWord(
        mapping(int16 => uint256) storage self,
        int24 tick,
        int24 tickSpacing,
        bool lte
    ) internal view returns (int24 next, bool initialized) {
        int24 compressed = tick / tickSpacing;
        if (tick < 0 && tick % tickSpacing != 0) compressed--;

        if (lte) {
            int16 wordPos = int16(compressed >> 8);
            uint8 bitPos = uint8(uint24(compressed) & 0xFF);
            uint256 mask = (1 << bitPos) - 1 + (1 << bitPos);
            uint256 masked = self[wordPos] & mask;

            initialized = masked != 0;
            if (initialized) {
                uint8 mostSignificantBit = 0;
                uint256 r = masked;
                if (r >= 0x100000000000000000000000000000000) { r >>= 128; mostSignificantBit += 128; }
                if (r >= 0x10000000000000000) { r >>= 64; mostSignificantBit += 64; }
                if (r >= 0x100000000) { r >>= 32; mostSignificantBit += 32; }
                if (r >= 0x10000) { r >>= 16; mostSignificantBit += 16; }
                if (r >= 0x100) { r >>= 8; mostSignificantBit += 8; }
                if (r >= 0x10) { r >>= 4; mostSignificantBit += 4; }
                if (r >= 0x4) { r >>= 2; mostSignificantBit += 2; }
                if (r >= 0x2) mostSignificantBit += 1;
                next = (int24(wordPos) << 8 | int24(uint24(mostSignificantBit))) * tickSpacing;
            } else {
                next = (int24(wordPos) << 8) * tickSpacing;
            }
        } else {
            int24 compressedNext = compressed + 1;
            int16 wordPos = int16(compressedNext >> 8);
            uint8 bitPos = uint8(uint24(compressedNext) & 0xFF);
            uint256 mask = ~((1 << bitPos) - 1);
            uint256 masked = self[wordPos] & mask;

            initialized = masked != 0;
            if (initialized) {
                uint8 leastSignificantBit = 0;
                uint256 r = masked;
                if (uint128(r) == 0) { r >>= 128; leastSignificantBit += 128; }
                if (uint64(r) == 0) { r >>= 64; leastSignificantBit += 64; }
                if (uint32(r) == 0) { r >>= 32; leastSignificantBit += 32; }
                if (uint16(r) == 0) { r >>= 16; leastSignificantBit += 16; }
                if (uint8(r) == 0) { r >>= 8; leastSignificantBit += 8; }
                if (r & 0xf == 0) { r >>= 4; leastSignificantBit += 4; }
                if (r & 0x3 == 0) { r >>= 2; leastSignificantBit += 2; }
                if (r & 0x1 == 0) leastSignificantBit += 1;
                next = (int24(wordPos) << 8 | int24(uint24(leastSignificantBit))) * tickSpacing;
            } else {
                next = (int24(wordPos) << 8 | 0xFF) * tickSpacing;
            }
        }
    }
}
