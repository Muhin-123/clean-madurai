import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Wrench, Building2 } from 'lucide-react';

const roles = [
    {
        icon: Users,
        title: 'Citizens',
        subtitle: 'The Heart of the Movement',
        points: ['List bio-waste for sale', 'Raise civic complaints', 'Track complaint resolution', 'View ward rankings'],
        color: '#2E7D32',
        bg: '#E8F5E9',
        border: '#A5D6A7',
        delay: 0,
    },
    {
        icon: Wrench,
        title: 'Workers',
        subtitle: 'On the Ground, Every Day',
        points: ['Scan QR codes at collection points', 'Update waste pickup status', 'Report field issues', 'View assigned routes'],
        color: '#388E3C',
        bg: '#F1F8E9',
        border: '#C5E1A5',
        delay: 0.15,
    },
    {
        icon: Building2,
        title: 'Officers',
        subtitle: 'Governing Smart & Transparent',
        points: ['Monitor ward performance', 'Manage worker teams', 'Oversee bio-waste marketplace', 'Generate city-level reports'],
        color: '#1B5E20',
        bg: '#E8F5E9',
        border: '#A5D6A7',
        delay: 0.3,
    },
];

export default function LandingRoles() {
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
                        Built for Everyone
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                        Who Is It For?
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        One platform. Three key roles. Working together for a cleaner city.
                    </p>
                </motion.div>

                {/* Role cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {roles.map(({ icon: Icon, title, subtitle, points, color, bg, border, delay }) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 40 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay }}
                            whileHover={{ y: -6 }}
                            className="bg-white rounded-3xl p-8 border-2 hover:shadow-2xl transition-all duration-300 group"
                            style={{ borderColor: border }}
                        >
                            {/* Icon circle */}
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200"
                                style={{ background: bg }}
                            >
                                <Icon className="w-8 h-8" style={{ color }} />
                            </div>

                            <h3 className="text-xl font-black text-gray-900 mb-1">{title}</h3>
                            <p className="text-sm font-medium mb-5" style={{ color }}>{subtitle}</p>

                            {/* Divider */}
                            <div className="w-12 h-0.5 rounded-full mb-5" style={{ background: bg }} />

                            <ul className="space-y-2.5">
                                {points.map((point) => (
                                    <li key={point} className="flex items-start gap-2 text-gray-600 text-sm">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
