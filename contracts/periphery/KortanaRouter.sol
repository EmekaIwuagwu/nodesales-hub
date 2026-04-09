// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./libraries/KortanaLibrary.sol";
import "../core/interfaces/IKortanaFactory.sol";
import "../core/interfaces/IKortanaPair.sol";

interface IERC20 {
    function balanceOf(address owner) external view returns (uint);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IWDNR {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}

contract KortanaRouter {
    address public immutable factory;
    address public immutable WDNR;

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, "KortanaRouter: EXPIRED");
        _;
    }

    constructor(address _factory, address _WDNR) {
        factory = _factory;
        WDNR = _WDNR;
    }

    receive() external payable {
        assert(msg.sender == WDNR); // only accept DNR via fallback from the WDNR contract
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {
        // On Kortana, pairs must be pre-deployed and registered via factory.registerPair().
        // Internal contract creation (CREATE/CREATE2) is not supported by the Kortana EVM.
        require(
            IKortanaFactory(factory).getPair(tokenA, tokenB) != address(0),
            "KortanaRouter: PAIR_NOT_REGISTERED"
        );
        (uint reserveA, uint reserveB) = KortanaLibrary.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = KortanaLibrary.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "KortanaRouter: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = KortanaLibrary.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "KortanaRouter: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external virtual ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = KortanaLibrary.pairFor(factory, tokenA, tokenB);
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = IKortanaPair(pair).mint(to);
    }

    function addLiquidityDNR(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountDNRMin,
        address to,
        uint deadline
    ) external virtual payable ensure(deadline) returns (uint amountToken, uint amountDNR, uint liquidity) {
        (amountToken, amountDNR) = _addLiquidity(
            token,
            WDNR,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountDNRMin
        );
        address pair = KortanaLibrary.pairFor(factory, token, WDNR);
        IERC20(token).transferFrom(msg.sender, pair, amountToken);
        IWDNR(WDNR).deposit{value: amountDNR}();
        assert(IWDNR(WDNR).transfer(pair, amountDNR));
        liquidity = IKortanaPair(pair).mint(to);
        // refund dust eth, if any
        if (msg.value > amountDNR) {
            (bool success, ) = msg.sender.call{value: msg.value - amountDNR}("");
            require(success, "Transfer failed");
        }
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public virtual ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = KortanaLibrary.pairFor(factory, tokenA, tokenB);
        IERC20(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = IKortanaPair(pair).burn(to);
        (address token0,) = KortanaLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, "KortanaRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "KortanaRouter: INSUFFICIENT_B_AMOUNT");
    }

    function removeLiquidityDNR(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountDNRMin,
        address to,
        uint deadline
    ) public virtual ensure(deadline) returns (uint amountToken, uint amountDNR) {
        (amountToken, amountDNR) = removeLiquidity(
            token,
            WDNR,
            liquidity,
            amountTokenMin,
            amountDNRMin,
            address(this),
            deadline
        );
        IERC20(token).transfer(to, amountToken);
        IWDNR(WDNR).withdraw(amountDNR);
        (bool success, ) = to.call{value: amountDNR}("");
        require(success, "Transfer failed");
    }

    // Trimped for EIP-170 compliance (staying under 24KB)

    // **** LIBRARY FUNCTIONS ****
    function quote(uint amountA, uint reserveA, uint reserveB) public pure virtual returns (uint amountB) {
        return KortanaLibrary.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        returns (uint amountOut)
    {
        return KortanaLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        returns (uint amountIn)
    {
        return KortanaLibrary.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint amountIn, address[] memory path)
        public
        view
        virtual
        returns (uint[] memory amounts)
    {
        return KortanaLibrary.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint amountOut, address[] memory path)
        public
        view
        virtual
        returns (uint[] memory amounts)
    {
        return KortanaLibrary.getAmountsIn(factory, amountOut, path);
    }
}
