"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,51,102,0.05)_0%,_transparent_70%)]" />
      
      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="space-y-8"
        >
          <div className="inline-block p-8 glass border-accent-tertiary/20 bg-accent-tertiary/5">
             <AlertTriangle className="w-20 h-20 text-accent-tertiary animate-pulse" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black font-heading uppercase tracking-tighter text-white">
              ERROR <span className="text-accent-tertiary">404.</span>
            </h1>
            <p className="text-xl text-text-secondary font-medium tracking-widest uppercase">
              // SECURE ACCESS DENIED: RESOURCE NOT FOUND
            </p>
          </div>
          
          <div className="pt-12">
            <Link href="/" className="btn-secondary flex items-center gap-4 mx-auto group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
              RETURN TO BASE
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-10 p-6 glass border-none text-[10px] font-mono tracking-widest text-white/20 uppercase">
         Protocol: 0x404 // UNAUTHORIZED_ACCESS_ATTEMPT
      </div>
    </div>
  );
}
