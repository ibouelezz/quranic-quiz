import React from 'react';

interface ScoreCounterProps {
    score: number;
    total: number;
}

const ScoreCounter: React.FC<ScoreCounterProps> = ({ score, total }) => {
    return (
        <div className="fixed bottom-10 left-5 bg-white rounded-full py-2 px-5 shadow-md flex items-center gap-3 z-10">
            <div>Score:</div>
            <span className="font-bold text-primary">
                {score}/{total}
            </span>
        </div>
    );
};

export default ScoreCounter;
