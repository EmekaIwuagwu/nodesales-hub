// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * GasDiag - isolates which operation costs excessive gas on Kortana EVM
 */
contract GasDiag {
    uint256 public a;
    uint256 public b;
    uint256 public c;
    uint256 public d;
    uint256 public e;
    uint256 public f;
    uint256 public g;
    uint256 public h;
    mapping(address => uint256) public mapA;
    mapping(address => uint256) public mapB;
    mapping(address => uint256) public mapC;

    // Test 1: 2 SSTOREs (baseline - we know mint() works at ~62k)
    function test2Sstores(uint256 v) external {
        a = v;
        b = v + 1;
    }

    // Test 2: 5 SSTOREs
    function test5Sstores(uint256 v) external {
        a = v;
        b = v + 1;
        c = v + 2;
        d = v + 3;
        e = v + 4;
    }

    // Test 3: 8 SSTOREs
    function test8Sstores(uint256 v) external {
        a = v;
        b = v + 1;
        c = v + 2;
        d = v + 3;
        e = v + 4;
        f = v + 5;
        g = v + 6;
        h = v + 7;
    }

    // Test 4: 3 mapping SSTOREs (simulating balance updates)
    function test3MappingSstores(uint256 v) external {
        mapA[msg.sender] = v;
        mapB[msg.sender] = v + 1;
        mapC[msg.sender] = v + 2;
    }

    // Test 5: 8 SSTOREs + 4 SLOADs
    function test8SstoresWith4Sloads(uint256 v) external {
        uint256 ra = a; // SLOAD
        uint256 rb = b; // SLOAD
        uint256 rc = c; // SLOAD
        uint256 rd = d; // SLOAD
        a = ra + v;
        b = rb + v;
        c = rc + v;
        d = rd + v;
        e = v;
        f = v;
        g = v;
        h = v;
    }

    // Test 6: heavy math (no loops, just lots of MUL/DIV)
    function testHeavyMath(uint256 x, uint256 y) external returns (uint256 z) {
        z = x * y;
        z = z / (x + 1);
        z = z * 997;
        z = z / 1000;
        uint256 t = (z + x / (z == 0 ? 1 : z)) >> 1;
        t = (t + x / (t == 0 ? 1 : t)) >> 1;
        t = (t + x / (t == 0 ? 1 : t)) >> 1;
        t = (t + x / (t == 0 ? 1 : t)) >> 1;
        t = (t + x / (t == 0 ? 1 : t)) >> 1;
        t = (t + x / (t == 0 ? 1 : t)) >> 1;
        t = (t + x / (t == 0 ? 1 : t)) >> 1;
        t = (t + x / (t == 0 ? 1 : t)) >> 1;
        a = t;
    }

    // Test 7: payable + 5 SSTOREs (simulating addLiquidity core)
    function testPayable5Sstores(uint256 v) external payable {
        a = v;
        b = v + msg.value;
        c = v + 2;
        d = v + 3;
        e = v + 4;
    }

    // Test 8: emit event with data
    event TestEvent(address indexed sender, uint256 v1, uint256 v2);
    function testEmit(uint256 v) external {
        a = v;
        emit TestEvent(msg.sender, v, v + 1);
    }

    // Test 9: full addLiquidity simulation (no cross-contract calls)
    mapping(address => uint256) public balance;
    mapping(address => uint256) public lpBal;
    uint256 public rMDUSD;
    uint256 public rDNR;
    uint256 public lpSupply;

    event AddLiq(address indexed to, uint256 mdusd, uint256 dnr, uint256 lp);
    event Sync(uint256 r0, uint256 r1);

    function testFullAddLiq(uint256 amtMDUSD, address to) external payable {
        uint256 liq = amtMDUSD; // simplified: no sqrt for this test
        balance[msg.sender] -= amtMDUSD;
        rMDUSD += amtMDUSD;
        rDNR   += msg.value;
        lpBal[to] += liq;
        lpSupply  += liq;
        emit AddLiq(to, amtMDUSD, msg.value, liq);
        emit Sync(rMDUSD, rDNR);
    }

    function setBalance(address who, uint256 v) external {
        balance[who] = v;
    }
}
