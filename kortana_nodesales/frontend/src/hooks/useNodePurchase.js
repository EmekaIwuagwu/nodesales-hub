import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  getSigner,
  getNodeSaleContract,
  getUSDTContract,
  switchToKortana,
} from "../utils/contracts";

export function useNodePurchase() {
  const [step,    setStep]    = useState("idle"); // idle | approving | purchasing | done | error
  const [txHash,  setTxHash]  = useState(null);
  const [receipt, setReceipt] = useState(null);

  async function purchase(tierId, quantity, totalCost) {
    setStep("approving");
    setTxHash(null);
    setReceipt(null);

    try {
      await switchToKortana();
      const signer   = await getSigner();
      const usdt     = await getUSDTContract(signer);
      const nodeSale = await getNodeSaleContract(signer);
      const buyer    = await signer.getAddress();
      const nodeSaleAddr = await nodeSale.getAddress();

      // Check allowance — approve exact amount only
      const allowance = await usdt.allowance(buyer, nodeSaleAddr);
      if (allowance < totalCost) {
        toast("Approving USDT spend...", { icon: "⏳" });
        const approveTx = await usdt.approve(nodeSaleAddr, totalCost);
        setTxHash(approveTx.hash);
        await approveTx.wait();
        toast.success("USDT approved!");
      }

      // Purchase
      setStep("purchasing");
      toast("Confirming purchase...", { icon: "⏳" });
      const purchaseTx = await nodeSale.purchaseNode(tierId, quantity);
      setTxHash(purchaseTx.hash);
      const rec = await purchaseTx.wait();
      setReceipt(rec);
      setStep("done");
      toast.success("Node license purchased!");
      return rec;

    } catch (err) {
      setStep("error");
      const msg = err?.reason || err?.message || "Transaction failed";
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
