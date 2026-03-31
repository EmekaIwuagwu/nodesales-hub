import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getSigner, getRewardVaultContract, switchToKortana } from "../utils/contracts";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

export function useRewards(token) {
  const [claiming, setClaiming] = useState(false);

  const { data: pending, refetch } = useQuery({
    queryKey:    ["pending-rewards", token],
    enabled:     !!token,
    refetchInterval: 30_000,
    queryFn: async () => {
      const res = await axios.get(`${API}/api/user/pending-rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.pendingDNR;
    },
  });

  async function claim() {
    setClaiming(true);
    try {
      await switchToKortana();
      const signer = await getSigner();
      const vault  = await getRewardVaultContract(signer);
      const tx     = await vault.claimRewards();
      toast("Claiming DNR rewards...", { icon: "⏳" });
      const receipt = await tx.wait();
      toast.success("DNR rewards claimed!");

      // Record claim in backend (non-blocking)
      if (token) {
        axios.post(`${API}/api/user/claim`, { txHash: receipt.hash }, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }

      refetch();
    } catch (err) {
      toast.error(err?.reason || "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  const { data: nextEpoch } = useQuery({
    queryKey:    ["next-epoch"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await axios.get(`${API}/api/rewards/next-epoch`);
      return res.data;
    },
  });

  return { pending, claim, claiming, nextEpoch };
}
