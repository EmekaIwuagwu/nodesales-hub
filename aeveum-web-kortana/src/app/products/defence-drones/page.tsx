"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Shield, 
  MapPin, 
  Battery, 
  Video, 
  Lock, 
  Weight, 
  Zap,
  ChevronRight,
  Eye,
  Activity,
  Navigation,
  Target,
  ArrowRight
} from "lucide-react";

const specs = [
  { icon: <MapPin className="w-5 h-5" />, label: "Range", value: "150km operational radius" },
  { icon: <Battery className="w-5 h-5" />, label: "Endurance", value: "8 hour flight time" },
  { icon: <Video className="w-5 h-5" />, label: "Vision", value: "4K thermal + optical" },
  { icon: <Lock className="w-5 h-5" />, label: "Comms", value: "Kortana blockchain encrypted" },
  { icon: <Weight className="w-5 h-5" />, label: "Payload", value: "2.5kg mission payload" },
  { icon: <Zap className="w-5 h-5" />, label: "Speed", value: "120km/h cruise speed" }
];

const features = [
  { icon: <Eye className="w-6 h-6" />, title: "Night vision surveillance", description: "Multi-spectrum CMOS sensors for operation in total darkness." },
  { icon: <Lock className="w-6 h-6" />, title: "Encrypted command", description: "AES-256-GCM authentication via Kortana blockchain." },
  { icon: <Zap className="w-6 h-6" />, title: "Dual Configurations", description: "Switch between military and civilian payloads in under 120 seconds." },
  { icon: <Activity className="w-6 h-6" />, title: "Anti-jamming", description: "Frequency hopping spread spectrum for secure radio links." },
  { icon: <Navigation className="w-6 h-6" />, title: "Autonomous Nav", description: "GPS-independent navigation using visual odometry and AI." },
  { icon: <Target className="w-6 h-6" />, title: "Target Recognition AI", description: "Real-time identification of assets, personnel, and hazards." }
];

export default function DefenceDronesPage() {
  return (
    <div className="pt-32 pb-48 bg-background-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-48">
        
        {/* Product Hero - High Contrast */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-6 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-xs uppercase tracking-[0.4em] font-black text-accent-primary"
            >
              // Tactical Air Operations v4.2
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 1 }}
              className="text-8xl md:text-9xl lg:text-[10rem] font-black font-heading leading-[0.85] uppercase text-white drop-shadow-2xl"
            >
              AP1 <br/>
              <span className="text-accent-primary">DEFENCE.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-xl font-medium"
            >
              Long-range. Night-vision capable. Encrypted Kortana communications. 
              The ultimate asset for tactical surveillance and border enforcement.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="btn-primary group !px-16 !py-6"
            >
              <span className="flex items-center gap-4">
                PROCURE PLATFORM
                <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
              </span>
            </motion.button>
          </div>
          <div className="lg:col-span-6 aspect-square relative bg-background-secondary border border-white/5 shadow-2xl group overflow-hidden">
             <Image 
                src="/images/drone-ap1.png" 
                alt="AP1 Drone" 
                fill 
                className="object-cover transition-transform duration-[5s] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0 shadow-inner"
             />
             <div className="absolute inset-0 bg-accent-primary/5 mix-blend-overlay" />
             <div className="absolute bottom-10 left-10 p-6 glass border-none text-[8px] font-mono tracking-widest text-white/50 uppercase">
                Platform Specification: AP-RECON-TAC v5
             </div>
          </div>
        </section>

        {/* Technical Specs Array */}
        <section className="space-y-24">
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white border-l-8 border-accent-primary pl-10">Technical Specifications</h2>
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
                 <div className="text-accent-primary opacity-60 group-hover:opacity-100 transition-opacity">
                   {spec.icon}
                 </div>
                 <div className="space-y-4">
                   <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary font-black">{spec.label}</div>
                   <div className="text-2xl font-black font-heading text-white">{spec.value}</div>
                 </div>
               </motion.div>
             ))}
           </div>
        </section>

        {/* Cinematic Feature Grid */}
        <section className="bg-background-secondary p-12 md:p-32 space-y-32 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent-primary/5 blur-[150px] rotate-45 translate-x-1/2" />
          <div className="max-w-4xl space-y-8 relative z-10">
             <h2 className="text-5xl md:text-8xl font-black tracking-tight uppercase leading-none">MISSION CRITICAL <br/><span className="text-accent-primary">CAPABILITY.</span></h2>
             <p className="text-xl text-text-secondary leading-relaxed font-medium">Engineered to outperform in the most demanding environments on Earth, providing absolute visual and tactical supremacy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 relative z-10">
            {features.map((feature, i) => (
              <div key={i} className="group space-y-6">
                <div className="w-16 h-16 border border-white/10 flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-background-primary transition-all duration-500 shadow-xl">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
