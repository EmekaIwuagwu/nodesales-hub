"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Cpu, 
  Link as LinkIcon, 
  Wallet, 
  Database, 
  Layers, 
  Activity,
  ChevronRight,
  Zap,
  Lock,
  Globe,
  Settings,
  Codepen
} from "lucide-react";

const techSections = [
  {
    icon: <LinkIcon className="w-10 h-10 text-accent-primary" />,
    title: "Kortana Blockchain Integration",
    description: "Every Aeveum unit logs its operational history, telemetry, and critical interactions on the Kortana Blockchain. This creates a tamper-proof audit trail for security and compliance.",
    details: ["Immutable Operational Logs", "End-to-end Encrypted Telemetry", "Cryptographic Authentication"],
    id: "blockchain"
  },
  {
    icon: <Codepen className="w-10 h-10 text-accent-secondary" />,
    title: "AI and Computer Vision",
    description: "Aeveum's proprietary vision system uses multi-modal neural networks for real-time threat detection, navigation, and interaction in various environments.",
    details: ["Multi-spectrum Sensor Fusion", "Object Recognition AI", "Low-latency Decision Making"],
    id: "ai"
  },
  {
    icon: <Layers className="w-10 h-10 text-accent-primary" />,
    title: "Dual VM Architecture",
    description: "Our units run a unique dual virtual machine architecture separating mission-critical control systems from high-level AI tasks for maximum reliability.",
    details: ["Isolated Mission Systems", "Secure Control Plane", "Fault-tolerant Execution"],
    id: "vm"
  },
  {
    icon: <Wallet className="w-10 h-10 text-accent-secondary" />,
    title: "DNRS Payment Layer",
    description: "Integrated native support for the DNRS stablecoin enables frictionless machine-to-machine payments for logistics, maintenance, and insurance services.",
    details: ["Instant Machine Settlements", "Low-cost Transactions", "Automated Billing Contracts"],
    id: "dnrs"
  },
  {
    icon: <Settings className="w-10 h-10 text-accent-primary" />,
    title: "Hardware Engineering",
    description: "Built using high-performance composites and modular component design, Aeveum hardware is engineered for durability, repairability, and operational flexibility.",
    details: ["High-performance Carbon Composites", "Modular Field Repairable Units", "High-efficiency Power Systems"],
    id: "hardware"
  }
];

export default function TechnologyPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-background-primary overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Technology Hero */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 text-accent-primary font-mono text-xs tracking-[0.3em] font-bold uppercase"
          >
            <div className="w-8 h-[1px] bg-accent-primary" />
            Core Technology
            <div className="w-8 h-[1px] bg-accent-primary" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black font-heading leading-tight uppercase"
          >
            The Aeveum <br/><span className="text-accent-primary">Technology Stack.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text-secondary leading-relaxed"
          >
            Precision engineering meets decentralized intelligence. 
            Discover how Aeveum is building the most secure autonomous platform on Earth.
          </motion.p>
        </section>

        {/* Core Tech Grid */}
        <section className="space-y-24">
          <div className="grid grid-cols-1 gap-12">
            {techSections.map((section, i) => (
              <motion.div 
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col lg:flex-row gap-16 justify-between items-center p-12 glass border-none group ${
                   i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="lg:w-1/2 space-y-8">
                  <div className="p-4 bg-accent-primary/10 w-fit rounded-none border border-accent-primary/20">
                     {section.icon}
                  </div>
                  <h2 className="text-4xl font-bold uppercase tracking-tight">{section.title}</h2>
                  <p className="text-lg text-text-secondary leading-relaxed">
                     {section.description}
                  </p>
                  <ul className="space-y-4">
                     {section.details.map((detail, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm font-bold text-accent-primary uppercase tracking-widest">
                           <Zap className="w-4 h-4" />
                           {detail}
                        </li>
                     ))}
                  </ul>
                </div>
                <div className="lg:w-1/2 aspect-video bg-background-secondary border border-accent-primary/20 flex flex-col items-center justify-center p-12 group-hover:border-accent-primary/50 transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--accent-primary)_0%,_transparent_70%)]" />
                    <Codepen className="w-32 h-32 text-accent-primary opacity-30 transform group-hover:rotate-12 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 p-4 border-t border-accent-primary/20 font-mono text-[10px] tracking-widest text-text-secondary uppercase">
                       Module-id: {section.id.toUpperCase()} v4.2.1-stable
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Engineering Philosophy CTA */}
        <section className="bg-accent-primary p-24 text-center space-y-8 group">
           <h2 className="text-5xl md:text-7xl font-black text-background-primary uppercase tracking-tighter group-hover:scale-95 transition-transform duration-700">
              Built to withstand
           </h2>
           <p className="max-w-3xl mx-auto text-xl font-bold text-background-primary opacity-80 group-hover:opacity-100 transition-opacity">
              Aeveum hardware is tested in mission-critical environments. 
              From the highest altitudes to the most demanding urban landscapes, 
              our tech stack ensures zero-fail performance.
           </p>
        </section>
      </div>
    </div>
  );
}
