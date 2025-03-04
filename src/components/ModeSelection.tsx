import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ModeCardProps {
    title: string;
    description: string;
    icon: string;
    value: 'surah' | 'whole' | 'juz';
    selected: boolean;
    onClick: (mode: 'surah' | 'whole' | 'juz') => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ title, description, icon, value, selected, onClick }) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-card p-5 text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center h-full ${
                selected ? 'border-3 border-primary -translate-y-1 shadow-lg' : ''
            }`}
            onClick={() => onClick(value)}
        >
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
            <p className="text-base text-dark mb-4">{description}</p>
        </div>
    );
};

const ModeSelection: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState<'surah' | 'whole' | 'juz'>('surah');
    const navigate = useNavigate();

    const handleModeSelect = (mode: 'surah' | 'whole' | 'juz') => {
        setSelectedMode(mode);
    };

    const startQuiz = () => {
        navigate(`/quiz/${selectedMode}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-5 font-sans">
            <h1 className="text-3xl font-bold text-dark mb-6 text-center">Quranic Quiz</h1>
            <div className="bg-background p-6 rounded-xl shadow-card">
                <h2 className="text-2xl font-bold text-primary mb-4 text-center">Select Quiz Mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
                    <ModeCard
                        title="Surah Quiz"
                        description="Test your knowledge of specific surahs from the Quran."
                        icon="📖"
                        value="surah"
                        selected={selectedMode === 'surah'}
                        onClick={handleModeSelect}
                    />
                    <ModeCard
                        title="Juz Quiz"
                        description="Test your knowledge based on Juz divisions of the Quran."
                        icon="📚"
                        value="juz"
                        selected={selectedMode === 'juz'}
                        onClick={handleModeSelect}
                    />
                    <ModeCard
                        title="Whole Quran Quiz"
                        description="Test your knowledge from the entire Quran."
                        icon="🕋"
                        value="whole"
                        selected={selectedMode === 'whole'}
                        onClick={handleModeSelect}
                    />
                </div>
                <div className="flex flex-wrap gap-3 justify-center my-4">
                    <button
                        onClick={startQuiz}
                        className="bg-primary text-white py-3 px-6 rounded-full font-bold shadow-button transition-all hover:bg-blue-600 hover:shadow-button-hover hover:-translate-y-0.5"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModeSelection;
