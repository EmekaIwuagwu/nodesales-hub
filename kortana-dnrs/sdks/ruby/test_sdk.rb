require_relative './dnrs_sdk'

# Example usage for the DNRS Ruby SDK
rpc_url = "https://poseidon-rpc.testnet.kortana.xyz/"
sdk = Kortana::DNRS::SDK.new(rpc_url)

target_address = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"
balance = sdk.get_balance(target_address)

puts "--- DNRS Ruby SDK Test ---"
puts "Account: #{target_address}"
puts "Balance: #{balance} DNRS"
puts "---------------------------"
