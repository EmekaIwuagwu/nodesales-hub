require_relative './dnrs_sdk'

puts "═" * 45
puts "  Kortana DNRS — Ruby SDK Test Suite"
puts "═" * 45

address = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"

# ── 1. Testnet Balance ───────────────────────────────────
puts "\n[1] Connecting to Kortana Testnet..."
sdk = Kortana::DNRS::SDK.new('KORTANA_TESTNET')

begin
  balance = sdk.get_balance(address)
  puts "    Address : #{address}"
  puts "    Balance : #{balance} DNRS"
rescue => e
  puts "    Error: #{e.message}"
end

# ── 2. Mainnet Config ────────────────────────────────────
puts "\n[2] Mainnet Config:"
mainnet = Kortana::DNRS::SDK::NETWORKS['KORTANA_MAINNET']
puts "    RPC     : #{mainnet['rpc_url']}"
puts "    ChainID : #{mainnet['chain_id']}"
puts "    DNRS    : #{mainnet['dnrs']}"

# ── 3. Transfer walkthrough ───────────────────────────────
puts "\n[3] Transfer — To send DNRS from a funded wallet:"
puts "    sdk_with_key = Kortana::DNRS::SDK.new('KORTANA_TESTNET', '0xYourPrivateKey')"
puts "    tx_hash = sdk_with_key.transfer('0xRecipient', 10.0)"
puts "    puts \"Sent — TX: #{tx_hash}\""

puts "\n#{'─' * 45}"
puts "✅  Ruby SDK test complete."
puts "═" * 45
