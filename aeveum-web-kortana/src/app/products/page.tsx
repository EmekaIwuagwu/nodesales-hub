"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Shield, 
  Truck, 
  Bot, 
  Home as HomeIcon, 
  ArrowRight, 
  ChevronRight,
  Zap,
  Lock,
  Database,
  Crosshair,
  Target,
  Layers
} from "lucide-react";

const products = [
  {
    id: "defence-drones",
    name: "Defence Drones",
    tagline: "AP1 Military Surveillance Drone",
    description: "Aeveum's flagship tactical drone designed for long-range reconnaissance, border security, and high-precision monitoring. Built following military-grade specifications with fully encrypted blockchain communication protocols.",
    specs: ["150km operational radius", "8 hour flight time", "4K thermal + optical", "Anti-jamming comms"],
    image: "/images/drone-ap1.png",
    href: "/products/defence-drones",
    accent: "text-accent-primary"
  },
  {
    id: "dispatch-drones",
    name: "Dispatch Drones",
    tagline: "SD1 Dispatch Drone",
    description: "The autonomous logistic solution for medical supplies, life-critical cargo, and complex urban delivery environments. Leveraging the DNRS payment layer for instant, frictionless delivery management.",
    specs: ["2kg delivery capacity", "40km delivery radius", "80km/h cruise speed", "GPS + AI avoidance"],
    image: "/images/drone-sd1.png",
    href: "/products/dispatch-drones",
    accent: "text-accent-secondary"
  },
  {
    id: "humanoid-robots",
    name: "Humanoid Robots",
    tagline: "HX1 Humanoid Unit",
    description: "High-mobility autonomous humanoid robots designed to operate alongside humans in critical infrastructure, disaster response, and high-security zones. Features 28 degrees of freedom and real-time threat detection AI.",
    specs: ["1.7 metres height", "45kg weight", "28 servo actuators", "360° camera array"],
    image: "/images/robot-hx1.png",
    href: "/products/humanoid-robots",
    accent: "text-white"
  },
  {
    id: "home-robots",
    name: "Home Robots",
    tagline: "HR1 Home Guardian",
    description: "Intelligent residential security and assistance. The HR1 provides 24/7 surveillance, package tracking, and elderly monitoring — all managed via the secure Kortana blockchain ecosystem.",
    specs: ["90cm compact form", "SLAM mapping", "HD camera + motion", "Smart home compatible"],
    image: "/images/robot-hr1.png",
    href: "/products/home-robots",
    accent: "text-accent-primary"
  }
];

export default function ProductsPage() {
  return (
    <div className="pt-32 pb-48 bg-background-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-32 space-y-12">
           <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-accent-primary" />
              <span className="font-mono text-xs tracking-widest text-accent-primary uppercase font-black">The Aeveum Ecosystem</span>
           </div>
           <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-7xl md:text-9xl font-black font-heading tracking-tighter leading-none uppercase text-white"
           >
              UNIFIED<br/>
              <span className="text-accent-primary">PLATFORMS.</span>
           </motion.h1>
           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-text-secondary leading-relaxed max-w-3xl font-medium"
           >
              Four product lines developed on our proprietary autonomous engine. 
              Designed for military and civilian applications requiring maximum precision and total security.
           </motion.p>
        </div>

        <div className="space-y-48">
          {products.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className={`flex flex-col lg:flex-row gap-20 items-center ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Photorealistic Image Showcase */}
              <div className="w-full lg:w-1/2 aspect-[16/10] relative group overflow-hidden bg-background-secondary border border-white/5 shadow-2xl">
                 <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-[3s] group-hover:scale-105 grayscale-[0.3] group-hover:grayscale-0 shadow-inner"
                 />
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background-primary via-background-primary/20 to-transparent" />
                 
                 {/* Decorative Overlay */}
                 <div className="absolute bottom-10 left-10 flex gap-4">
                    <div className="px-4 py-1 glass border-none text-[8px] font-mono tracking-widest text-white uppercase">
                       Unit: {product.tagline.split(' ')[0]} // Status: ACTIVE
                    </div>
                 </div>
              </div>

              {/* Content Area */}
              <div className="w-full lg:w-1/2 space-y-12">
                <div className="space-y-4">
                  <div className={`font-mono text-xs uppercase tracking-[0.4em] font-black mb-4 ${product.accent}`}>
                    // {product.tagline}
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
                     {product.name}
                  </h2>
                </div>
                
                <p className="text-xl text-text-secondary leading-relaxed font-medium">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-4 border-t border-white/5">
                  {product.specs.map((spec, j) => (
                    <div key={j} className="flex items-center gap-4 text-xs font-mono tracking-widest text-text-secondary group cursor-default">
                      <Target className="w-4 h-4 text-accent-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity uppercase">{spec}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8">
                  <Link href={product.href} className="btn-primary group inline-flex items-center gap-4 relative">
                    <span className="relative z-10 font-black">PLATFORM SPECIFICATIONS</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2 relative z-10" />
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Global Security credential bar */}
        <div className="mt-48 py-24 glass border-x-0 border-y border-white/5 px-12 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
               <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter">Unified OS</h4>
            <p className="text-text-secondary text-sm leading-relaxed">Single unified architecture for absolute synchronization between units.</p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-accent-secondary">
               <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter">Verified Comms</h4>
            <p className="text-text-secondary text-sm leading-relaxed">End-to-end encrypted packet transmission authenticated via blockchain ledger.</p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
               <Database className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter">DNR Settlement</h4>
            <p className="text-text-secondary text-sm leading-relaxed">Autonomous machine economy settlements via internal DNRS wallets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
