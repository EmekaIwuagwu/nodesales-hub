"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield, 
  MapPin, 
  Mail, 
  Twitter, 
  Linkedin, 
  Globe,
  Lock,
  Database,
  ChevronRight
} from "lucide-react";

const footerLinks = [
  {
    title: "PRODUCTS",
    links: [
      { name: "Defence Drones", href: "/products/defence-drones" },
      { name: "Dispatch Drones", href: "/products/dispatch-drones" },
      { name: "Humanoid Robots", href: "/products/humanoid-robots" },
      { name: "Home Robots", href: "/products/home-robots" },
    ],
  },
  {
    title: "TECHNOLOGY",
    links: [
      { name: "Kortana Blockchain", href: "/technology#blockchain" },
      { name: "AI Engine", href: "/technology#ai" },
      { name: "Dual VM", href: "/technology#vm" },
      { name: "DNRS integration", href: "/technology#dnrs" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { name: "About Aeveum", href: "/about" },
      { name: "Ecosystem", href: "/about#ecosystem" },
      { name: "Compliance", href: "/about#compliance" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-background-primary border-t border-white/5 pt-32 pb-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10">
            <Link href="/" className="flex items-center gap-6 group">
               <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-accent-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                  <Image 
                    src="/images/logo.png" 
                    alt="Aeveum" 
                    width={64} 
                    height={64} 
                    className="relative z-10 transition-transform duration-500 group-hover:scale-110 brightness-200 contrast-125" 
                  />
               </div>
               <div className="space-y-1">
                 <h3 className="text-3xl font-black font-heading text-white tracking-widest leading-none">AEVEUM</h3>
                 <p className="text-[10px] text-accent-primary font-mono tracking-[0.4em] font-black uppercase">Deployment Ready v5.0</p>
               </div>
            </Link>
            <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-sm">
              The future of autonomous defence and precision robotics, registered in Wyoming and verified on the Kortana Blockchain.
            </p>
            <div className="flex gap-6 pt-4">
              <Link href="#" className="p-3 glass border-white/5 text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-all">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-3 glass border-white/5 text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-all">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-3 glass border-white/5 text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-all">
                <Globe className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-8">
                <h4 className="text-xs font-mono font-black tracking-[0.4em] text-white/40 uppercase border-b border-white/5 pb-4">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-text-secondary hover:text-accent-primary text-sm font-bold tracking-tight flex items-center gap-2 group transition-all"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-mono font-black uppercase tracking-widest text-text-secondary text-center md:text-left">
          <div className="space-y-2">
             <p>© {new Date().getFullYear()} AEVEUM. ALL RIGHTS RESERVED.</p>
             <p className="text-white/20">A KORTANA GROUP LLC SOLUTION // REGISTERED IN WYOMING, USA</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
             <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-accent-primary" />
                <span>KORTANA VERIFIED</span>
             </div>
             <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-accent-primary" />
                <span>DNRS INTEGRATED</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
