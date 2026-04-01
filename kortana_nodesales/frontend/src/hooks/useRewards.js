import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

/**
 * Rewards are auto-distributed directly to wallets each epoch.
 * No on-chain claim needed — DNR arrives automatically.
 */
export function useRewards(token) {
  const { data: pending, refetch } = useQuery({
    queryKey:        ["pending-rewards", token],
    enabled:         !!token,
    refetchInterval: 30_000,
    queryFn: async () => {
      const res = await axios.get(`${API}/api/user/pending-rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.pendingDNR;
    },
  });

  const { data: nextEpoch } = useQuery({
    queryKey:        ["next-epoch"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await axios.get(`${API}/api/rewards/next-epoch`);
      return res.data;
    },
  });

  return { pending, refetch, nextEpoch };
}
