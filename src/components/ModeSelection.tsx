import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ModeCardProps {
    title: string;
    arabicTitle: string;
    description: string;
    icon: string;
    value: 'surah' | 'whole' | 'juz';
    selected: boolean;
    onClick: (mode: 'surah' | 'whole' | 'juz') => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ title, arabicTitle, description, icon, value, selected, onClick }) => {
    return (
        <div
            className={`rounded-xl p-4 text-center cursor-pointer transition-all hover:-translate-y-1 flex flex-col items-center justify-center h-full shadow-md ${
                selected
                    ? 'border border-primary -translate-y-1 animate-pop-in bg-white'
                    : 'border border-gray-100 bg-white'
            }`}
            onClick={() => onClick(value)}
        >
            <div className="text-4xl mb-2">{icon}</div>
            <h3 className="text-2xl font-hand text-primary mb-1 font-bold">{title}</h3>
            <h4 className="text-xl font-arabic mb-2 arabic">{arabicTitle}</h4>
            <p className="text-base text-ink opacity-80 font-hand">{description}</p>
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
        <div className="max-w-4xl mx-auto p-4 font-hand min-h-screen flex flex-col items-center justify-center">
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-5xl font-hand text-primary mb-2 text-center font-bold">Quranic Quiz</h1>
                <h2 className="text-3xl font-arabic text-primary rtl">اختبار قرآني</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 w-full">
                <ModeCard
                    title="Surah Quiz"
                    arabicTitle="اختبار السورة"
                    description="Test your knowledge of specific surahs"
                    icon="📖"
                    value="surah"
                    selected={selectedMode === 'surah'}
                    onClick={handleModeSelect}
                />
                <ModeCard
                    title="Juz Quiz"
                    arabicTitle="اختبار الجزء"
                    description="Test your knowledge by Juz divisions"
                    icon="📚"
                    value="juz"
                    selected={selectedMode === 'juz'}
                    onClick={handleModeSelect}
                />
                <ModeCard
                    title="Whole Quran"
                    arabicTitle="القرآن الكامل"
                    description="Test your knowledge from the entire Quran"
                    icon="🕋"
                    value="whole"
                    selected={selectedMode === 'whole'}
                    onClick={handleModeSelect}
                />
            </div>

            <div className="flex gap-4 items-center">
                <button onClick={startQuiz} className="btn btn-lg btn-primary font-hand text-xl rtl">
                    Start Quiz | بدء الاختبار
                </button>
            </div>
        </div>
    );
};

export default ModeSelection;
