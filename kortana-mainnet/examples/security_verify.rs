
use kortana_blockchain_rust::vm::evm::EvmExecutor;
use kortana_blockchain_rust::state::account::{State, Account};
use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::types::block::BlockHeader;

fn test_security_remediation_math_u256() {
    let addr = Address::from_pubkey(b"tester");
    let mut executor = EvmExecutor::new(addr, 1_000_000);
    let mut state = State::new();
    let header = BlockHeader {
        version: 1, height: 1, slot: 1, timestamp: 1,
        parent_hash: [0u8; 32], state_root: [0u8; 32],
        transactions_root: [0u8; 32], receipts_root: [0u8; 32],
        poh_hash: [0u8; 32], poh_sequence: 0,
        proposer: Address::ZERO, gas_used: 0, gas_limit: 1000000,
        base_fee: 1, vrf_output: [0u8; 32],
    };

    // Test: Exponentiation that overflows u128 (K-CRIT-01 Fix)
    // PUSH1 0x02, PUSH2 0x0081 (129), EXP
    let bytecode = vec![0x61, 0x00, 0x81, 0x60, 0x02, 0x0a, 0x00];
    executor.execute(&bytecode, &mut state, &header).unwrap();
    let result = executor.stack.pop().unwrap();
    
    // 2^128 would be bit 128 set.
    // In big-endian 256-bit [0..31], bit 128 is at result[15] = 0x01
    // 2^129 is result[15] = 0x02
    assert_eq!(result[15], 0x02); 
    println!("U256 Math Check Passed: 2^129 result is correct.");
}

fn main() {
    // Run manually for quick verify
    test_security_remediation_math_u256();
    println!("SUCCESS: Security remediation verified.");
}
