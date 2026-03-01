import { motion } from 'framer-motion';
import { ShoppingBag, Radio, MessageSquare, PieChart } from 'lucide-react';

const SOLUTIONS = [
    {
        title: "Bio-Waste Marketplace",
        subtitle: "Connect waste sellers with local buyers",
        desc: "Transform organic waste into a commodity. Farmers and industrial units can buy verified bio-waste for composting and fuel.",
        icon: ShoppingBag,
        gradient: "from-green-500 to-emerald-600"
    },
    {
        title: "Smart Bin Monitoring",
        subtitle: "IoT-based live tracking",
        desc: "Real-time fill level updates from city bins. Optimized collection routes powered by ultrasonic sensor integration.",
        icon: Radio,
        gradient: "from-lime-400 to-green-500"
    },
    {
        title: "Complaint Management",
        subtitle: "QR-based citizen reporting",
        desc: "Identify issues instantly via QR scans. Track resolution progress through a secure, transparent citizen portal.",
        icon: MessageSquare,
        gradient: "from-civic-green to-teal-500"
    },
    {
        title: "Real-Time Dashboard",
        subtitle: "Firebase-powered analytics",
        desc: "Comprehensive role-based data visualization for city officers to monitor environmental health metrics.",
        icon: PieChart,
        gradient: "from-emerald-400 to-lime-500"
    }
];

export default function LandingSolution() {
    return (
        <section id="solution" className="py-24 bg-gradient-to-b from-[#0F2E1C] to-[#123924]">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl text-left">
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-black mb-4"
                        >
                            Our Smart Solution
                        </motion.h2>
                        <p className="text-gray-400 text-lg">
                            We leverage cutting-edge IoT and cloud technology to build a truly circular city infrastructure.
                        </p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex gap-2"
                    >
                        <div className="w-8 h-2 rounded-full bg-civic-green" />
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {SOLUTIONS.map((sol, i) => {
                        const Icon = sol.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row gap-8 group"
                            >
                                <div className={`w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br ${sol.gradient} flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                                    <Icon className="w-10 h-10" />
                                </div>
                                <div>
                                    <span className="text-lime-400 text-sm font-black uppercase tracking-widest block mb-2">{sol.subtitle}</span>
                                    <h3 className="text-2xl font-bold mb-4">{sol.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {sol.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
