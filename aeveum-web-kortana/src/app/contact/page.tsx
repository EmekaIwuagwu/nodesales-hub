"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Send, 
  MapPin, 
  Mail, 
  Shield, 
  Globe, 
  Link as LinkIcon, 
  Zap,
  Lock,
  Database,
  ArrowRight,
  ChevronDown
} from "lucide-react";

const contactDetails = [
  { icon: <Mail />, label: "Email", value: "contact@aeveum.io", href: "mailto:contact@aeveum.io" },
  { icon: <MapPin />, label: "Registration", value: "Wyoming, United States", href: "#" },
  { icon: <LinkIcon />, label: "Blockchain Verification", value: "Kortana Network v4", href: "#" },
  { icon: <Shield />, label: "Security Compliance", value: "SOC-2 Type II Certified", href: "#" }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organisation: "",
    productInterest: "defence-drones",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
       setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-background-primary overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Contact Hero */}
        <section className="flex flex-col lg:flex-row gap-20">
          <div className="w-full lg:w-1/2 space-y-12">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-accent-primary font-mono text-sm tracking-widest font-bold uppercase flex items-center gap-3"
              >
                <div className="w-8 h-[1px] bg-accent-primary" />
                Connectivity
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black font-heading leading-tight uppercase"
              >
                Get In <br/><span className="text-accent-primary">Touch.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-text-secondary leading-relaxed max-w-xl"
              >
                For government and enterprise procurement inquiries, 
                our team is available for briefings and product demonstrations.
              </motion.p>
            </div>

            <div className="space-y-8 pt-8 border-t border-aeveum-border">
              {contactDetails.map((detail, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="w-10 h-10 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                     {detail.icon}
                  </div>
                  <div>
                     <div className="text-[10px] font-mono tracking-widest uppercase opacity-40">{detail.label}</div>
                     <a href={detail.href} className="text-xl font-bold uppercase group-hover:text-accent-primary transition-colors">
                        {detail.value}
                     </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 glass bg-accent-primary/10 border border-accent-primary/20 flex items-center gap-6 text-sm font-bold uppercase tracking-widest">
               <Database className="w-8 h-8 text-accent-primary" />
               <p className="max-w-xs leading-relaxed opacity-70">
                  All communications are blockchain logged for security and compliance.
               </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative glass-card p-12 md:p-20 overflow-hidden border border-aeveum-border">
             <div className="absolute top-0 right-0 p-8 opacity-5 text-accent-primary">
                <Send className="w-64 h-64" />
             </div>
             
             {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                   <div className="w-24 h-24 rounded-full bg-accent-primary flex items-center justify-center text-background-primary">
                      <Lock className="w-12 h-12" />
                   </div>
                   <h2 className="text-4xl font-bold uppercase tracking-tight">Message Encrypted</h2>
                   <p className="text-text-secondary max-w-sm">
                      Your inquiry has been received and securely logged on the Kortana network. 
                      One of our officers will reach out to you within 24 hours.
                   </p>
                   <button 
                     onClick={() => setSubmitted(false)}
                     className="btn-primary px-12 uppercase tracking-widest font-black"
                   >
                     SEND ANOTHER
                   </button>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10 transition-all duration-500">
                   <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Commander Rank Name" 
                        className="w-full bg-background-primary/40 border border-aeveum-border p-5 focus:border-accent-primary outline-none text-xl font-bold rounded-none placeholder:opacity-20 transition-colors"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-xs font-mono uppercase tracking-widest text-text-secondary ml-1">Email Address</label>
                         <input 
                           required 
                           type="email" 
                           placeholder="officer@aeveum.io" 
                           className="w-full bg-background-primary/40 border border-aeveum-border p-5 focus:border-accent-primary outline-none text-xl font-bold rounded-none placeholder:opacity-20 transition-colors"
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2 relative">
                         <label className="text-xs font-mono uppercase tracking-widest text-text-secondary ml-1">Organisation</label>
                         <input 
                           required 
                           type="text" 
                           placeholder="Government / Agency" 
                           className="w-full bg-background-primary/40 border border-aeveum-border p-5 focus:border-accent-primary outline-none text-xl font-bold rounded-none placeholder:opacity-20 transition-colors"
                           onChange={(e) => setFormData({...formData, organisation: e.target.value})}
                        />
                      </div>
                   </div>
                   <div className="space-y-2 relative">
                      <label className="text-xs font-mono uppercase tracking-widest text-text-secondary ml-1">Product Interest</label>
                      <select 
                        className="w-full bg-background-primary/40 border border-aeveum-border p-5 focus:border-accent-primary outline-none text-xl font-bold rounded-none appearance-none cursor-pointer transition-colors"
                        onChange={(e) => setFormData({...formData, productInterest: e.target.value})}
                      >
                         <option value="defence-drones">Defence Drones</option>
                         <option value="dispatch-drones">Dispatch Drones</option>
                         <option value="humanoid-robots">Humanoid Robots</option>
                         <option value="reporting">General Inquiry</option>
                      </select>
                      <ChevronDown className="absolute right-6 bottom-7 w-6 h-6 text-accent-primary pointer-events-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-text-secondary ml-1">Detailed Inquiry</label>
                      <textarea 
                        required
                        className="w-full h-48 bg-background-primary/40 border border-aeveum-border p-5 focus:border-accent-primary outline-none text-xl font-bold rounded-none placeholder:opacity-20 transition-colors resize-none overflow-hidden"
                        placeholder="Detail your requirements for autonomous systems..."
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      ></textarea>
                   </div>
                   <button type="submit" className="w-full py-6 bg-accent-primary text-background-primary text-xl font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-[0.98]">
                      TRANSMIT INQUIRY
                   </button>
                </form>
             )}
          </div>
        </section>

        {/* Global Security Section */}
        <section className="bg-background-secondary p-12 md:p-24 space-y-16 border border-aeveum-border text-center overflow-hidden group">
           <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Verified Global Network</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                 Our communication network is secured by the DNR network, providing military-level encryption and 
                 guaranteed data privacy for all government and enterprise correspondence.
              </p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-16 md:gap-32 pt-8 opacity-40">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest grayscale hover:grayscale-0 transition-all cursor-default">
                 <Shield className="w-8 h-8 text-accent-primary" />
                 SOC-2 TYPE II
              </div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest grayscale hover:grayscale-0 transition-all cursor-default text-accent-primary">
                 <Lock className="w-8 h-8" />
                 AES-256-GCM
              </div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest grayscale hover:grayscale-0 transition-all cursor-default">
                 <Database className="w-8 h-8 text-accent-secondary" />
                 DNR COMPLIANT
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
