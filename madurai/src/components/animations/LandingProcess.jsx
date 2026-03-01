import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, ListPlus, Radio, Leaf } from 'lucide-react';

const steps = [
    {
        num: '01',
        icon: UserPlus,
        title: 'Register / Login',
        desc: 'Create your citizen account in seconds. No complicated process — just your name, ward, and contact details.',
        delay: 0,
    },
    {
        num: '02',
        icon: ListPlus,
        title: 'List or Report',
        desc: 'List your bio-waste for sale or raise a civic complaint about your area directly from your phone.',
        delay: 0.15,
    },
    {
        num: '03',
        icon: Radio,
        title: 'Track in Real-Time',
        desc: 'Follow your listing or complaint status live. Get updates the moment action is taken in your ward.',
        delay: 0.3,
    },
    {
        num: '04',
        icon: Leaf,
        title: 'Cleaner Environment',
        desc: 'Your participation directly contributes to a healthier, greener, and cleaner Madurai for everyone.',
        delay: 0.45,
    },
];

export default function LandingProcess() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="py-24" style={{ background: '#E8F5E9' }}>
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-[#2E7D32] border border-[#A5D6A7] mb-4">
                        Simple Steps
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Four simple steps to become part of Madurai's smart civic movement.
                    </p>
                </motion.div>

                {/* Steps grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map(({ num, icon: Icon, title, desc, delay }, index) => (
                        <motion.div
                            key={num}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
                            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
                            transition={{ duration: 0.6, delay, ease: 'easeOut' }}
                            className="relative"
                        >
                            {/* Connector line (horizontal, desktop only) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 -translate-y-1/2 z-0"
                                    style={{ background: 'linear-gradient(90deg, #A5D6A7, #E8F5E9)', width: 'calc(100% - 2rem)', left: '80%' }}
                                />
                            )}

                            <div className="relative z-10 bg-white rounded-3xl p-7 border border-[#C8E6C9] hover:shadow-xl hover:border-[#81C784] transition-all duration-300 group">
                                {/* Step number */}
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="text-xs font-black text-[#2E7D32] tracking-widest opacity-60">{num}</span>
                                    <div className="flex-1 h-px bg-[#E8F5E9]" />
                                </div>

                                {/* Icon */}
                                <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                                    <Icon className="w-6 h-6 text-[#2E7D32]" />
                                </div>

                                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
