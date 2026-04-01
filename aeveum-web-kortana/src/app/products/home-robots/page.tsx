"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Home as HomeIcon, 
  Ruler, 
  Map, 
  Video, 
  Wifi, 
  Layers, 
  Wallet, 
  Activity,
  ChevronRight,
  Shield,
  Clock,
  Zap,
  Lock,
  Eye,
  Smartphone,
  ArrowRight
} from "lucide-react";

const specs = [
  { icon: <Ruler />, label: "Height", value: "90cm compact form" },
  { icon: <Map />, label: "Navigation", value: "SLAM mapping" },
  { icon: <Video />, label: "Vision", value: "HD camera + motion sensors" },
  { icon: <Wifi />, label: "Connectivity", value: "WiFi + Bluetooth" },
  { icon: <Layers />, label: "Integration", value: "Smart home compatible" },
  { icon: <Wallet />, label: "Payment", value: "DNRS subscription billing" }
];

const features = [
  { icon: <Eye />, title: "24/7 home surveillance", description: "Constant monitoring with motion alerts and real-time feed access." },
  { icon: <Shield />, title: "Intruder detection", description: "AI-powered identification and instant emergency service integration." },
  { icon: <Activity />, title: "Package reception", description: "Monitor doorstep deliveries and interact with couriers from anywhere." },
  { icon: <Layers />, title: "Elderly assistance", description: "Fall detection, medication reminders, and direct emergency line access." },
  { icon: <Smartphone />, title: "Remote monitoring", description: "Full control via the Aeveum app, authenticated by Kortana blockchain." },
  { icon: <Lock />, title: "Blockchain Security", description: "All data encrypted and stored on the immutable Kortana network." }
];

export default function HomeRobotsPage() {
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
              // Residential Security v2.1
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-8xl md:text-9xl lg:text-[10rem] font-black font-heading leading-[0.85] uppercase text-white drop-shadow-2xl"
            >
              HR1 <br/>
              <span className="text-accent-primary">GUARDIAN.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-xl font-medium"
            >
              Your home. Protected. Intelligently. 
              The HR1 is your first line of residential defence and assistance.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="px-16 py-6 bg-accent-primary text-background-primary font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(0,212,255,0.3)] flex items-center gap-4 group mx-auto sm:mx-0"
            >
              ORDER YOUR UNIT
              <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
            </motion.button>
          </div>
          <div className="lg:col-span-6 aspect-square relative bg-background-secondary border border-white/5 shadow-2xl group overflow-hidden">
             <Image 
                src="/images/robot-hr1.png" 
                alt="HR1 Robot" 
                fill 
                className="object-cover transition-transform duration-[5s] group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0 shadow-inner"
             />
             <div className="absolute inset-0 bg-accent-primary/5 mix-blend-overlay opacity-50" />
             <div className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-background-primary to-transparent text-[8px] font-mono tracking-widest text-text-secondary uppercase">
                Protocol: HR-SECURITY-AUTON v2 // VERIFIED
             </div>
          </div>
        </section>

        {/* Technical Specs Array */}
        <section className="space-y-24">
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white border-l-8 border-accent-primary pl-10">Home Specifications</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {specs.map((spec, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="glass p-12 space-y-6 flex flex-col items-center text-center hover:bg-white/5 group border border-white/5 transition-all cursor-default shadow-2xl"
               >
                 <div className="text-accent-primary opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                   {spec.icon}
                 </div>
                 <div className="space-y-4">
                   <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary font-black group-hover:text-accent-primary transition-colors">{spec.label}</div>
                   <div className="text-3xl font-black font-heading text-white">{spec.value}</div>
                 </div>
               </motion.div>
             ))}
           </div>
        </section>

        {/* Grid Features */}
        <section className="bg-background-secondary p-12 md:p-32 space-y-32 border border-white/5 relative overflow-hidden group text-left">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
              {features.map((feature, i) => (
                 <div key={i} className="space-y-6 group/item backdrop-blur-3xl border border-white/5 p-12 hover:bg-white/5 transition-all duration-500">
                    <div className="w-16 h-16 border border-white/10 flex items-center justify-center text-accent-primary group-hover/item:bg-accent-primary group-hover/item:text-background-primary transition-all duration-500">
                       {feature.icon}
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{feature.title}</h3>
                    <p className="text-lg text-text-secondary leading-relaxed font-medium">{feature.description}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* Subscription Section */}
        <section className="py-24 space-y-12">
           <div className="flex flex-col lg:flex-row gap-20 items-center justify-between bg-accent-primary/5 p-16 border border-accent-primary/10 relative overflow-hidden group">
              <div className="lg:w-1/2 space-y-8 relative z-10 text-left">
                 <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">SECURE <br/><span className="text-accent-primary">BILLING.</span></h2>
                 <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    Automate your home security subscription, insurance, and maintenance costs using DNRS. 
                    Manage your billing effortlessly via the integrated Aeveum dashboard, 
                    with all transactions cryptographically verified on the Kortana network.
                 </p>
                 <div className="flex gap-4">
                    <div className="px-6 py-2 bg-accent-primary/20 text-accent-primary font-black text-[10px] uppercase tracking-widest border border-accent-primary/30">
                       MONTHLY SUBSCRIPTION
                    </div>
                    <div className="px-6 py-2 bg-accent-primary/20 text-accent-primary font-black text-[10px] uppercase tracking-widest border border-accent-primary/30">
                       DNRS SETTLED
                    </div>
                 </div>
              </div>
              <div className="lg:w-1/2 relative z-10">
                 <div className="p-16 glass bg-accent-primary/10 border-none shadow-[0_0_100px_rgba(0,212,255,0.2)]">
                    <Wallet className="w-48 h-48 text-accent-primary mx-auto animate-bounce" />
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
