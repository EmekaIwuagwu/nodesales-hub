require 'eth'

# Kortana DNRS — Ruby Integration
module Kortana
  module DNRS
    class SDK
      DNRS_ADDRESS = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B"
      DNRS_ABI = [
        {"constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
        {"constant": false, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "success", "type": "bool"}], "type": "function"}
      ]

      def initialize(rpc_url, private_key = nil)
        @client = Eth::Client.create rpc_url
        @key = private_key ? Eth::Key.new(priv: private_key) : nil
        @address = Eth::Address.new(DNRS_ADDRESS)
        @contract = Eth::Contract.from_abi(name: "DNRS", address: DNRS_ADDRESS, abi: DNRS_ABI)
      end

      # Get the DNRS balance of a specific address
      def get_balance(wallet_address)
        wei_balance = @client.call(@contract, :balanceOf, Eth::Address.new(wallet_address).to_s)
        Eth::Unit.from_wei(wei_balance)
      end

      # Transfer DNRS tokens (requires private key at initialization)
      def transfer(to_address, amount_ether)
        raise "Initialization error: Private key required for transfers" unless @key
        
        wei_amount = Eth::Unit.to_wei(amount_ether)
        @client.transact(@contract, :transfer, Eth::Address.new(to_address).to_s, wei_amount, sender_key: @key)
      end
    end
  end
end
