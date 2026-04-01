"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Bot, 
  Ruler, 
  Weight, 
  Battery, 
  Layers, 
  Eye, 
  Wallet, 
  Cpu, 
  Activity,
  ChevronRight,
  Shield,
  Briefcase,
  Zap,
  ArrowRight
} from "lucide-react";

const specs = [
  { icon: <Ruler />, label: "Height", value: "1.7 metres" },
  { icon: <Weight />, label: "Weight", value: "45kg" },
  { icon: <Battery />, label: "Battery", value: "8 hour operational" },
  { icon: <Layers />, label: "Joints", value: "28 servo actuators" },
  { icon: <Eye />, label: "Vision", value: "360° camera array" },
  { icon: <Cpu />, label: "AI", value: "Real-time threat assessment" }
];

const configurations = [
  {
    title: "Military",
    description: "Armour plating, weapons mount capability, encrypted military comms.",
    icon: <Shield className="w-10 h-10 text-accent-primary" />
  },
  {
    title: "Police/Security",
    description: "Patrol mode, public interaction protocols, incident logging on Kortana.",
    icon: <Activity className="w-10 h-10 text-accent-secondary" />
  },
  {
    title: "Civilian",
    description: "Healthcare assistant, delivery, sanitation operations.",
    icon: <Briefcase className="w-10 h-10 text-accent-primary" />
  }
];

export default function HumanoidRobotsPage() {
  return (
    <div className="pt-32 pb-48 bg-background-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-48">
        
        {/* Product Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-6 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-xs uppercase tracking-[0.4em] font-black text-accent-primary"
            >
              // Autonomous Personnel v3.5
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2 }}
              className="text-8xl md:text-9xl lg:text-[10rem] font-black font-heading leading-[0.85] uppercase text-white drop-shadow-2xl"
            >
              HX1 <br/>
              <span className="text-white">HUMANOID.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-xl font-medium"
            >
              Patrol. Protect. Respond. High-mobility autonomous humanoid units 
              designed to operate alongside humans in critical infrastructure.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="btn-primary"
            >
               <span className="flex items-center gap-4">
                  REQUEST QUOTE
                  <ArrowRight className="w-6 h-6" />
               </span>
            </motion.button>
          </div>
          <div className="lg:col-span-6 aspect-square relative bg-background-secondary border border-white/5 shadow-2xl group overflow-hidden">
             <Image 
                src="/images/robot-hx1.png" 
                alt="HX1 Robot" 
                fill 
                className="object-cover transition-transform duration-[5s] group-hover:scale-105 shadow-inner"
             />
             <div className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-background-primary to-transparent text-[8px] font-mono tracking-widest text-text-secondary uppercase">
                Protocol: HX-PERSONNEL-TACTICAL v3 // STATUS: ACTIVE
             </div>
          </div>
        </section>

        {/* Technical Specs Array */}
        <section className="space-y-24">
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white border-l-8 border-accent-primary pl-10 text-center mx-auto w-fit">Specifications</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {specs.map((spec, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="glass p-16 space-y-6 flex flex-col items-center text-center hover:bg-white/5 group border border-white/5 transition-all cursor-default shadow-2xl"
               >
                 <div className="text-accent-primary opacity-60 group-hover:opacity-100 transition-opacity">
                   {spec.icon}
                 </div>
                 <div className="space-y-4">
                   <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary font-black">{spec.label}</div>
                   <div className="text-3xl font-black font-heading text-white">{spec.value}</div>
                 </div>
               </motion.div>
             ))}
           </div>
        </section>

        {/* Cinematic Configurations Section */}
        <section className="py-24 space-y-32">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
             <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">MODULAR <br/><span className="text-accent-primary text-white">PLATFORMS.</span></h2>
             <p className="text-2xl text-text-secondary leading-relaxed font-medium">The HX1 features a modular upper body and sensor suite, allowing for rapid reconfiguration based on deployment requirements.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {configurations.map((config, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-16 flex flex-col justify-between space-y-12 overflow-hidden relative group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 text-white/50 group-hover:scale-110 transition-transform">
                   {config.icon}
                </div>
                <div className="space-y-6">
                  <div className="p-4 border border-white/10 w-fit bg-white/5 shadow-inner">
                    {config.icon}
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">{config.title}</h3>
                  <p className="text-lg text-text-secondary leading-relaxed font-medium">{config.description}</p>
                </div>
                <div className="pt-8 border-t border-white/5">
                   <ul className="space-y-4 font-mono text-[9px] tracking-[0.3em] text-text-secondary uppercase">
                      <li className="flex items-center gap-3"><Zap className="w-3 h-3 text-accent-primary" />Dual Mode OS v5</li>
                      <li className="flex items-center gap-3"><Shield className="w-3 h-3 text-accent-primary" />Encrypted Authentication</li>
                   </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Global CTA credential bar */}
        <section className="py-48 px-12 bg-white flex flex-col md:flex-row items-center justify-between gap-12 text-black group overflow-hidden relative">
           <div className="absolute inset-0 bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
           <div className="relative z-10 lg:w-2/3 space-y-4">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none group-hover:text-black">Personnel on Demand.</h2>
              <p className="text-xl font-bold opacity-70 group-hover:opacity-100 group-hover:text-black transition-all">Integrated DNRS wallets for autonomous machine-to-machine payments, subscriptions, and logistics.</p>
           </div>
           <Link href="/contact" className="relative z-10 px-16 py-8 bg-black text-white font-black text-xl hover:bg-background-primary transition-all group-hover:scale-105">
              REQUEST QUOTE
           </Link>
        </section>
      </div>
    </div>
  );
}
