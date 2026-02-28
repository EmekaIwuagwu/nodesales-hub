"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ShieldCheck, Heart, ArrowUpRight, MapPin,
    BedDouble, Bath, Square
} from "lucide-react";

interface Property {
    id: string;
    title: string;
    type: string;
    price: string; // DNR
    location: string;
    beds: number;
    baths: number;
    sqm: number;
    image: string;
    isVerified: boolean;
}

export default function PropertyCard({ property }: { property: Property }) {
    const router = useRouter();

    const handleNavigate = () => {
        router.push(`/dashboard/properties/${property.id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={handleNavigate}
            className="sexy-card !p-0 overflow-hidden group border-white/5 hover:border-primary-bright/20 transition-all duration-700 cursor-pointer"
        >
            {/* Ultra-Dynamic Image Section */}
            <div className="relative h-[450px] overflow-hidden">
                <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian via-neutral-obsidian/20 to-transparent opacity-80" />

                {/* Status Badges */}
                <div className="absolute top-8 left-8 flex gap-3">
                    <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-3xl text-[9px] font-black text-white uppercase tracking-[0.3em] border border-white/10">
                        {property.type}
                    </span>
                    {property.isVerified && (
                        <span className="px-5 py-2 rounded-full bg-primary-bright/20 backdrop-blur-3xl text-[9px] font-black text-primary-bright uppercase tracking-[0.3em] border border-primary-bright/20 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> VERIFIED ASSET
                        </span>
                    )}
                </div>

                {/* Action Corner */}
                <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/5 backdrop-blur-3xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-500"
                >
                    <Heart className="w-5 h-5" />
                </button>

                {/* Price Label */}
                <div className="absolute bottom-8 left-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-black">Monthly Settlement</span>
                        <div className="text-5xl text-white font-display font-black leading-none tracking-tighter">
                            ◈ {property.price}
                            <span className="text-xl text-white/30 ml-2 tracking-widest">/ MO</span>
                        </div>
                    </div>
                </div>

                {/* Visual Reveal Icon (The Arrow the user mentioned) */}
                <div
                    className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-primary-bright flex items-center justify-center text-neutral-obsidian transform translate-y-24 group-hover:translate-y-0 transition-transform duration-700 shadow-[0_0_30px_rgba(56,189,248,0.5)] cursor-pointer hover:scale-110 active:scale-95 z-30"
                >
                    <ArrowUpRight className="w-10 h-10" />
                </div>
            </div>

            {/* Premium Meta Content */}
            <div className="p-10 space-y-8">
                <div>
                    <h3 className="text-3xl text-white font-display font-black mb-3 tracking-tight uppercase group-hover:text-primary-bright transition-colors duration-500">{property.title}</h3>
                    <div className="flex items-center gap-3 text-white/30">
                        <MapPin className="w-4 h-4 text-primary-bright" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black">{property.location} <span className="text-white/10 ml-2">| KORTANA CITY</span></span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleNavigate}
                        className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white text-neutral-obsidian hover:bg-neutral-200 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        VIEW DETAILS
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                        <Square className="w-4 h-4" />
                        FRACTIONALIZE
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
                    <div className="flex flex-col items-center gap-3">
                        <BedDouble className="w-5 h-5 text-white/20 group-hover:text-primary-bright transition-colors" />
                        <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{property.beds} BEDS</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 border-x border-white/5">
                        <Bath className="w-5 h-5 text-white/20 group-hover:text-primary-bright transition-colors" />
                        <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{property.baths} BATHS</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Square className="w-5 h-5 text-white/20 group-hover:text-primary-bright transition-colors" />
                        <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{property.sqm} m²</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
