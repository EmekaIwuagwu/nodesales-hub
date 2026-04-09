// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title mdUSD
 * @notice Capped, mintable ERC-20 stablecoin for Kortana DEX.
 *         Written without OpenZeppelin dependencies so it compiles cleanly
 *         on the Kortana EVM (london evmVersion).
 */
contract mdUSD {
    // ── ERC-20 state ──────────────────────────────────────────────────────────
    string  public name;
    string  public symbol;
    uint8   public constant decimals = 18;
    uint256 public totalSupply;
    uint256 public cap;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ── Access control ────────────────────────────────────────────────────────
    address public owner;
    mapping(address => bool) public isOperator;

    // ── Events ────────────────────────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OperatorUpdated(address indexed operator, bool status);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    // ── Modifiers ─────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "mdUSD: not owner");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == owner || isOperator[msg.sender], "mdUSD: not operator");
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 initialSupply,
        uint256 _cap,
        address initialOwner
    ) {
        require(_cap > 0, "mdUSD: cap must be > 0");
        require(initialOwner != address(0), "mdUSD: invalid owner");
        name   = _name;
        symbol = _symbol;
        cap    = _cap;
        owner  = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);

        if (initialSupply > 0) {
            _mintInternal(initialOwner, initialSupply);
        }
    }

    // ── ERC-20 ────────────────────────────────────────────────────────────────
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "mdUSD: insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    function setOperator(address operator, bool status) external onlyOwner {
        isOperator[operator] = status;
        emit OperatorUpdated(operator, status);
    }

    function setCap(uint256 _cap) external onlyOwner {
        require(_cap >= totalSupply, "mdUSD: cap below total supply");
        cap = _cap;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "mdUSD: invalid owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ── Mint / Burn ───────────────────────────────────────────────────────────
    function mint(address to, uint256 amount) external onlyOperator {
        _mintInternal(to, amount);
        emit Mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (from != msg.sender) {
            uint256 allowed = allowance[from][msg.sender];
            require(allowed >= amount, "mdUSD: insufficient allowance");
            if (allowed != type(uint256).max) {
                allowance[from][msg.sender] = allowed - amount;
            }
        }
        require(balanceOf[from] >= amount, "mdUSD: insufficient balance");
        balanceOf[from] -= amount;
        totalSupply     -= amount;
        emit Transfer(from, address(0), amount);
        emit Burn(from, amount);
    }

    // ── Internal ──────────────────────────────────────────────────────────────
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "mdUSD: transfer from zero");
        require(to   != address(0), "mdUSD: transfer to zero");
        require(balanceOf[from] >= amount, "mdUSD: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function _mintInternal(address to, uint256 amount) internal {
        require(to != address(0), "mdUSD: mint to zero");
        require(totalSupply + amount <= cap, "mdUSD: exceeds cap");
        totalSupply   += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}
