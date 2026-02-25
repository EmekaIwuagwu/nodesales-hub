"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
    endDate: string;
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const target = new Date(endDate).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [endDate]);

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds }
    ];

    const getColor = () => {
        if (timeLeft.days < 1) return 'text-red-500';
        if (timeLeft.days < 7) return 'text-orange-500';
        return 'text-indigo-400';
    };

    return (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {units.map((unit, index) => (
                <motion.div
                    key={unit.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative group">
                        <div className={`text-4xl md:text-6xl font-black font-space ${getColor()} bg-white/5 backdrop-blur-md px-4 py-6 rounded-2xl border border-white/10 shadow-2xl min-w-[100px] text-center`}>
                            {unit.value.toString().padStart(2, '0')}
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    </div>
                    <span className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest mt-3">
                        {unit.label}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
