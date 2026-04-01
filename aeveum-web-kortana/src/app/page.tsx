"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Shield, 
  Truck, 
  Bot, 
  Home, 
  ArrowRight, 
  Cpu, 
  Link as LinkIcon, 
  Wallet,
  Play,
  Crosshair,
  Lock,
  Layers
} from "lucide-react";

const stats = [
  { value: "04", label: "Product Lines" },
  { value: "03", label: "Operational Domains" },
  { value: "Wyoming", label: "Registered" },
  { value: "Blockchain", label: "Verified Operations" },
];

const products = [
  {
    image: "/images/drone-ap1.png",
    icon: <Shield className="w-6 h-6" />,
    name: "Defence Drones",
    description: "Multi-mission tactical surveillance platforms engineered for total operational supremacy.",
    href: "/products/defence-drones"
  },
  {
    image: "/images/drone-sd1.png",
    icon: <Truck className="w-6 h-6" />,
    name: "Dispatch Drones",
    description: "Precision medical and logistics delivery units for complex urban and remote environments.",
    href: "/products/dispatch-drones"
  },
  {
    image: "/images/robot-hx1.png",
    icon: <Bot className="w-6 h-6" />,
    name: "Humanoid Robots",
    description: "High-mobility autonomous units built for critical infrastructure protection and response.",
    href: "/products/humanoid-robots"
  },
  {
    image: "/images/robot-hr1.png",
    icon: <Home className="w-6 h-6" />,
    name: "Home Robots",
    description: "Next-generation residential security and assistance. Your home, reinvented.",
    href: "/products/home-robots"
  }
];

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 overflow-hidden">
        {/* Background - using a local high-tech center image */}
        <div className="absolute inset-0 bg-background-primary overflow-hidden">
          <Image 
            src="/images/hero-bg.png" 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-30 mix-blend-screen mix-blend-overlay scale-110 animate-[pulse_20s_infinite]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-primary/50 to-background-primary" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-12 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
             <div className="mb-6 px-4 py-1 border border-accent-primary/40 bg-accent-primary/10 text-accent-primary text-[10px] font-mono tracking-[0.4em] uppercase flex items-center gap-3">
               <Crosshair className="w-3 h-3 animate-pulse" />
               Operations Verified: DNR Network
             </div>
             <h1 className="text-[12vw] md:text-[8vw] lg:text-[7vw] font-heading font-black tracking-[-0.05em] leading-[0.85] uppercase text-white drop-shadow-[0_0_80px_rgba(0,212,255,0.3)]">
               AUTONOMOUS<br/>
               <span className="text-accent-primary">DEFENCE.</span>
             </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="space-y-10"
          >
            <p className="text-text-secondary text-sm md:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed font-medium">
              Building the next generation of precision robotics for a world that demands 
              absolute autonomy and verified intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link href="/products" className="btn-primary group">
                <span className="relative z-10 flex items-center gap-3">
                  EXPLORE PLATFORMS
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant" />
              </Link>
              <button className="btn-secondary group flex items-center gap-4">
                <Play className="w-5 h-5 fill-current text-accent-primary" />
                <span className="font-bold">WATCH BRIEFING</span>
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
           <div className="w-[1px] h-20 bg-gradient-to-b from-accent-primary to-transparent" />
           <span className="font-mono text-[9px] tracking-[0.5em] uppercase">Deployment Data Below</span>
        </div>
      </section>

      {/* Stats Bar - Futuristic Segmented Display */}
      <section className="px-6 relative z-20">
        <div className="max-w-7xl mx-auto glass rounded-none border-x-0 border-y border-white/5 py-16 px-12 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center lg:items-start lg:border-r border-white/5 last:border-none lg:px-12 first:pl-0">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-baseline gap-2"
              >
                <span className="text-4xl md:text-6xl font-heading font-black text-white tracking-tighter">
                  {stat.value}
                </span>
              </motion.div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent-primary mt-2">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid - Photorealistic Showcase */}
      <section className="px-6 py-48 bg-background-primary relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-[2px] bg-accent-primary" />
                <span className="font-mono text-xs tracking-widest text-accent-primary uppercase font-black">Platform Portfolio</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-tight text-white drop-shadow-2xl">
                SUPERIOR <br/>
                ENGINEERING.
              </h2>
            </div>
            <p className="text-text-secondary max-w-md text-lg leading-relaxed font-medium">
              Four unified product lines sharing the same military-grade DNA and blockchain-encrypted OS.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {products.map((product, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <Link href={product.href} className="group relative block aspect-[16/10] overflow-hidden bg-background-secondary border border-white/5 shadow-2xl">
                  {/* Realistic Image */}
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background-primary via-background-primary/20 to-transparent opacity-80" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                       <div className="p-4 bg-background-primary/80 backdrop-blur-xl border border-white/10 text-accent-primary">
                         {product.icon}
                       </div>
                       <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase bg-black/40 px-3 py-1 backdrop-blur-md">
                         Series v5 // Ready
                       </div>
                    </div>
                    <div className="space-y-4 max-w-sm">
                      <h3 className="text-4xl font-black tracking-tighter uppercase text-white group-hover:text-accent-primary transition-colors">{product.name}</h3>
                      <p className="text-sm text-text-secondary font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                        {product.description}
                      </p>
                      <div className="pt-4 flex items-center gap-3 text-white text-[10px] font-black tracking-widest uppercase">
                        Protocol Spec <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Highlights - Photorealistic Detailed Robot View */}
      <section className="px-6 py-48 bg-background-secondary border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-5 space-y-12">
               <div className="space-y-6">
                 <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none uppercase">VERIFIABLE<br/><span className="text-accent-primary">INTELLIGENCE.</span></h2>
                 <p className="text-text-secondary text-lg leading-relaxed font-medium">
                   Every decision, every movement, and every payment is cryptographically signed and logged on the Kortana network.
                 </p>
               </div>
               
               <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                     <div className="mt-1 p-3 bg-white/5 border border-white/10 group-hover:border-accent-primary/50 transition-colors">
                       <Lock className="w-5 h-5 text-accent-primary" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-xl uppercase tracking-tighter">Blockchain Verified</h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">Immutable operational logs that cannot be manipulated or deleted.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                     <div className="mt-1 p-3 bg-white/5 border border-white/10 group-hover:border-accent-primary/50 transition-colors">
                       <Layers className="w-5 h-5 text-accent-primary" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-xl uppercase tracking-tighter">Dual Mode Operation</h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">Adaptive software that transitions instantly between tactical and civilian modes.</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="lg:col-span-7 aspect-video relative group overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-background-primary">
               <Image 
                src="/images/robot-hx1.png" 
                alt="Tactical Platform" 
                fill 
                className="object-cover opacity-60 grayscale group-hover:scale-110 grayscale-0 transition-transform duration-[10s]" 
               />
               <div className="absolute inset-0 bg-accent-primary/5 mix-blend-overlay" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-20 h-20 text-white/20 group-hover:text-accent-primary transition-colors cursor-pointer" />
               </div>
               <div className="absolute bottom-8 left-8 flex gap-4">
                  <div className="px-4 py-2 glass border-none text-[8px] font-mono tracking-widest text-white uppercase">
                    Unit: HX-1-ALPHA // Status: ACTIVE
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Quote - High Impact */}
      <section className="px-6 py-64 text-center relative bg-background-primary overflow-hidden">
        <div className="max-w-6xl mx-auto z-10 space-y-16">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] text-white/95 uppercase"
          >
            "WE DO NOT BUILD ROBOTS. WE BUILD THE <span className="text-accent-primary px-4 border border-accent-primary/20 not-italic">AUTONOMOUS FUTURE</span> OF HOW HUMANITY PROTECTS ITSELF."
          </motion.h2>
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-[1px] bg-accent-primary" />
            <span className="font-mono text-xs uppercase font-black tracking-[0.5em] text-accent-primary">Aeveum, 2025</span>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-32 bg-accent-primary relative overflow-hidden group">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="text-background-primary lg:w-2/3 space-y-6 text-center lg:text-left">
            <h2 className="text-6xl md:text-9xl font-black tracking-[-0.05em] uppercase leading-[0.8]">
              READY TO<br/>
              DEPLOY?
            </h2>
            <p className="text-xl md:text-2xl font-black uppercase tracking-tight opacity-90">
              Contact our strategic deployment team for government and enterprise inquiry.
            </p>
          </div>
          <Link href="/contact" className="px-16 py-8 bg-background-primary text-accent-primary font-black text-2xl hover:bg-white hover:text-black transition-all flex items-center gap-4 group/btn">
            REQUEST BRIEFING
            <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-4 transition-transform" />
          </Link>
        </div>
      </section>

      <style jsx>{`
        .slant { transform: skewX(-20deg); }
      `}</style>
    </div>
  );
}
