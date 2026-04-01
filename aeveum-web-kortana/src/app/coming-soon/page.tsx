"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="pt-48 pb-64 bg-background-primary min-h-screen flex items-center justify-center overflow-hidden relative text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,212,255,0.05)_0%,_transparent_50%)]" />
      
      <div className="max-w-4xl mx-auto px-6 space-y-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="p-8 glass rounded-none border-accent-primary/20 bg-accent-primary/5">
            <Settings className="w-24 h-24 text-accent-primary animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-black font-heading uppercase tracking-tighter text-white">
              SQUADRON <br/>
              <span className="text-accent-primary uppercase">COMING SOON.</span>
            </h1>
            <p className="text-xl text-text-secondary font-medium tracking-tight uppercase">
              // DEPLOYMENT SCHEDULE IN REVISION
            </p>
          </div>
          
          <div className="pt-12">
            <Link href="/" className="btn-primary flex items-center gap-4 group uppercase tracking-widest">
              RETURN TO BASE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Speed Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[1px] h-screen bg-gradient-to-b from-transparent via-accent-primary to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-screen bg-gradient-to-b from-transparent via-accent-secondary to-transparent" />
      </div>
    </div>
  );
}
