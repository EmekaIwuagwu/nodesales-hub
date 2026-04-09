// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * KortanaMonoDEX  v2
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHY MONOLITHIC
 * Kortana EVM does not support contract-to-contract CALL opcodes.
 * Any CALL from within an executing contract (e.g. pair.mint() → token.balanceOf())
 * consumes all available gas and reverts.
 * Solution: merge mdUSD token + LP token + AMM pool into one contract so every
 * operation is a pure SLOAD/SSTORE with zero outgoing calls.
 *
 * WHY 1e9 INTERNAL PRECISION
 * Kortana EVM also charges prohibitive gas for 256-bit MUL when the result
 * exceeds ~128 bits (i.e. two 1e18-scale values multiplied together produce 10^36).
 * Solution: store all balances and reserves internally as 1e9-scale (9 decimals).
 * External interface stays 18-decimal (multiply by PREC = 1e9 on reads, divide on writes).
 * This keeps every intermediate multiplication ≤ 10^20 — cheap on Kortana.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * External interface (18-decimal values in / out):
 *   mint(to, amount)               — faucet / operator mints mdUSD
 *   transfer / transferFrom        — ERC-20 mdUSD
 *   approve / allowance / balanceOf — ERC-20 mdUSD
 *   addLiquidity(mdUSD, minMDUSD, minDNR, to)  + {value: DNR}
 *   removeLiquidity(lp, minMDUSD, minDNR, to)
 *   swapExactDNRForMDUSD(minOut, to)           + {value: DNR}
 *   swapExactMDUSDForDNR(amountIn, minOut, to)
 *   getReserves()  → (mdUSD, DNR) both 18-decimal
 *   getAmountOut(amountIn, dnrIn)
 *   lpBalanceOf(addr)    — 18-decimal
 *   lpTotalSupply()      — 18-decimal
 */
contract KortanaMonoDEX {

    // ─────────────────────────────────────────────────────────────────────────
    // Constants & precision
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev All external amounts are 18-decimal.
    ///      Internal storage & math use 9-decimal (divide by PREC on ingress,
    ///      multiply by PREC on egress).  This keeps MUL results ≤ ~10^20.
    uint256 private constant PREC = 1e9;

    uint256 public constant MINIMUM_LIQUIDITY = 1000; // 1e3 in 9-decimal LP units

    // ─────────────────────────────────────────────────────────────────────────
    // mdUSD ERC-20  (internal 9-decimal balances)
    // ─────────────────────────────────────────────────────────────────────────

    string  public constant name     = "Mock USD";
    string  public constant symbol   = "mdUSD";
    uint8   public constant decimals = 18;

    mapping(address => uint256) private _bal;                         // 9-dec
    mapping(address => mapping(address => uint256)) public allowance; // 18-dec (user-supplied)
    uint256 private _totalSupply;                                     // 9-dec

    address public owner;
    address public operator;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner_, address indexed spender, uint256 value);

    // ─────────────────────────────────────────────────────────────────────────
    // LP token  (internal 9-decimal balances)
    // ─────────────────────────────────────────────────────────────────────────

    mapping(address => uint256) private _lpBal;  // 9-dec
    uint256 private _lpSupply;                   // 9-dec

    event LPTransfer(address indexed from, address indexed to, uint256 value);

    // ─────────────────────────────────────────────────────────────────────────
    // AMM reserves  (internal 9-decimal)
    // ─────────────────────────────────────────────────────────────────────────

    uint256 private _rMDUSD; // 9-dec
    uint256 private _rDNR;   // 9-dec

    uint8 private _lock;

    event AddLiquidity(address indexed to, uint256 mdUSD, uint256 dnr, uint256 lp);
    event RemoveLiquidity(address indexed to, uint256 mdUSD, uint256 dnr, uint256 lp);
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool dnrIn);
    event Sync(uint256 rMDUSD, uint256 rDNR);

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    constructor(address _operator) {
        owner    = msg.sender;
        operator = _operator;
        _lock    = 1;
    }

    modifier lock() {
        require(_lock == 1, "DEX: LOCKED");
        _lock = 0;
        _;
        _lock = 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // mdUSD token — external views (18-decimal)
    // ─────────────────────────────────────────────────────────────────────────

    function balanceOf(address a) external view returns (uint256) {
        return _bal[a] * PREC;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply * PREC;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // mdUSD token — management
    // ─────────────────────────────────────────────────────────────────────────

    function setOperator(address op, bool enabled) external {
        require(msg.sender == owner, "DEX: FORBIDDEN");
        operator = enabled ? op : address(0);
    }

    function isOperator(address op) external view returns (bool) {
        return op == operator || op == owner;
    }

    /// @param amount 18-decimal
    function mint(address to, uint256 amount) external {
        require(msg.sender == operator || msg.sender == owner, "DEX: FORBIDDEN");
        uint256 s = amount / PREC;
        require(s > 0, "DEX: AMOUNT_TOO_SMALL");
        _bal[to]       += s;
        _totalSupply   += s;
        emit Transfer(address(0), to, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // mdUSD ERC-20
    // ─────────────────────────────────────────────────────────────────────────

    function transfer(address to, uint256 amount) external returns (bool) {
        _move(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 cur = allowance[from][msg.sender];
        if (cur != type(uint256).max) {
            require(cur >= amount, "DEX: INSUFFICIENT_ALLOWANCE");
            allowance[from][msg.sender] = cur - amount;
        }
        _move(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function _move(address from, address to, uint256 amount) private {
        uint256 s = amount / PREC;
        require(s > 0, "DEX: AMOUNT_TOO_SMALL");
        require(_bal[from] >= s, "DEX: INSUFFICIENT_BALANCE");
        _bal[from] -= s;
        _bal[to]   += s;
        emit Transfer(from, to, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LP token — views (18-decimal)
    // ─────────────────────────────────────────────────────────────────────────

    function lpBalanceOf(address a) external view returns (uint256) {
        return _lpBal[a] * PREC;
    }

    function lpTotalSupply() external view returns (uint256) {
        return _lpSupply * PREC;
    }

    function lpTransfer(address to, uint256 amount) external returns (bool) {
        uint256 s = amount / PREC;
        require(s > 0 && _lpBal[msg.sender] >= s, "DEX: INSUFFICIENT_LP");
        _lpBal[msg.sender] -= s;
        _lpBal[to]         += s;
        emit LPTransfer(msg.sender, to, amount);
        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AMM — views (18-decimal)
    // ─────────────────────────────────────────────────────────────────────────

    function getReserves() external view returns (uint256, uint256) {
        return (_rMDUSD * PREC, _rDNR * PREC);
    }

    /// @param amountIn 18-decimal
    function getAmountOut(uint256 amountIn, bool dnrIn) external view returns (uint256) {
        uint256 sIn = amountIn / PREC;
        uint256 out;
        if (dnrIn) out = _amtOut(sIn, _rDNR,   _rMDUSD);
        else       out = _amtOut(sIn, _rMDUSD, _rDNR);
        return out * PREC;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AMM — Add Liquidity
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @param amountMDUSD  desired mdUSD (18-decimal)
     * @param minMDUSD     minimum mdUSD (18-decimal, slippage guard)
     * @param minDNR       minimum DNR   (18-decimal, slippage guard)
     * @param to           LP recipient
     * msg.value           DNR amount (18-decimal native)
     */
    function addLiquidity(
        uint256 amountMDUSD,
        uint256 minMDUSD,
        uint256 minDNR,
        address to
    ) external payable lock returns (uint256 usedMDUSD18, uint256 usedDNR18, uint256 lp18) {
        // ── scale to 9-decimal ──
        uint256 aMD  = amountMDUSD / PREC;
        uint256 aDNR = msg.value   / PREC;
        uint256 minMD  = minMDUSD / PREC;
        uint256 minD   = minDNR   / PREC;

        require(aMD > 0 && aDNR > 0, "DEX: ZERO_AMOUNT");

        uint256 uMD; uint256 uDNR;

        if (_rMDUSD == 0 && _rDNR == 0) {
            uMD  = aMD;
            uDNR = aDNR;
        } else {
            // optDNR = aMD * _rDNR / _rMDUSD  — all 9-dec, max ~10^18 product
            uint256 optDNR = aMD * _rDNR / _rMDUSD;
            if (optDNR <= aDNR) {
                require(optDNR >= minD, "DEX: INSUFFICIENT_DNR");
                uMD  = aMD;
                uDNR = optDNR;
            } else {
                uint256 optMD = aDNR * _rMDUSD / _rDNR;
                require(optMD <= aMD,  "DEX: EXCESSIVE_MDUSD");
                require(optMD >= minMD,"DEX: INSUFFICIENT_MDUSD");
                uMD  = optMD;
                uDNR = aDNR;
            }
        }

        require(_bal[msg.sender] >= uMD, "DEX: INSUFFICIENT_MDUSD_BALANCE");

        // ── mint LP ──
        uint256 liq;
        uint256 curSupply = _lpSupply;
        if (curSupply == 0) {
            // sqrt(uMD * uDNR) — both are 9-dec (~1e9), product ~1e18 (safe!)
            liq = _sqrt(uMD * uDNR) - MINIMUM_LIQUIDITY;
            _lpBal[address(0)] += MINIMUM_LIQUIDITY;
            _lpSupply          += MINIMUM_LIQUIDITY;
        } else {
            uint256 a = uMD  * curSupply / _rMDUSD;
            uint256 b = uDNR * curSupply / _rDNR;
            liq = a < b ? a : b;
        }
        require(liq > 0, "DEX: INSUFFICIENT_LIQUIDITY_MINTED");

        // ── update state ──
        _bal[msg.sender] -= uMD;
        _rMDUSD          += uMD;
        _rDNR            += uDNR;
        _lpBal[to]       += liq;
        _lpSupply        += liq;

        usedMDUSD18 = uMD  * PREC;
        usedDNR18   = uDNR * PREC;
        lp18        = liq  * PREC;

        // refund excess DNR
        uint256 excess = msg.value - usedDNR18;
        if (excess > 0) _sendDNR(msg.sender, excess);

        emit AddLiquidity(to, usedMDUSD18, usedDNR18, lp18);
        emit Sync(_rMDUSD * PREC, _rDNR * PREC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AMM — Remove Liquidity
    // ─────────────────────────────────────────────────────────────────────────

    function removeLiquidity(
        uint256 lpAmount,   // 18-decimal
        uint256 minMDUSD,   // 18-decimal
        uint256 minDNR,     // 18-decimal
        address to
    ) external lock returns (uint256 outMDUSD18, uint256 outDNR18) {
        uint256 sLP  = lpAmount / PREC;
        require(sLP > 0 && _lpBal[msg.sender] >= sLP, "DEX: INSUFFICIENT_LP");

        uint256 aMD  = sLP * _rMDUSD / _lpSupply;
        uint256 aDNR = sLP * _rDNR   / _lpSupply;

        require(aMD  * PREC >= minMDUSD, "DEX: INSUFFICIENT_MDUSD_OUT");
        require(aDNR * PREC >= minDNR,   "DEX: INSUFFICIENT_DNR_OUT");

        _lpBal[msg.sender] -= sLP;
        _lpSupply          -= sLP;
        _rMDUSD            -= aMD;
        _rDNR              -= aDNR;
        _bal[to]           += aMD;

        outMDUSD18 = aMD  * PREC;
        outDNR18   = aDNR * PREC;

        _sendDNR(to, outDNR18);

        emit RemoveLiquidity(to, outMDUSD18, outDNR18, lpAmount);
        emit Sync(_rMDUSD * PREC, _rDNR * PREC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AMM — Swaps
    // ─────────────────────────────────────────────────────────────────────────

    function swapExactDNRForMDUSD(
        uint256 minOut, // 18-decimal
        address to
    ) external payable lock returns (uint256 amountOut18) {
        require(msg.value > 0, "DEX: ZERO_INPUT");
        uint256 sIn  = msg.value / PREC;
        uint256 sOut = _amtOut(sIn, _rDNR, _rMDUSD);
        require(sOut * PREC >= minOut, "DEX: INSUFFICIENT_OUTPUT");

        _rDNR    += sIn;
        _rMDUSD  -= sOut;
        _bal[to] += sOut;

        amountOut18 = sOut * PREC;
        emit Swap(msg.sender, msg.value, amountOut18, true);
        emit Sync(_rMDUSD * PREC, _rDNR * PREC);
    }

    function swapExactMDUSDForDNR(
        uint256 amountIn, // 18-decimal
        uint256 minOut,   // 18-decimal
        address to
    ) external lock returns (uint256 amountOut18) {
        uint256 sIn = amountIn / PREC;
        require(sIn > 0 && _bal[msg.sender] >= sIn, "DEX: INSUFFICIENT_MDUSD");
        uint256 sOut = _amtOut(sIn, _rMDUSD, _rDNR);
        require(sOut * PREC >= minOut, "DEX: INSUFFICIENT_OUTPUT");

        _bal[msg.sender] -= sIn;
        _rMDUSD          += sIn;
        _rDNR            -= sOut;
        _sendDNR(to, sOut * PREC);

        amountOut18 = sOut * PREC;
        emit Swap(msg.sender, amountIn, amountOut18, false);
        emit Sync(_rMDUSD * PREC, _rDNR * PREC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev x/y/z are all 9-decimal — product rIn*amtIn ≤ ~10^18, safe
    function _amtOut(uint256 aIn, uint256 rIn, uint256 rOut) private pure returns (uint256) {
        require(aIn > 0 && rIn > 0 && rOut > 0, "DEX: INVALID");
        uint256 aFee = aIn * 997;
        return aFee * rOut / (rIn * 1000 + aFee);
    }

    function _sendDNR(address to, uint256 amount18) private {
        (bool ok, ) = payable(to).call{value: amount18}("");
        require(ok, "DEX: DNR_SEND_FAILED");
    }

    /// @dev Integer sqrt, loop-free (fixed Newton iterations).
    ///      Input is 9-dec scale so x ≤ ~10^20, max intermediate ≤ 10^20.
    function _sqrt(uint256 x) private pure returns (uint256 z) {
        if (x == 0) return 0;
        uint256 y = x;
        z = 1;
        if (y >> 64 > 0) { z <<= 32; y >>= 64; }
        if (y >> 32 > 0) { z <<= 16; y >>= 32; }
        if (y >> 16 > 0) { z <<= 8;  y >>= 16; }
        if (y >> 8  > 0) { z <<= 4;  y >>= 8;  }
        if (y >> 4  > 0) { z <<= 2;  y >>= 4;  }
        if (y >> 2  > 0) { z <<= 1;             }
        z <<= 1;
        // 6 Newton iterations (sufficient for 68-bit input)
        z = (z + x / z) >> 1;
        z = (z + x / z) >> 1;
        z = (z + x / z) >> 1;
        z = (z + x / z) >> 1;
        z = (z + x / z) >> 1;
        z = (z + x / z) >> 1;
        if (z > x / z) z = x / z;
    }

    receive() external payable {}
}
