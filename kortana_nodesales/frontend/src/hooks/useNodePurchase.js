import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import toast from "react-hot-toast";
import {
  getSigner,
  getUSDTContract,
  switchToKortana,
} from "../utils/contracts";

const API = import.meta.env.VITE_API_URL || "";

export function useNodePurchase() {
  const [step,    setStep]    = useState("idle"); // idle | paying | waiting | done | error
  const [txHash,  setTxHash]  = useState(null);
  const [receipt, setReceipt] = useState(null);

  /**
   * Purchase flow (Kortana EVM compatible):
   *   1. User sends USDT directly to treasury (one EOA→contract tx, no approve needed).
   *   2. POST /api/nodes/purchase — backend detects the USDT transfer, mints the
   *      NodeLicense from the distributor EOA (EOA→NodeLicense, works on Kortana).
   *
   * @param {number} tierId
   * @param {number} quantity
   * @param {bigint} totalCost   raw USDT amount (6 decimals)
   * @param {string} treasury    treasury wallet address from tier config
   */
  async function purchase(tierId, quantity, totalCost, treasury) {
    setStep("paying");
    setTxHash(null);
    setReceipt(null);

    try {
      await switchToKortana();
      const signer  = await getSigner();
      const usdt    = await getUSDTContract(signer);
      const buyer   = await signer.getAddress();

      // Kortana testnet eth_estimateGas always returns 21576 — explicit gasLimit required.
      const GAS = { gasLimit: 300_000 };

      // Single transaction: send USDT directly to treasury (no approve, no contract logic)
      toast("Sending USDT payment…", { icon: "⏳" });
      const payTx = await usdt.transfer(treasury, totalCost, GAS);
      setTxHash(payTx.hash);
      await payTx.wait();
      toast.success("Payment sent!");

      // Notify backend to verify and mint the license
      setStep("waiting");
      toast("Minting your license…", { icon: "⏳" });

      const { data } = await axios.post(`${API}/api/nodes/purchase`, {
        txHash:  payTx.hash,
        tierId,
        quantity,
        buyer,
      });

      setReceipt({ transactionHash: payTx.hash, ...data });
      setStep("done");
      toast.success("Node license minted!");
      return receipt;

    } catch (err) {
      setStep("error");
      const msg = err?.response?.data?.error || err?.reason || err?.message || "Transaction failed";
      toast.error(msg.length > 100 ? msg.slice(0, 100) + "…" : msg);
      throw err;
    }
  }

  function reset() {
    setStep("idle");
    setTxHash(null);
    setReceipt(null);
  }

  return { purchase, step, txHash, receipt, reset };
}
