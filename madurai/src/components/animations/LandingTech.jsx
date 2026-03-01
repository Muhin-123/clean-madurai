import { motion } from 'framer-motion';
import { Database, Zap, Cpu, Code2, Globe, Shield } from 'lucide-react';

const TECH_STACK = [
    { name: "React + Vite", icon: Zap, desc: "High-performance frontend architecture for smooth user interactions." },
    { name: "Firebase Auth", icon: Shield, desc: "Industry-standard secure authentication and role-based access." },
    { name: "Firestore (NoSQL)", icon: Database, desc: "Real-time, scalable database for synchronized waste monitoring." },
    { name: "Firebase RTDB", icon: Globe, desc: "Ultra-low latency connection for live IoT bin level telemetry." },
    { name: "IoT Integration", icon: Cpu, desc: "ESP32 sensors and smart hardware layer for city-wide data collection." },
    { name: "AI Monitoring", icon: Code2, desc: "Intelligent logic for anomaly detection and route optimization." }
];

export default function LandingTech() {
    return (
        <section id="tech" className="py-24 bg-[#0F2E1C]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black mb-6"
                    >
                        Powered by Modern Tech
                    </motion.h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Our enterprise-grade technology stack ensures security, scalability, and real-time performance.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TECH_STACK.map((tech, i) => {
                        const Icon = tech.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-civic-green/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-civic-green transition-all">
                                    <Icon className="w-6 h-6 text-civic-green group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{tech.name}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {tech.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
