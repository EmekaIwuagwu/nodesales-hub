"use client";

import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { month: 'JUL', val: 980 },
    { month: 'AUG', val: 1025 },
    { month: 'SEP', val: 990 },
    { month: 'OCT', val: 1050 },
    { month: 'NOV', val: 1100 },
    { month: 'DEC', val: 1150 },
    { month: 'JAN', val: 1240 },
];

export default function SpendingChart() {
    return (
        <div className="w-full flex-1">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h3 className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">Grid Consumption</h3>
                </div>
                <div className="text-xl font-display font-black text-white">◈ 1,240 <span className="text-[10px] text-primary-bright tracking-widest ml-2">DNR</span></div>
            </div>

            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            fontSize={8}
                            fontWeight={900}
                            stroke="rgba(255,255,255,0.1)"
                            dy={10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#010409',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '1rem',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 900
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="val"
                            stroke="#38BDF8"
                            fillOpacity={1}
                            fill="url(#chartGradient)"
                            strokeWidth={3}
                            animationDuration={3000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
