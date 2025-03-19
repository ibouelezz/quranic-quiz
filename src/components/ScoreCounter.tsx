import React, { useState, useRef, useEffect } from 'react';

interface ScoreCounterProps {
    score: number;
    total: number;
}

const ScoreCounter: React.FC<ScoreCounterProps> = ({ score, total }) => {
    // Calculate the percentage for the progress bar
    const percentage = total === 0 ? 0 : Math.min(100, Math.round((score / total) * 100));

    // Track previous score to animate changes
    const [prevScore, setPrevScore] = useState(score);
    const [prevPercentage, setPrevPercentage] = useState(percentage);

    // Animation state for score change
    const [isAnimating, setIsAnimating] = useState(false);

    // Reference to the counter element
    const counterRef = useRef<HTMLDivElement>(null);

    // Add a hover state to track when to show the tooltip
    const [isHovering, setIsHovering] = useState(false);

    // Effect to animate score change
    useEffect(() => {
        if (score !== prevScore) {
            setIsAnimating(true);

            // More dramatic animation for significant score increases
            const isSignificantChange = score - prevScore > 2 || (score / prevScore >= 1.5 && prevScore > 0);

            const timer = setTimeout(
                () => {
                    setIsAnimating(false);
                    setPrevScore(score);
                    setPrevPercentage(percentage);
                },
                isSignificantChange ? 1000 : 800
            );

            return () => clearTimeout(timer);
        }
    }, [score, prevScore, percentage]);

    // Calculate the circular progress indicator parameters
    const size = 70; // Size of the circle in pixels
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Select progress color based on performance
    const getProgressColor = () => {
        if (percentage >= 75) return 'var(--success, #4CAF50)';
        if (percentage >= 50) return 'var(--primary, #F9A826)';
        if (percentage >= 25) return 'var(--secondary, #39B9D2)';
        return 'var(--error, #E53935)';
    };

    return (
        <div
            ref={counterRef}
            className={`fixed bottom-4 left-4 z-50 transition-all duration-500 ease-out ${
                isAnimating
                    ? score > prevScore
                        ? 'scale-125 animate-bounce-once'
                        : 'scale-95'
                    : 'scale-100 hover:scale-110'
            }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            title={`Score: ${score}/${total}`}
        >
            <div className="relative">
                {/* Circular progress indicator */}
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className={`transform -rotate-90 transition-all ${isAnimating ? 'animate-spin-slow' : ''}`}
                >
                    {/* Background circle with more transparency */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        className="opacity-20"
                    />
                    {/* Progress circle with gradient and glow effect */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={getProgressColor()}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: isAnimating ? 'drop-shadow(0px 0px 3px rgba(73, 175, 80, 0.6))' : 'none' }}
                    />
                </svg>

                {/* Semi-transparent background for better text visibility */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className={`w-[50px] h-[50px] bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center border ${
                            isAnimating ? (score > prevScore ? 'border-success' : 'border-error') : 'border-primary/20'
                        } transition-all`}
                    >
                        <div
                            className={`text-xl font-hand font-bold transition-all ${
                                isAnimating
                                    ? score > prevScore
                                        ? 'text-success scale-110'
                                        : 'text-error'
                                    : 'text-primary'
                            }`}
                        >
                            {percentage}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Score tooltip */}
            {isHovering && !isAnimating && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mt-2 bg-ink text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90 shadow-lg animate-pop-in z-50">
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-ink rotate-45"></div>
                    Score: {score}/{total}
                </div>
            )}
        </div>
    );
};

export default ScoreCounter;
