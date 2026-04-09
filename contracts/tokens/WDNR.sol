// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WDNR — Wrapped DNR
 * @notice ERC-20 wrapper for Kortana's native DNR token.
 *         Written without OpenZeppelin so it compiles on london evmVersion.
 */
contract WDNR {
    string  public constant name     = "Wrapped DNR";
    string  public constant symbol   = "WDNR";
    uint8   public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        totalSupply           += msg.value;
        emit Transfer(address(0), msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) public {
        require(balanceOf[msg.sender] >= wad, "WDNR: insufficient balance");
        balanceOf[msg.sender] -= wad;
        totalSupply           -= wad;
        emit Transfer(msg.sender, address(0), wad);
        emit Withdrawal(msg.sender, wad);
        (bool ok,) = msg.sender.call{value: wad}("");
        require(ok, "WDNR: DNR transfer failed");
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "WDNR: insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        return _transfer(from, to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        require(to != address(0), "WDNR: transfer to zero");
        require(balanceOf[from] >= amount, "WDNR: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
