import React from 'react';

interface ScoreCounterProps {
    score: number;
    total: number;
}

const ScoreCounter: React.FC<ScoreCounterProps> = ({ score, total }) => {
    // Calculate the percentage for the progress bar
    const percentage = total === 0 ? 0 : Math.min(100, Math.round((score / total) * 100));

    return (
        <div className="fixed top-4 right-4 bg-white rounded-xl py-2 px-4 shadow-md flex flex-col items-center gap-1 z-10">
            <div className="font-hand text-base text-primary font-bold">Score</div>
            <div className="flex items-center gap-1">
                <span className="font-hand text-2xl text-primary font-bold">{score}</span>
                <span className="font-hand text-lg">/</span>
                <span className="font-hand text-lg text-ink-light">{total}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div
                    className="h-full bg-success transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ScoreCounter;
