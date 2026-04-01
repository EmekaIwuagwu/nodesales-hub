"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: "PRODUCTS", href: "/products" },
  { name: "TECHNOLOGY", href: "/technology" },
  { name: "GALLERY", href: "/gallery" },
  { name: "ABOUT", href: "/about" },
  { name: "CONTACT", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-700 px-6 py-4 md:px-12",
        scrolled ? "bg-background-primary/80 backdrop-blur-3xl border-b border-white/5 py-4" : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
            <Image 
              src="/images/logo.png" 
              alt="Aeveum Logo" 
              width={48} 
              height={48} 
              className="relative z-10 transition-transform duration-500 group-hover:scale-110 grayscale brightness-200" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-2xl tracking-tighter text-white leading-none">
              AEVEUM
            </span>
            <span className="text-[9px] text-text-secondary font-mono tracking-[0.3em] font-bold uppercase group-hover:text-accent-primary transition-colors">
              AUTONOMOUS DEFENCE
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "nav-link",
                pathname === link.href ? "text-white after:w-full" : ""
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/contact" className="ml-4 px-6 py-2 border border-accent-primary text-accent-primary text-[10px] font-black tracking-widest uppercase hover:bg-accent-primary hover:text-background-primary transition-all duration-300">
            REQUEST DEMO
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 top-[72px] bg-background-primary z-40 md:hidden flex flex-col p-8 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-4xl font-heading font-black flex items-center justify-between border-b border-white/5 pb-4 text-white"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
              <ChevronRight className="w-8 h-8 text-accent-primary" />
            </Link>
          ))}
          <Link
            href="/contact"
            className="btn-primary text-center mt-4 text-sm"
            onClick={() => setIsOpen(false)}
          >
            REQUEST DEMO
          </Link>
        </div>
      )}
    </nav>
  );
}
