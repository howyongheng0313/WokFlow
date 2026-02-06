import React, { useRef } from 'react';
import Particles from './Particles';
import Navbar from './Navbar';
import Footer from './Footer';
import { ViewState } from '../types';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

interface AboutViewProps {
    setCurrentView: (view: ViewState) => void;
}

const founders = [
    {
        name: "How Yong-Heng",
        role: "Co-Founder",
        description: "Visionary leader driving the technological direction of Wokflow. Passionate about creating seamless user experiences and innovative solutions.",
        image: "https://duk.tw/QQsUdO.jpg",
        color: "from-orange-400 to-red-500"
    },
    {
        name: "Leong Yu Hang",
        role: "Co-Founder",
        description: "The creative mind behind our platform's design. Dedicated to ensuring that every interaction on Wokflow is intuitive, beautiful, and engaging.",
        image: "https://duk.tw/aZB9zE.jpg",
        color: "from-blue-400 to-indigo-500"
    },
    {
        name: "Kuek Zheng Yu",
        role: "Co-Founder",
        description: "Expert in operations and business strategy. Focuses on scalability and ensuring that Wokflow delivers consistent value to all our users.",
        image: "https://duk.tw/NhG40s.png",
        color: "from-emerald-400 to-teal-500"
    },
    {
        name: "Randy Chee Yee Kae",
        role: "Co-Founder",
        description: "Community builder and content strategist. Works tirelessly to grow our network of learners and sharers, fostering a vibrant knowledge-sharing ecosystem.",
        image: "https://duk.tw/QiwvhH.jpg",
        color: "from-purple-400 to-pink-500"
    }
];

const AboutView: React.FC<AboutViewProps> = ({ setCurrentView }) => {
    return (
        <div className="bg-[#F8F9FA] text-black overflow-x-hidden selection:bg-orange-500 selection:text-white pb-0">
            <Navbar
                onSignInClick={() => setCurrentView(ViewState.LANDING)}
                onLogoClick={() => setCurrentView(ViewState.LANDING)}
                onAboutClick={() => setCurrentView(ViewState.ABOUT)}
                customRightContent={
                    <>
                        <style>{`nav .absolute { display: none !important; }`}</style>
                        <button
                            onClick={() => setCurrentView(ViewState.LANDING)}
                            className="flex items-center gap-2 text-gray-600 hover:text-[#FF8C66] transition-colors font-medium px-6 py-2.5 rounded-full hover:bg-white/80"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to Home</span>
                        </button>
                    </>
                }
            />

            {/* Hero Section */}
            <div className="relative h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0">
                    <Particles
                        particleColors={['#FF8C66', '#FFB399', '#E5E7EB']}
                        particleCount={300}
                        particleSpread={10}
                        speed={0.2}
                        particleBaseSize={100}
                        moveParticlesOnHover={true}
                        alphaParticles={true}
                        disableRotation={false}
                    />
                </div>

                <div className="relative z-10 text-center max-w-5xl mx-auto space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter text-black"
                    >
                        Meet the <span className="text-[#FF8C66] relative inline-block">
                            Innovators
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FF8C66] opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        The visionary minds reshaping the future of culinary education.
                    </motion.p>

                    {/* Bouncing Arrow - Positioning relative to content to avoid overlap */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-16 flex flex-col items-center gap-2 animate-bounce text-gray-400"
                    >
                        <ArrowDown size={32} />
                        <span className="text-sm font-medium tracking-widest uppercase">Scroll Down</span>
                    </motion.div>
                </div>
            </div>

            {/* Sticky Scroll Section */}
            <div className="relative w-full">
                <ScrollStack
                    useWindowScroll={true}
                    itemStackDistance={50}
                    stackPosition="15%" // Cards stick slightly lower than top to show header
                    scaleEndPosition="10%"
                    scaleDuration={0.5}
                    itemDistance={100} // Distance between cards before they stack
                >
                    {founders.map((founder, i) => (
                        <ScrollStackItem
                            key={i}
                            itemClassName="!h-[600px] !w-full !max-w-[1100px] mx-auto bg-white/90 backdrop-blur-2xl !rounded-[3rem] border border-white/50 !p-0 overflow-hidden flex flex-col md:flex-row shadow-2xl !my-0"
                        >
                            {/* Content Side */}
                            <div className="flex-1 p-12 flex flex-col justify-center gap-6 relative overflow-hidden group">
                                {/* Decorative background gradient */}
                                <div className={`absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br ${founder.color} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`} />

                                <div className="relative z-10">
                                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r ${founder.color} bg-opacity-10 w-fit`}>
                                        <span className="text-xs font-bold tracking-widest uppercase text-white drop-shadow-sm">{founder.role}</span>
                                    </div>

                                    <h2 className="text-4xl md:text-5xl font-bold mt-6 text-gray-900 leading-tight">
                                        {founder.name}
                                    </h2>

                                    <p className="text-lg text-gray-600 mt-6 leading-relaxed font-light">
                                        {founder.description}
                                    </p>
                                </div>
                            </div>

                            {/* Image Side */}
                            <div className="flex-1 relative overflow-hidden m-4 rounded-[2.5rem]">
                                <div className="w-full h-full transform transition-transform duration-700 hover:scale-105">
                                    <img
                                        src={founder.image}
                                        alt={founder.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            </div>
                        </ScrollStackItem>
                    ))}
                </ScrollStack>
            </div>

            {/* Bottom CTA */}
            <div className="min-h-[50vh] flex flex-col items-center justify-center relative overflow-hidden py-32 bg-white">
                <div className="absolute inset-0 bg-gradient-to-t from-[#FF8C66]/10 to-transparent" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 text-center px-6"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-8 text-black">Ready to join our journey?</h2>
                    <button
                        onClick={() => setCurrentView(ViewState.LANDING)}
                        className="px-8 py-4 bg-[#FF8C66] text-white text-lg font-bold rounded-full hover:bg-[#ff7a4d] transition-all transform hover:scale-105 shadow-xl shadow-orange-500/20"
                    >
                        Get Started Today
                    </button>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutView;
