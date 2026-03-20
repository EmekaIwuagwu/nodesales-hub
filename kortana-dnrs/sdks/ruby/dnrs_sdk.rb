require 'eth'

# Kortana DNRS — Ruby Integration
module Kortana
  module DNRS
    class SDK
      NETWORKS = {
        'KORTANA_TESTNET' => {
          'rpc_url' => "https://poseidon-rpc.testnet.kortana.xyz/",
          'dnrs' => "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B",
          'boardroom' => "0x216E22FbBC3f891B38434bC92F3512B55Fd02C3f",
          'chain_id' => 72511,
          'explorer' => "https://explorer.testnet.kortana.xyz"
        },
        'KORTANA_MAINNET' => {
          'rpc_url' => "https://zeus-rpc.mainnet.kortana.xyz",
          'dnrs' => "0x0000000000000000000000000000000000000000",
          'boardroom' => "0x0000000000000000000000000000000000000000",
          'chain_id' => 9002,
          'explorer' => "https://explorer.mainnet.kortana.xyz"
        }
      }

      DNRS_ABI = [
        {"constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
        {"constant": false, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "success", "type": "bool"}], "type": "function"}
      ]

      def initialize(network_name = 'KORTANA_TESTNET', private_key = nil)
        @config = NETWORKS[network_name] || NETWORKS['KORTANA_TESTNET']
        @client = Eth::Client.create @config['rpc_url']
        @key = private_key ? Eth::Key.new(priv: private_key) : nil
        @address = Eth::Address.new(@config['dnrs'])
        @contract = Eth::Contract.from_abi(name: "DNRS", address: @config['dnrs'], abi: DNRS_ABI)
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
        # Use simple chain ID support for Ruby SDK
        @client.transact(@contract, :transfer, Eth::Address.new(to_address).to_s, wei_amount, sender_key: @key)
      end
    end
  end
end
