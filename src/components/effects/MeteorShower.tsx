'use client';

// ==================================
// Ambient Floating Orbs Effect
// ==================================

import { useMemo } from 'react';

interface Orb {
    id: number;
    size: number;
    x: number;
    y: number;
    color: string;
    delay: number;
    duration: number;
    variant: number;
}

const COLORS_LIGHT = [
    'rgba(59, 130, 246, 0.12)',   // blue
    'rgba(139, 92, 246, 0.10)',   // purple
    'rgba(14, 165, 233, 0.10)',   // sky
    'rgba(236, 72, 153, 0.08)',   // pink
    'rgba(34, 197, 94, 0.08)',    // green
];

const COLORS_DARK = [
    'rgba(59, 130, 246, 0.15)',
    'rgba(139, 92, 246, 0.12)',
    'rgba(14, 165, 233, 0.12)',
    'rgba(236, 72, 153, 0.10)',
    'rgba(34, 197, 94, 0.10)',
];

export default function MeteorShower() {
    const orbs = useMemo<Orb[]>(() =>
        Array.from({ length: 8 }, (_, i) => ({
            id: i,
            size: 120 + Math.floor(Math.random() * 280),
            x: Math.floor(Math.random() * 90),
            y: Math.floor(Math.random() * 80),
            color: COLORS_LIGHT[i % COLORS_LIGHT.length],
            delay: Math.random() * 4,
            duration: 12 + Math.random() * 10,
            variant: i % 3,
        })),
        []
    );

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
            {/* Floating gradient orbs */}
            {orbs.map((orb) => (
                <div
                    key={orb.id}
                    className={`absolute rounded-full blur-3xl orb-float-${orb.variant}`}
                    style={{
                        width: `${orb.size}px`,
                        height: `${orb.size}px`,
                        left: `${orb.x}%`,
                        top: `${orb.y}%`,
                        background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
                        animationDelay: `${orb.delay}s`,
                        animationDuration: `${orb.duration}s`,
                    }}
                />
            ))}

            {/* Subtle mesh grid overlay */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <style jsx>{`
                .orb-float-0 {
                    animation: orbDrift1 ease-in-out infinite;
                }
                .orb-float-1 {
                    animation: orbDrift2 ease-in-out infinite;
                }
                .orb-float-2 {
                    animation: orbDrift3 ease-in-out infinite;
                }

                @keyframes orbDrift1 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                    25%      { transform: translate(40px, -30px) scale(1.1); opacity: 0.8; }
                    50%      { transform: translate(-20px, 40px) scale(0.9); opacity: 0.5; }
                    75%      { transform: translate(-40px, -20px) scale(1.05); opacity: 0.7; }
                }

                @keyframes orbDrift2 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    33%      { transform: translate(-30px, 50px) scale(1.15); opacity: 0.7; }
                    66%      { transform: translate(50px, -30px) scale(0.85); opacity: 0.6; }
                }

                @keyframes orbDrift3 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
                    20%      { transform: translate(60px, 10px) scale(1.08); opacity: 0.5; }
                    40%      { transform: translate(20px, -50px) scale(0.95); opacity: 0.8; }
                    60%      { transform: translate(-40px, 20px) scale(1.12); opacity: 0.6; }
                    80%      { transform: translate(-20px, -30px) scale(0.98); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}

