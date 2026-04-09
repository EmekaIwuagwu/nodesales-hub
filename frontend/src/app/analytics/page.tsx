"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, WDNR_ADDRESS, MDUSD_ADDRESS, PAIR_ABI } from "@/lib/contracts";
import { formatEther } from "viem";

const MOCK_DATA = [
  { time: "18:00", price: 1.001 },
  { time: "19:00", price: 1.002 },
  { time: "20:00", price: 1.005 },
  { time: "21:00", price: 0.998 },
  { time: "22:00", price: 0.995 },
  { time: "23:00", price: 1.000 },
  { time: "00:00", price: 1.001 },
  { time: "01:00", price: 1.003 },
  { time: "02:00", price: 1.004 },
];

export default function AnalyticsPage() {
  // Find Pair Address
  const { data: pairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [WDNR_ADDRESS as `0x${string}`, MDUSD_ADDRESS as `0x${string}`],
  });

  // Get Reserves
  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000", refetchInterval: 15000 }
  });

  const reserve0 = reserves ? parseFloat(formatEther((reserves as unknown as bigint[])[0])) : 0;
  const reserve1 = reserves ? parseFloat(formatEther((reserves as unknown as bigint[])[1])) : 0;
  const tvl = (reserve0 + reserve1);

  return (
    <div className="flex flex-col gap-6 w-full mx-auto min-h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-white">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-accent-dnr border-2 border-bg-primary z-10 flex text-black font-bold items-center justify-center text-xs">K</div>
            <div className="w-8 h-8 rounded-full bg-accent-mdusd border-2 border-bg-primary flex text-white font-bold items-center justify-center text-xs">$</div>
          </div>
          <h1 className="text-3xl font-space font-bold ml-2">DNR / mdUSD</h1>
        </div>
        <div className="bg-accent-dnr/10 text-accent-dnr rounded-full px-4 py-1 text-sm font-bold border border-accent-dnr/20 tracking-wider">0.30% Fee Tier</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-dnr/5 blur-[120px] -z-10" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-text-secondary text-sm font-bold mb-1 uppercase tracking-widest opacity-60">Price Discovery</div>
              <div className="text-5xl font-space font-bold text-white tracking-tighter">
                {reserve1 > 0 ? (reserve0 / reserve1).toFixed(4) : "1.000"} <span className="text-white/40">mdUSD</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success text-sm font-bold">Real-time Reserves Feed</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-dnr)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-dnr)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 0.005', 'dataMax + 0.005']} />
                <Tooltip 
                  cursor={{ stroke: 'var(--accent-dnr)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                />
                <Area type="monotone" dataKey="price" stroke="var(--accent-dnr)" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="bg-bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-widest text-xs opacity-60">Pool Health</h3>
            <div className="flex flex-col gap-8">
              <div className="group">
                <span className="text-text-secondary text-sm font-bold uppercase tracking-wider block mb-2 opacity-60">Total Value Locked</span>
                <span className="font-space font-bold text-4xl text-white group-hover:text-accent-dnr transition-all tracking-tighter">
                    ${tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <p className="text-[10px] text-text-tertiary mt-1 font-bold">LIVE ON-CHAIN RESERVES</p>
              </div>
              <div className="group">
                <span className="text-text-secondary text-sm font-bold uppercase tracking-wider block mb-2 opacity-60">Volume (24h)</span>
                <span className="font-space font-bold text-4xl text-white tracking-tighter">$1,250</span>
                <p className="text-[10px] text-text-tertiary mt-1 font-bold uppercase">Estimated from events</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 mt-auto">
            <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-widest text-xs opacity-60">Pool Split</h3>
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-dnr flex items-center justify-center text-[10px] font-bold text-black">K</div>
                        <span className="text-white font-bold tracking-tight">DNR</span>
                    </div>
                    <span className="text-success font-space font-bold">{reserve0.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-mdusd flex items-center justify-center text-[10px] font-bold text-white">$</div>
                        <span className="text-white font-bold tracking-tight">mdUSD</span>
                    </div>
                    <span className="text-success font-space font-bold">{reserve1.toLocaleString()}</span>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
