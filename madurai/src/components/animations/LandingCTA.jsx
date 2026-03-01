import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function LandingCTA() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.7 }}
                    className="relative rounded-[40px] overflow-hidden text-center p-12 md:p-20"
                    style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)' }}
                >
                    {/* Decorative circles */}
                    <div
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #2E7D32, transparent 70%)' }}
                    />
                    <div
                        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #66BB6A, transparent 70%)' }}
                    />

                    <div className="relative z-10">
                        {/* Badge */}
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-[#2E7D32] border border-[#A5D6A7] mb-6"
                        >
                            Join the Movement
                        </motion.span>

                        {/* Heading */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                        >
                            Be Part of the<br />
                            <span style={{ color: '#2E7D32' }}>Smart Clean Movement</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-gray-600 text-lg mb-10 max-w-xl mx-auto"
                        >
                            Join thousands of Madurai citizens already making a difference. It only takes a minute to get started.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            {/* Primary button with pulse animation */}
                            <Link
                                to="/login"
                                className="group relative flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg overflow-hidden cta-pulse-btn"
                                style={{ background: 'linear-gradient(135deg, #2E7D32, #66BB6A)' }}
                            >
                                <span className="absolute inset-0 rounded-2xl animate-ping opacity-25"
                                    style={{ background: 'linear-gradient(135deg, #2E7D32, #66BB6A)' }}
                                />
                                <UserPlus className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Create Account</span>
                                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* Secondary button */}
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-[#2E7D32] text-lg bg-white border-2 border-[#A5D6A7] hover:bg-[#F1F8E9] hover:border-[#2E7D32] transition-all duration-200 shadow-sm"
                            >
                                <LogIn className="w-5 h-5" />
                                Login
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
