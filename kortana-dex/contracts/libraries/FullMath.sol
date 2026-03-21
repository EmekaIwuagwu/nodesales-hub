// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Contains 512-bit math functions
/// @notice Facilitates multiplication and division that can have intermediate values exceeding 256 bits
/// @dev Adapted from https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/FullMath.sol
library FullMath {
    /// @notice Calculates floor(a×b÷denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
    /// @param a The multiplicand
    /// @param b The multiplier
    /// @param denominator The divisor
    /// @return result The 256-bit result
    /// @dev Credit to Remco Bloemen under MIT license https://xn--2-umb.com/21/muldiv
    function mulDiv(
        uint256 a,
        uint256 b,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = a * b
            // Compute the product mod 2^256 and mod 2^256 - 1
            // then use the Chinese Remainder Theorem to reconstruct the 512 bit result.
            // The result is stored in two 256-bit variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(a, b, not(0))
                prod0 := mul(a, b)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division
            if (prod1 == 0) {
                require(denominator > 0);
                assembly {
                    result := div(prod0, denominator)
                }
                return result;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0
            require(denominator > prod1);

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0]
            // Compute remainder using mulmod
            uint256 remainder;
            assembly {
                remainder := mulmod(a, b, denominator)
            }
            // Subtract 256 bit number from 512 bit number
            assembly {
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator
            // Compute largest power of two divisor of denominator.
            // Always >= 1.
            uint256 lpotb = denominator & (~denominator + 1);
            // Divide denominator by power of two
            assembly {
                denominator := div(denominator, lpotb)
            }

            // Divide [prod1 prod0] by the factors of two
            assembly {
                prod0 := div(prod0, lpotb)
            }
            // Shift in bits from prod1 into prod0. For this we need
            // to flip lpotb such that it is 2^256 / lpotb.
            // If lpotb is 1, then lpotb becomes 0.
            uint256 flip = (~lpotb + 1) / lpotb + 1;
            assembly {
                prod0 := or(prod0, mul(prod1, flip))
            }

            // Invert denominator mod 2^256
            // Now that denominator is odd, it has an inverse
            // modulo 2^256 such that denominator * inv = 1 mod 2^256.
            // Compute the inverse by starting with a seed that is correct
            // for four bits. That is, denominator * inv = 1 mod 2^4
            uint256 inv = (3 * denominator) ^ 2;
            // Now use Newton-Raphson iteration to improve the precision.
            // Thanks to Hensel's lifting lemma, this also works in modular
            // arithmetic, doubling the correct bits in each step.
            inv *= 2 - denominator * inv; // 8 bits
            inv *= 2 - denominator * inv; // 16 bits
            inv *= 2 - denominator * inv; // 32 bits
            inv *= 2 - denominator * inv; // 64 bits
            inv *= 2 - denominator * inv; // 128 bits
            inv *= 2 - denominator * inv; // 256 bits

            // Because the division is now exact we can multiply by the modular
            // inverse of denominator to get the answer. This will give the
            // 256-bit result modulo 2^256.
            result = prod0 * inv;
        }
    }

    /// @notice Calculates ceil(a×b÷denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
    /// @param a The multiplicand
    /// @param b The multiplier
    /// @param denominator The divisor
    /// @return result The 256-bit result
    function mulDivRoundingUp(
        uint256 a,
        uint256 b,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        result = mulDiv(a, b, denominator);
        if (mulmod(a, b, denominator) > 0) {
            require(result < type(uint256).max);
            result++;
        }
    }
}
