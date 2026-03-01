import { motion } from 'framer-motion';
import { Leaf, Recycle, Trees as Tree, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CleanMaduraiLogo from '../logo/CleanMaduraiLogo';
import bgImage from '../../assets/image.png';

const floatingVariants = {
    animate: {
        y: [0, -18, 0],
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
    },
};
const floatingVariants2 = {
    animate: {
        y: [0, 14, 0],
        rotate: [0, 8, 0],
        transition: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 },
    },
};

export default function LandingHero() {
    return (
        <section
            className="relative h-[100vh] flex flex-col items-center justify-center overflow-hidden"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-0"></div>

            {/* Floating icons (Parallax/Subtle) */}
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-[18%] left-[8%] opacity-30 hidden md:block z-10"
            >
                <Leaf className="w-14 h-14 text-white" />
            </motion.div>
            <motion.div
                variants={floatingVariants2}
                animate="animate"
                className="absolute bottom-[22%] right-[8%] opacity-30 hidden md:block z-10"
            >
                <Tree className="w-20 h-20 text-[#66BB6A]" />
            </motion.div>
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-[40%] right-[14%] hidden md:block z-10"
            >
                <Recycle className="w-10 h-10 text-white" />
            </motion.div>

            {/* Hero Content */}
            <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl flex flex-col items-center">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    className="flex justify-center mb-6"
                >
                    <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                        <CleanMaduraiLogo size={80} />
                    </div>
                </motion.div>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex justify-center mb-6"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-black/30 text-white backdrop-blur-md">
                        🌿 Smart City · Madurai
                    </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] text-white"
                >
                    CLEAN <br className="sm:hidden" /> <span className="text-[#66BB6A]">MADURAI</span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-bold uppercase tracking-[0.2em] leading-relaxed drop-shadow-lg"
                >
                    Smart Waste Intelligence Platform
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
                >
                    <Link
                        to="/login"
                        className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl font-bold text-white text-lg bg-[#2E7D32] hover:bg-[#388E3C] shadow-lg shadow-black/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                    >
                        Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl font-bold text-white text-lg bg-transparent border-2 border-white hover:bg-white hover:text-[#2E7D32] transition-all duration-200"
                    >
                        Track Complaints
                    </Link>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="mt-16 flex flex-wrap justify-center gap-3"
                >
                    {['🌱 Eco-Friendly', '📍 Real-Time Tracking', '♻️ Waste Recycling', '🏙️ Smart City'].map((tag) => (
                        <span
                            key={tag}
                            className="px-4 py-2 rounded-full text-xs md:text-sm font-medium text-white bg-black/40 backdrop-blur-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

