import { motion } from 'framer-motion';
import { Lock, Eye, Server, Layers } from 'lucide-react';

export default function LandingSecurity() {
    return (
        <section className="py-24 bg-gradient-to-b from-[#0F2E1C] to-[#123924] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1 relative"
                    >
                        <div className="glass-card p-4 rounded-[40px] border border-white/10 relative">
                            <div className="aspect-square bg-gradient-to-br from-civic-green to-teal-900 rounded-[30px] flex items-center justify-center p-12">
                                <Lock className="w-full h-full text-white/20 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-48 h-48 border-2 border-dashed border-lime-400/30 rounded-full"
                                    />
                                    <ShieldCheckIcon className="w-24 h-24 text-lime-400 drop-shadow-glow-green" />
                                </div>
                            </div>
                        </div>
                        {/* Decors */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-civic-green/20 blur-[60px] rounded-full" />
                    </motion.div>

                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                            Security & <span className="text-civic-green">Transparency</span> by Design
                        </h2>

                        <div className="space-y-8">
                            {[
                                { title: "Role-Based Access", desc: "Fine-grained permissions for Citizens, Workers, and Officers via Firebase Security Rules.", icon: Layers },
                                { title: "Real-Time Integrity", desc: "Data synchronization across all devices with instant audit logs for every transaction.", icon: Eye },
                                { title: "Scalable Infrastructure", desc: "Cloud-native architecture designed to handle city-wide deployment without downtime.", icon: Server }
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-6"
                                    >
                                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group">
                                            <Icon className="w-6 h-6 text-lime-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ShieldCheckIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
