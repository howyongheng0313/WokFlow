
import React, { useEffect, useRef } from 'react';
import { ChefHat, ChevronRight, Play, Star, Users, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ViewState } from '../types';
import SplitText from './SplitText';

interface HeroProps {
  onCtaClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  const bgRef = useRef(null);
  const imgRef = useRef(null);

  useGSAP(() => {
    // Animate Background first
    gsap.fromTo(bgRef.current,
      { opacity: 0, scale: 0.8, rotation: -45 },
      { opacity: 1, scale: 1, rotation: 0, duration: 1.2, delay: 2.2, ease: "power3.out" }
    );

    // Animate Image later
    gsap.fromTo(imgRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, delay: 3.0, ease: "power3.out" }
    );
  });

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div className="z-10 flex flex-col items-start space-y-8">

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-[#1A1A1A] leading-[0.95]">
            <SplitText
              text="Find Your"
              className="inline-block"
              delay={0.1}
              duration={1}
              stagger={0.03}
              tag="span"
              from={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
              to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              enableScrollTrigger={false}
            /> <br />
            <SplitText
              text="Culinary"
              className="text-[#FF8C66] inline-block mr-4"
              delay={0.6}
              duration={1}
              stagger={0.03}
              tag="span"
              from={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
              to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              enableScrollTrigger={false}
            />
            <SplitText
              text="Flow"
              className="text-[#FF8C66] inline-block"
              delay={1.1}
              duration={1}
              stagger={0.03}
              tag="span"
              from={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
              to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              enableScrollTrigger={false}
            />
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-md leading-relaxed">
            Master world-class recipes through interactive tutorials, expert quizzes, and step-by-step guidance.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <button
              onClick={onCtaClick}
              className="bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white px-8 py-3 rounded-full font-medium hover:shadow-orange-500/30 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <ChefHat size={18} />
              Start Cooking
            </button>
          </div>

        </div>

        {/* Right Content - Visual */}
        <div className="relative h-[500px] w-full flex items-center justify-center">
          {/* Hover Container */}
          <div className="relative group w-full h-full flex items-center justify-center cursor-pointer">

            {/* 
                   Diamond Background
                   - Updated to Orange Gradient Glass
                */}
            <div ref={bgRef} className="absolute flex items-center justify-center w-full h-full opacity-0">
              <div className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-gradient-to-br from-[#FF8C66] to-[#FFB399] rounded-[3rem] rotate-45 transition-transform duration-700 ease-in-out group-hover:rotate-[65deg] shadow-2xl opacity-10 blur-xl"></div>
              <div className="glass-panel absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-[3rem] rotate-45 transition-transform duration-700 ease-in-out group-hover:rotate-[65deg] border-white/60"></div>
            </div>

            {/* 
                   Image
                */}
            <img
              ref={imgRef}
              src="https://duk.tw/3Niw3b.png"
              alt="Culinary Composition"
              className="relative z-10 w-[90%] md:w-[85%] object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-105 opacity-0"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;