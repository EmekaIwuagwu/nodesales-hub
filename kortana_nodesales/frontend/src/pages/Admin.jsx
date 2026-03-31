import { useState }    from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios           from "axios";
import toast           from "react-hot-toast";
import { useStore }    from "../store/useStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import Logo from "../components/Logo";

const API = import.meta.env.VITE_API_URL || "";

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

const TIER_NAMES = ["Genesis", "Early", "Full", "Premium"];

export default function Admin() {
  const token = useStore(s => s.token);
  const qc    = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: dash } = useQuery({
    queryKey: ["admin-dashboard", token],
    queryFn:  async () => (await axios.get(`${API}/api/admin/dashboard`, authHeaders(token))).data,
  });

  const distribute = useMutation({
    mutationFn: () => axios.post(`${API}/api/admin/distribute`, {}, authHeaders(token)),
    onSuccess:  () => { toast.success("Distribution triggered!"); qc.invalidateQueries(["admin-dashboard"]); },
    onError:    () => toast.error("Distribution failed"),
  });

  const TABS = ["overview", "tiers", "users", "faqs"];

  return (
    <div className="min-h-screen bg-kortana-900 pb-20">
      <div className="border-b border-kortana-700 px-6 py-4 flex items-center gap-4">
        <Logo size="md" />
        <span className="font-semibold text-gray-400">/ Admin</span>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
          ADMIN
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Nav */}
        <div className="flex gap-2 mb-8 border-b border-kortana-700 pb-4">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-kortana-accent text-kortana-900" : "text-gray-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────── */}
        {tab === "overview" && (
          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users",        value: dash?.totalUsers?.toLocaleString() ?? "—" },
                { label: "USDT Raised",        value: dash?.config ? `$${((dash.config.totalUSDTRaised || 0) / 1e6).toFixed(0)}` : "—" },
                { label: "DNR Distributed",    value: dash?.config?.totalDNRDistributed?.toLocaleString() ?? "—" },
                { label: "Current Epoch",      value: dash?.config?.currentEpoch ?? "—" },
              ].map(s => (
                <div key={s.label} className="card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Reward Distribution</h3>
                <button
                  onClick={() => distribute.mutate()}
                  disabled={distribute.isPending}
                  className="btn-primary text-sm py-2 px-4"
                >
                  {distribute.isPending ? "Triggering..." : "Trigger Distribution"}
                </button>
              </div>
              <div className="space-y-3">
                {dash?.recentEpochs?.map(ep => (
                  <div key={ep.epochNumber} className="flex justify-between text-sm border-b border-kortana-700/50 pb-3">
                    <span className="text-gray-400">Epoch #{ep.epochNumber}</span>
                    <span>{ep.totalDNRDistributed?.toLocaleString()} DNR</span>
                    <span className="text-gray-400">{ep.totalRecipients} wallets</span>
                    <span className={`tier-badge ${ep.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                      {ep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tiers ─────────────────────────────────────────────── */}
        {tab === "tiers" && (
          <div className="card">
            <h3 className="text-lg font-bold mb-6">Tier Management</h3>
            <TierManager token={token} />
          </div>
        )}

        {/* ── Users ─────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="card">
            <h3 className="text-lg font-bold mb-6">Users</h3>
            <UserList token={token} />
          </div>
        )}

        {/* ── FAQs ──────────────────────────────────────────────── */}
        {tab === "faqs" && (
          <div className="card">
            <h3 className="text-lg font-bold mb-6">FAQ Manager</h3>
            <FAQManager token={token} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierManager({ token }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["tiers"],
    queryFn:  async () => (await axios.get(`${API}/api/nodes/tiers`)).data,
  });

  async function toggleActive(tierId, active) {
    try {
      await axios.put(`${API}/api/admin/tier/${tierId}`, { active: !active }, authHeaders(token));
      toast.success("Tier updated");
      qc.invalidateQueries(["tiers"]);
    } catch { toast.error("Update failed"); }
  }

  return (
    <div className="space-y-4">
      {(data?.tiers ?? []).map((t, i) => (
        <div key={t.tierId} className="flex items-center justify-between border border-kortana-700 rounded-xl p-4">
          <div>
            <div className="font-bold">{TIER_NAMES[i]}</div>
            <div className="text-sm text-gray-400">${(t.priceUSDT / 1e6).toFixed(0)} · {t.sold}/{t.maxSupply} sold</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full bg-kortana-700 rounded-full h-2 w-32">
              <div
                className="bg-kortana-accent h-2 rounded-full"
                style={{ width: `${(t.sold / t.maxSupply) * 100}%` }}
              />
            </div>
            <button
              onClick={() => toggleActive(t.tierId, t.active)}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                t.active
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "border-green-500/30 text-green-400 hover:bg-green-500/10"
              }`}
            >
              {t.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserList({ token }) {
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-users", search],
    queryFn:  async () => (await axios.get(`${API}/api/admin/users?search=${search}`, authHeaders(token))).data,
  });

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by wallet address..."
        className="w-full bg-kortana-700 border border-kortana-600 rounded-lg px-4 py-2 mb-6 text-sm"
      />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-kortana-700">
            <th className="text-left py-3 pr-6">Wallet</th>
            <th className="text-left py-3 pr-6">Joined</th>
            <th className="text-left py-3 pr-6">Referrals</th>
            <th className="text-left py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {(data?.users ?? []).map(u => (
            <tr key={u._id} className="border-b border-kortana-700/50">
              <td className="py-3 pr-6 font-mono text-xs">{u.walletAddress}</td>
              <td className="py-3 pr-6 text-gray-400">{new Date(u.joinedAt).toLocaleDateString()}</td>
              <td className="py-3 pr-6">{u.totalReferrals}</td>
              <td className="py-3">
                {u.isBlacklisted
                  ? <span className="tier-badge bg-red-500/20 text-red-400">Blacklisted</span>
                  : <span className="tier-badge bg-green-500/20 text-green-400">Active</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQManager({ token }) {
  const qc = useQueryClient();
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const { data: faqs } = useQuery({
    queryKey: ["faqs"],
    queryFn:  async () => (await axios.get(`${API}/api/faq`)).data,
  });

  async function addFAQ() {
    if (!newQ || !newA) return;
    try {
      await axios.post(`${API}/api/admin/faq`, { question: newQ, answer: newA }, authHeaders(token));
      setNewQ(""); setNewA("");
      toast.success("FAQ added");
      qc.invalidateQueries(["faqs"]);
    } catch { toast.error("Failed to add FAQ"); }
  }

  async function deleteFAQ(id) {
    try {
      await axios.delete(`${API}/api/admin/faq/${id}`, authHeaders(token));
      toast.success("FAQ deleted");
      qc.invalidateQueries(["faqs"]);
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div>
      <div className="space-y-3 mb-8 border-b border-kortana-700 pb-8">
        <input
          value={newQ}
          onChange={e => setNewQ(e.target.value)}
          placeholder="Question..."
          className="w-full bg-kortana-700 border border-kortana-600 rounded-lg px-4 py-2 text-sm"
        />
        <textarea
          value={newA}
          onChange={e => setNewA(e.target.value)}
          placeholder="Answer..."
          rows={3}
          className="w-full bg-kortana-700 border border-kortana-600 rounded-lg px-4 py-2 text-sm resize-none"
        />
        <button onClick={addFAQ} className="btn-primary text-sm py-2 px-4">Add FAQ</button>
      </div>

      <div className="space-y-4">
        {(faqs ?? []).map(faq => (
          <div key={faq._id} className="border border-kortana-700 rounded-xl p-4">
            <div className="flex justify-between">
              <p className="font-medium">{faq.question}</p>
              <button
                onClick={() => deleteFAQ(faq._id)}
                className="text-red-400 hover:text-red-300 text-sm ml-4"
              >
                Delete
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
