import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import React from 'react';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
    text?: string;
    className?: string;
    delay?: number;
    duration?: number;
    stagger?: number;
    ease?: string; // Expecting standard GSAP easing string
    splitType?: 'chars' | 'words' | 'lines';
    from?: gsap.TweenVars; // Specific GSAP animation properties
    to?: gsap.TweenVars;
    threshold?: number;
    rootMargin?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    onLetterAnimationComplete?: () => void;
    tag?: string;
    enableScrollTrigger?: boolean;
}

const SplitText: React.FC<SplitTextProps> = ({
    text = '',
    className = '',
    delay = 0, // Default delay in seconds (react-bits uses ms but GSAP uses s usually, let's stick to standard GSAP seconds or divide if needed)
    duration = 1,
    stagger = 0.05,
    ease = 'power3.out',
    splitType = 'chars', // Simplifying to 'chars' or 'words' for manual implementation
    from = { opacity: 0, y: 50 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = '-10%',
    textAlign = 'left',
    onLetterAnimationComplete,
    tag = 'div',
    enableScrollTrigger = true,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [animated, setAnimated] = useState(false);

    useGSAP(
        () => {
            if (!ref.current) return;

            const elements = ref.current.querySelectorAll('.split-item');
            if (elements.length === 0) return;

            gsap.fromTo(
                elements,
                { ...from },
                {
                    ...to,
                    duration: duration,
                    delay: delay, // GSAP delay is in seconds
                    ease: ease,
                    stagger: stagger,
                    scrollTrigger: enableScrollTrigger ? {
                        trigger: ref.current,
                        start: `top bottom${rootMargin}`, // Trigger when top of element hits bottom of viewport + margin
                        toggleActions: 'play none none reverse',
                    } : undefined,
                    onComplete: () => {
                        setAnimated(true);
                        if (onLetterAnimationComplete) onLetterAnimationComplete();
                    }
                }
            );
        },
        { dependencies: [text, delay, duration, stagger, ease, from, to, threshold, rootMargin], scope: ref }
    );

    // Manual splitting logic
    const renderSplitText = () => {
        if (splitType === 'words') {
            const words = text.split(' ');
            return words.map((word, i) => (
                <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                    <span className="split-item" style={{ display: 'inline-block' }}>{word}</span>
                    {i < words.length - 1 ? ' ' : ''}
                </span>
            ));
        }

        // Default to chars
        return text.split('').map((char, i) => (
            <span key={i} className="split-item" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                {char}
            </span>
        ));
    };


    const Tag = (tag || 'p') as any;

    return (
        <Tag
            ref={ref}
            className={className}
            style={{ textAlign, display: 'inline-block' }}
        >
            {renderSplitText()}
        </Tag>
    );
};

export default SplitText;
