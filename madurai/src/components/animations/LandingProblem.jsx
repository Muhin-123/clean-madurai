import { motion } from 'framer-motion';
import { AlertTriangle, CloudOff, Timer, BarChart2 } from 'lucide-react';

const CHALLENGES = [
    {
        title: "Unstructured Disposal",
        desc: "Bio-waste often ends up in landfills, wasting precious nutrients and increasing methane emissions.",
        icon: CloudOff,
        color: "text-red-400"
    },
    {
        title: "Lack of Transparency",
        desc: "Citizens face delays in complaint resolution with no clear tracking or accountability system.",
        icon: AlertTriangle,
        color: "text-amber-400"
    },
    {
        title: "Static Monitoring",
        desc: "Traditional bins offer no visibility into fill levels, leading to overflow or inefficient collection routes.",
        icon: Timer,
        color: "text-civic-green"
    },
    {
        title: "Linear Economy",
        desc: "Valuable resource recycling is ignored, missing the opportunity for a circular city economy.",
        icon: BarChart2,
        color: "text-lime-400"
    }
];

export default function LandingProblem() {
    return (
        <section id="challenges" className="py-24 bg-[#0F2E1C]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black mb-4"
                    >
                        The Challenge
                    </motion.h2>
                    <div className="w-20 h-1 bg-lime-400 mx-auto rounded-full" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {CHALLENGES.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
