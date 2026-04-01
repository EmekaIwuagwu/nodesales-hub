"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Truck, 
  Package, 
  Map, 
  Wind, 
  Navigation, 
  Wallet, 
  Activity,
  ChevronRight,
  Shield,
  Clock,
  Globe,
  ArrowRight
} from "lucide-react";

const specs = [
  { label: "Payload", value: "2kg delivery capacity" },
  { label: "Range", value: "40km delivery radius" },
  { label: "Speed", value: "80km/h cruise speed" },
  { label: "Navigation", value: "GPS + AI avoidance" },
  { label: "Payment", value: "DNRS stablecoin integrated" },
  { label: "Tracking", value: "Blockchain verified" }
];

const useCases = [
  { title: "Medical supply delivery", description: "Critical rapid-response delivery of blood, medicine, and organs." },
  { title: "Rural logistics", description: "Autonomous long-range delivery where infrastructure is missing or degraded." },
  { title: "Emergency response", description: "Deploying life-saving equipment directly to disaster zones." },
  { title: "Urban air corridors", description: "Seamless, energy-efficient delivery through complex urban airspace." }
];

export default function DispatchDronesPage() {
  return (
    <div className="pt-32 pb-48 bg-background-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-48 text-center sm:text-left">
        
        {/* Product Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-6 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-xs uppercase tracking-[0.4em] font-black text-accent-secondary"
            >
              // Autonomous Logistics v5.0
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-8xl md:text-9xl lg:text-[10rem] font-black font-heading leading-[0.85] uppercase text-white drop-shadow-2xl"
            >
              SD1 <br/>
              <span className="text-accent-secondary">DISPATCH.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-xl font-medium"
            >
              Medicine. Cargo. Life-critical delivery. Engineered for absolute reliability 
              in the most complex global delivery environments.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-16 py-6 bg-accent-secondary text-white font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(123,47,190,0.3)] flex items-center gap-4 group mx-auto sm:mx-0"
            >
              CONFIGURE LOGISTICS
              <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
            </motion.button>
          </div>
          <div className="lg:col-span-6 aspect-square relative bg-background-secondary border border-white/5 shadow-2xl group overflow-hidden">
             <Image 
                src="/images/drone-sd1.png" 
                alt="SD1 Drone" 
                fill 
                className="object-cover transition-transform duration-[5s] group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0 shadow-inner"
             />
             <div className="absolute inset-0 bg-accent-secondary/5 mix-blend-overlay opacity-60" />
             <div className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-background-primary to-transparent text-[8px] font-mono tracking-widest text-text-secondary uppercase">
                Protocol: SD-AUTON-LOGS v2 // VERIFIED
             </div>
          </div>
        </section>

        {/* Technical Specs Array */}
        <section className="space-y-24">
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white border-l-8 border-accent-secondary pl-10">Mission Specifications</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {specs.map((spec, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="glass p-12 space-y-6 hover:bg-white/5 group border border-white/5 transition-all cursor-default"
               >
                 <div className="space-y-4">
                   <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary font-black group-hover:text-accent-secondary transition-colors uppercase">{spec.label}</div>
                   <div className="text-3xl font-black font-heading text-white">{spec.value}</div>
                 </div>
               </motion.div>
             ))}
           </div>
        </section>

        {/* Grid Features */}
        <section className="bg-background-secondary p-12 md:p-32 space-y-32 border border-white/5 relative overflow-hidden group text-left">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              {useCases.map((use, i) => (
                 <div key={i} className="space-y-6 p-12 border border-white/5 hover:bg-white/5 transition-all">
                    <span className="text-4xl font-black text-accent-secondary">0{i+1}</span>
                    <h3 className="text-4xl font-black uppercase tracking-tighter">{use.title}</h3>
                    <p className="text-lg text-text-secondary leading-relaxed font-medium">{use.description}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* Payment Integration */}
        <section className="py-24 space-y-12">
          <div className="flex flex-col lg:flex-row gap-20 items-center justify-between bg-accent-secondary/5 p-16 border border-accent-secondary/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(123,47,190,0.1)_0%,_transparent_50%)]" />
            <div className="lg:w-1/2 space-y-8 relative z-10 text-left">
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">DNRS <br/><span className="text-accent-secondary">PAYMENT.</span></h2>
              <p className="text-xl text-text-secondary leading-relaxed font-medium">
                Seamlessly settle delivery fees, insurance premiums, and maintenance costs using the DNRS stablecoin. 
                Instant, borderless, and frictionless — built for the autonomous economy.
              </p>
            </div>
            <div className="lg:w-1/2 relative z-10">
               <div className="p-16 glass bg-accent-secondary/10 border-none shadow-[0_0_100px_rgba(123,47,190,0.2)]">
                  <Globe className="w-48 h-48 text-accent-secondary mx-auto animate-pulse" />
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
