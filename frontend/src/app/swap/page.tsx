"use client";

import { SwapCard } from "@/components/swap/SwapCard";
import { motion } from "framer-motion";

export default function SwapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[480px] relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-dnr/20 to-accent-mdusd/20 blur-xl rounded-3xl opacity-50" />
        <SwapCard />
      </motion.div>
    </div>
  );
}
