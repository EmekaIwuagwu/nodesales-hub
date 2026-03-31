import { useState }   from "react";
import { useQuery }   from "@tanstack/react-query";
import axios          from "axios";

const API = import.meta.env.VITE_API_URL || "";

export default function RewardHistory({ token }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey:    ["reward-history", token, page],
    enabled:     !!token,
    queryFn: async () => (await axios.get(`${API}/api/user/rewards?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    })).data,
  });

  function exportCSV() {
    if (!data?.rewards) return;
    const rows  = [["Epoch", "DNR Amount", "Status", "Date"]];
    data.rewards.forEach(r => {
      rows.push([r.epochNumber, r.dnrAmount, r.claimed ? "Claimed" : "Pending", new Date(r.createdAt).toLocaleDateString()]);
    });
    const csv   = rows.map(r => r.join(",")).join("\n");
    const blob  = new Blob([csv], { type: "text/csv" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href = url; a.download = "kortana-rewards.csv"; a.click();
  }

  if (isLoading) return <div className="animate-pulse h-32 bg-kortana-700 rounded-xl" />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={exportCSV} className="btn-outline text-xs py-1.5 px-3">
          Export CSV
        </button>
      </div>

      {!data?.rewards?.length ? (
        <p className="text-gray-500 text-center py-8">No reward history yet.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-kortana-700">
                <th className="text-left py-3 pr-6">Epoch</th>
                <th className="text-right py-3 pr-6">DNR Earned</th>
                <th className="text-right py-3 pr-6">Status</th>
                <th className="text-right py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.rewards.map(r => (
                <tr key={r._id} className="border-b border-kortana-700/50">
                  <td className="py-3 pr-6">#{r.epochNumber}</td>
                  <td className="text-right py-3 pr-6 text-kortana-green font-bold">
                    {r.dnrAmount.toLocaleString()} DNR
                  </td>
                  <td className="text-right py-3 pr-6">
                    <span className={`tier-badge ${r.claimed ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                      {r.claimed ? "Claimed" : "Pending"}
                    </span>
                  </td>
                  <td className="text-right py-3 text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-sm py-2 px-4">
                ← Prev
              </button>
              <span className="py-2 px-4 text-gray-400 text-sm">
                {page} / {data.pages}
              </span>
              <button disabled={page === data.pages} onClick={() => setPage(p => p + 1)} className="btn-outline text-sm py-2 px-4">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
