import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickSparkProps {
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
}

interface Spark {
    id: number;
    x: number;
    y: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
    sparkColor = '#FF8C66', // Orange theme default
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 0.4,
}) => {
    const [sparks, setSparks] = useState<Spark[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const newSpark = { id: Date.now(), x: e.clientX, y: e.clientY };
            setSparks((prev) => [...prev, newSpark]);

            setTimeout(() => {
                setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
            }, duration * 1000);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [duration]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence>
                {sparks.map((spark) => (
                    <SparkGroup
                        key={spark.id}
                        x={spark.x}
                        y={spark.y}
                        color={sparkColor}
                        size={sparkSize}
                        radius={sparkRadius}
                        count={sparkCount}
                        duration={duration}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

interface SparkGroupProps {
    x: number;
    y: number;
    color: string;
    size: number;
    radius: number;
    count: number;
    duration: number;
}

const SparkGroup: React.FC<SparkGroupProps> = ({
    x,
    y,
    color,
    size,
    radius,
    count,
    duration,
}) => {
    return (
        <div style={{ position: 'absolute', left: x, top: y }}>
            {Array.from({ length: count }).map((_, i) => {
                const angle = (i * 360) / count;
                return (
                    <motion.div
                        key={i}
                        initial={{ outputPath: 0, scale: 0 }} // Start small
                        animate={{
                            opacity: [1, 0], // Fade out
                            scale: [1, 0], // Shrink
                            x: [0, Math.cos((angle * Math.PI) / 180) * radius], // Move outward
                            y: [0, Math.sin((angle * Math.PI) / 180) * radius],
                        }}
                        transition={{ duration: duration, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            width: size,
                            height: size,
                            backgroundColor: color,
                            borderRadius: '50%', // Make them circles
                            // Or we can use lines for a "spark" look:
                            // height: size / 3,
                            // width: size,
                            // borderRadius: 999,
                            // transform: `rotate(${angle}deg)`,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default ClickSpark;
