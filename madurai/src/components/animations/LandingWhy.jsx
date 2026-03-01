import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Recycle, Activity, ClipboardCheck } from 'lucide-react';

const cards = [
    {
        icon: Recycle,
        title: 'Sell Bio-Waste Easily',
        desc: 'List your bio-waste and connect with verified buyers in your city. Turn waste into value, effortlessly.',
        color: '#2E7D32',
        bg: '#E8F5E9',
        border: '#A5D6A7',
        delay: 0,
    },
    {
        icon: Activity,
        title: 'Smart Waste Monitoring',
        desc: 'Know exactly when collection happens in your area. Get live status updates on waste pickup and bin levels.',
        color: '#388E3C',
        bg: '#F1F8E9',
        border: '#C5E1A5',
        delay: 0.15,
    },
    {
        icon: ClipboardCheck,
        title: 'Transparent Complaint System',
        desc: 'Raise civic issues in seconds. Track every complaint from submission to resolution — openly and honestly.',
        color: '#1B5E20',
        bg: '#E8F5E9',
        border: '#A5D6A7',
        delay: 0.3,
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function LandingWhy() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] mb-4">
                        Why Choose Us
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                        Why This Platform?
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Everything you need to be part of a smarter, cleaner Madurai — in one place.
                    </p>
                </motion.div>

                {/* Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {cards.map(({ icon: Icon, title, desc, color, bg, border, delay }) => (
                        <motion.div
                            key={title}
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="group relative rounded-3xl p-8 bg-white border-2 hover:shadow-2xl transition-shadow duration-300 cursor-default"
                            style={{ borderColor: border }}
                        >
                            {/* Hover glow */}
                            <div
                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{ background: `radial-gradient(circle at 50% 0%, ${bg}80, transparent 70%)` }}
                            />

                            {/* Icon */}
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                                style={{ background: bg }}
                            >
                                <Icon className="w-7 h-7" style={{ color }} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{title}</h3>
                            <p className="text-gray-500 leading-relaxed relative z-10">{desc}</p>

                            {/* Bottom accent line */}
                            <div
                                className="absolute bottom-0 left-8 right-8 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
