"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  MapPin, 
  Users, 
  Globe, 
  Link as LinkIcon, 
  Wallet, 
  Cpu, 
  ArrowRight,
  Zap,
  Target,
  Rocket
} from "lucide-react";

const ecosystem = [
  { title: "Kortana Blockchain", description: "The foundation of our secure, decentralized infrastructure.", href: "/coming-soon" },
  { title: "Aeveum", description: "Autonomous defence and robotic hardware systems.", href: "/" },
  { title: "Hendrix", description: "Leading the next wave of neural intelligence and AI research.", href: "/coming-soon" }
];

const valuesList = [
  { icon: <Shield />, title: "Uncompromising Security", description: "Military-grade encryption and blockchain-verified operations at every layer." },
  { icon: <Target />, title: "Precision Autonomy", description: "Advanced AI-driven navigation and decision-making for complex environments." },
  { icon: <Rocket />, title: "Future-Ready Platforms", description: "Modular hardware and software designed for the next decade of operational needs." }
];

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-background-primary overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* About Hero */}
        <section className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="w-full lg:w-1/2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-accent-primary font-mono text-sm tracking-widest font-bold uppercase"
            >
              The Aeveum Story
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black font-heading leading-tight uppercase"
            >
              About <br/><span className="text-accent-primary">Aeveum.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary leading-relaxed max-w-xl"
            >
              Aeveum is a solution by Kortana Group LLC, registered in Wyoming, United States. 
              We are dedicated to building the next generation of autonomous defence technology.
            </motion.p>
          </div>
          <div id="compliance" className="w-full lg:w-1/2 p-24 bg-background-secondary border border-white/5">
             <div className="space-y-8">
                <div className="text-[10px] font-mono tracking-widest uppercase opacity-40">Company Information</div>
                <div className="space-y-2">
                   <h3 className="text-3xl font-bold">Kortana Group LLC</h3>
                   <div className="flex items-center gap-2 text-accent-primary text-sm font-bold uppercase tracking-widest">
                      <MapPin className="w-4 h-4" />
                      Wyoming, United States
                   </div>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">
                   Aeveum operates as the flagship robotics and hardware arm of the Kortana Group ecosystem, 
                   dedicated to transforming global security through verified autonomous systems.
                </p>
                <div className="pt-8 flex flex-col gap-4">
                   <div className="p-6 glass border-none flex items-center justify-between group cursor-default">
                      <span className="font-bold text-sm tracking-widest uppercase">Verified on DNR</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   </div>
                   <div className="p-6 glass border-none flex items-center justify-between group cursor-default">
                      <span className="font-bold text-sm tracking-widest uppercase">Registered Wyoming Company</span>
                      <div className="w-4 h-4 text-accent-primary">
                         <MapPin className="w-4 h-4" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="bg-accent-primary/10 p-12 md:p-32 space-y-16 border border-accent-primary/20 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-accent-primary">
             <Shield className="w-64 h-64" />
          </div>
          <div className="max-w-4xl mx-auto space-y-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Mission Statement</h2>
            <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
              To build the autonomous future of how humanity protects itself — 
              combining high-performance hardware with verifiable, 
              blockchain-driven intelligence.
            </p>
          </div>
        </section>

        {/* Ecosystem Grid */}
        <section id="ecosystem" className="space-y-24 pt-24">
           <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold uppercase tracking-widest opacity-60">The Kortana Ecosystem</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">Aeveum is powered by a network of specialized companies driving the future of autonomous systems.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ecosystem.map((company, i) => (
                 <div key={i} className="glass p-12 flex flex-col justify-between space-y-8 group transition-all hover:bg-white/5">
                    <div className="space-y-4">
                       <h3 className="text-3xl font-bold uppercase tracking-tight">{company.title}</h3>
                       <p className="text-text-secondary text-sm leading-relaxed">{company.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-accent-primary font-mono text-[10px] font-bold tracking-[0.2em] group-hover:gap-4 transition-all uppercase">
                       Explore Company <ArrowRight className="w-4 h-4" />
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* Vision Statement Section */}
        <section className="bg-background-secondary p-12 md:p-24 space-y-16 border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-20 text-accent-primary -rotate-12 translate-x-12 translate-y-[-12]">
              <Rocket className="w-96 h-96 group-hover:translate-x-[-20px] transition-transform duration-[4s]" />
           </div>
           <div className="max-w-4xl space-y-8 relative z-10">
              <h2 className="text-5xl font-black uppercase tracking-tighter">Vision Statement</h2>
              <p className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-2xl">
                 We envision a world where autonomous systems serve as a force multiplier for human security, 
                 operable in total transparency and verified by global decentralized protocols.
              </p>
              <div className="pt-8">
                 <button className="btn-primary px-12 uppercase tracking-widest font-black">Careers</button>
              </div>
           </div>
        </section>

        {/* Team Section (Placeholder) */}
        <section className="space-y-16">
           <h2 className="text-3xl font-bold uppercase tracking-widest mb-16 text-center">Our Team</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                 <div key={i} className="glass p-12 flex flex-col items-center gap-6 group hover:border-accent-primary/40 transition-all filter grayscale hover:grayscale-0">
                    <div className="w-32 h-32 bg-background-primary border border-white/5 rounded-full flex items-center justify-center relative overflow-hidden">
                       <Users className="w-12 h-12 text-accent-primary opacity-20 group-hover:scale-150 transition-transform duration-700" />
                    </div>
                    <div className="text-center space-y-2">
                       <h4 className="font-bold text-xl uppercase tracking-tighter group-hover:text-accent-primary transition-colors">Join Our Team</h4>
                       <p className="text-xs text-text-secondary font-mono tracking-widest uppercase">Open Position</p>
                    </div>
                 </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}
