import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useStats } from '../../hooks/useFirebaseData';

function Counter({ target, suffix, inView }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return (
        <span>
            {count.toLocaleString()}{suffix}
        </span>
    );
}

export default function LandingStats() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const { stats, loading } = useStats();

    const displayStats = [
        { value: stats.totalListings, suffix: '+', label: 'Active Listings', emoji: '📋' },
        { value: Math.round(stats.bioWasteTraded / 1000), suffix: ' Tons', label: 'Waste Recycled', emoji: '♻️' },
        { value: Math.round(stats.bioWasteTraded * 0.45 / 1000), suffix: ' Tons', label: 'CO₂ Reduced', emoji: '🌿' },
        { value: stats.totalResolved, suffix: '+', label: 'Complaints Resolved', emoji: '✅' },
    ];

    return (
        <section ref={ref} className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] mb-4">
                        Our Impact
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                        Making a Real Difference
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Every listing, every complaint, every report — each action helps build a better Madurai.
                    </p>
                </motion.div>

                {/* Counters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayStats.map(({ value, suffix, label, emoji }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="group relative rounded-3xl p-8 text-center bg-white border-2 border-[#E8F5E9] hover:border-[#A5D6A7] hover:shadow-xl transition-all duration-300"
                        >
                            <div className="text-4xl mb-3">{emoji}</div>
                            <div
                                className="text-3xl md:text-4xl font-black mb-1"
                                style={{ color: '#2E7D32' }}
                            >
                                <Counter target={value} suffix={suffix} inView={inView} />
                            </div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">{label}</p>

                            {/* Bottom accent */}
                            <div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full group-hover:w-3/4 w-0 transition-all duration-500"
                                style={{ background: 'linear-gradient(90deg, #2E7D32, #66BB6A)' }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
