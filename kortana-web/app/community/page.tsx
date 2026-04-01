'use client';

import PageHeader from "@/components/PageHeader";
import { FaXTwitter, FaDiscord, FaTelegram, FaLinkedin, FaGithub } from "react-icons/fa6";
import { Coffee, MapPin } from "lucide-react";

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20">
            <PageHeader
                title="Join the Community"
                subtitle="Global. Distributed. United."
            />

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    <SocialCard
                        icon={<FaXTwitter className="w-8 h-8 text-white" />}
                        name="X (Twitter)"
                        desc="Latest announcements and ecosystem news."
                        link="Follow @KortanaChain"
                        href="https://x.com/KortanaChain"
                    />
                    <SocialCard
                        icon={<FaDiscord className="w-8 h-8 text-indigo-400" />}
                        name="Discord"
                        desc="Developer chat, governance discussions, and MEMES."
                        link="Join Server"
                        href="https://discord.gg/yHfkeja7QR"
                    />
                    <SocialCard
                        icon={<FaTelegram className="w-8 h-8 text-cyan-400" />}
                        name="Telegram"
                        desc="Local communities and fast-paced chat."
                        link="Join Channel"
                        href="https://t.me/kortanaChains"
                    />
                    <SocialCard
                        icon={<FaLinkedin className="w-8 h-8 text-blue-500" />}
                        name="LinkedIn"
                        desc="Professional network and business updates."
                        link="Connect with Us"
                        href="https://www.linkedin.com/company/kortana"
                    />
                    {/* <SocialCard
                        icon={<FaGithub className="w-8 h-8 text-white" />}
                        name="GitHub"
                        desc="Contribute to the core protocol and open source tools."
                        link="Start Committing"
                        href="https://github.com/kortana"
                    />
                    <SocialCard
                        icon={<Coffee className="w-8 h-8 text-yellow-400" />}
                        name="Governance Forum"
                        desc="Long-form proposals (KIPs) and research."
                        link="Read Proposals"
                        href="#"
                    /> */}
                </div>

                <div className="border-t border-white/10 pt-16">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Global Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <EventCard
                            city="Washington DC"
                            date="Sep 9-11, 2026"
                            title="Stablecon ’26  "
                        />
                        <EventCard
                            city="Barcelona"
                            date="Sep 17-18, 2026"
                            title="European Blockchain Convention 12"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function SocialCard({ icon, name, desc, link, href }: { icon: React.ReactNode, name: string, desc: string, link: string, href: string }) {
    return (
        <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel p-8 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all hover:-translate-y-1 group cursor-pointer block"
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">{icon}</div>
                <h3 className="text-xl font-bold text-white">{name}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 h-10">{desc}</p>
            <span className="text-cyan-400 font-bold text-sm uppercase tracking-wider group-hover:underline decoration-cyan-400/50 underline-offset-4">{link}</span>
        </a>
    )
}

function EventCard({ city, date, title }: { city: string, date: string, title: string }) {
    return (
        <div className="flex items-center gap-6 p-6 rounded-xl bg-white/5 border border-white/5">
            <div className="text-center w-20 shrink-0">
                <div className="text-sm text-cyan-400 font-bold uppercase mb-1">{date.split(',')[0].split(' ')[0]}</div>
                <div className="text-2xl font-bold text-white">{date.split(',')[0].split(' ')[1]}</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div>
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" /> {city}
                </div>
            </div>
        </div>
    )
}
