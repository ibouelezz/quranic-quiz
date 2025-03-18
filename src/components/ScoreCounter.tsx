import React from 'react';

interface ScoreCounterProps {
    score: number;
    total: number;
}

const ScoreCounter: React.FC<ScoreCounterProps> = ({ score, total }) => {
    // Calculate the percentage for the progress bar
    const percentage = total === 0 ? 0 : Math.min(100, Math.round((score / total) * 100));

    return (
        <div className="fixed bottom-10 left-5 bg-white border-3 border-purple rounded-xl py-3 px-6 shadow-lg flex flex-col items-center gap-2 z-10 animate-bounce-slow">
            <div className="font-sketch text-lg">Score:</div>
            <div className="flex items-center gap-2">
                <span className="font-sketch text-2xl text-primary">{score}</span>
                <span className="font-sketch">/</span>
                <span className="font-sketch text-lg text-ink">{total}</span>
            </div>

            {/* Hand-drawn progress bar */}
            <div className="w-full h-4 bg-paper border-2 border-dashed border-gray-300 rounded-full overflow-hidden mt-1">
                <div
                    className="h-full bg-success transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ScoreCounter;
