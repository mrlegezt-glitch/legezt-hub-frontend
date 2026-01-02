'use client';

// ==================================
// Meteor Shower Animation Effect
// ==================================

export default function MeteorShower() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Meteor trails */}
            {[...Array(30)].map((_, i) => (
                <div
                    key={i}
                    className="meteor"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${0.5 + Math.random() * 1}s`,
                    }}
                />
            ))}

            <style jsx>{`
                .meteor {
                    position: absolute;
                    top: -20px;
                    width: 1px;
                    height: 30px;
                    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.7), transparent);
                    border-radius: 50%;
                    animation: fall linear infinite;
                    opacity: 0;
                }

                :global(.dark) .meteor {
                    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5), transparent);
                }

                :global(.light) .meteor {
                    background: linear-gradient(to bottom, transparent, rgba(245, 158, 11, 0.3), transparent);
                }

                @keyframes fall {
                    0% {
                        transform: translateY(0) translateX(0) rotate(45deg);
                        opacity: 0;
                    }
                    5% {
                        opacity: 0.8;
                    }
                    95% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(100vh) translateX(80px) rotate(45deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}

