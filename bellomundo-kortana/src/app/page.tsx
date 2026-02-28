"use client";

import Navbar from "@/components/Landing/Navbar";
import Hero from "@/components/Landing/Hero";
import StatsBar from "@/components/Landing/StatsBar";
import Features from "@/components/Landing/Features";
import Footer from "@/components/Landing/Footer";
import { motion, useScroll, useSpring } from "framer-motion";
import { Globe } from "lucide-react";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="relative bg-neutral-obsidian min-h-screen">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-20 left-0 right-0 h-1 bg-secondary-warm/50 z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Ambient Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary-kortana/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-secondary-warm/5 blur-[100px] rounded-full" />
      </div>

      <Navbar />
      <Hero />
      <StatsBar />
      <Features />

      {/* City Vision Section */}
      <section className="py-60 px-8 bg-neutral-obsidian relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mb-16 inline-block p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl"
          >
            <Globe className="w-10 h-10 text-primary-bright animate-float" />
          </motion.div>

          <h2 className="text-[10px] text-primary-bright uppercase font-black tracking-[0.8em] mb-12">User Experience Alpha</h2>

          <blockquote className="text-display-m md:text-[70px] text-white font-display font-black mb-20 leading-[1.1] tracking-tight max-w-5xl mx-auto">
            "FOR THE FIRST TIME, THE FINANCIAL LIFE OF THE CITY FEELS AS FLUID AS THE CITY ITSELF."
          </blockquote>

          <div className="flex items-center justify-center gap-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-bright to-secondary-warm p-[1px] rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-[1.9rem] bg-neutral-obsidian overflow-hidden">
                  <div className="w-full h-full bg-primary-bright/20" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success border-4 border-neutral-obsidian" />
            </div>
            <div className="text-left">
              <div className="text-white font-display font-black text-2xl tracking-tighter uppercase">Amara Okafor</div>
              <div className="text-neutral-dim text-[10px] uppercase tracking-[0.4em] font-bold mt-1">Metropolis Citizen #4782</div>
            </div>
          </div>
        </div>

        {/* Background Grid Element */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #22D3EE 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </section>

      <Footer />
    </main>
  );
}
