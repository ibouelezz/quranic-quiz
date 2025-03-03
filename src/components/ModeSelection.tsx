import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModeSelection: React.FC = () => {
    const [mode, setMode] = useState<'surah' | 'whole' | 'juz'>('surah');
    const navigate = useNavigate();

    const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setMode(event.target.value as 'surah' | 'whole' | 'juz');
    };

    const startQuiz = () => {
        if (mode === 'surah') {
            navigate('/quiz/surah');
        } else if (mode === 'whole') {
            navigate('/quiz/whole');
        } else if (mode === 'juz') {
            navigate('/quiz/juz');
        }
    };

    return (
        <div className="quiz-container">
            <h1>Quranic Quiz</h1>
            <div className="quiz-content">
                <h2>Select Quiz Mode</h2>
                <div className="quiz-controls">
                    <label htmlFor="mode">Select Mode:</label>
                    <select id="mode" value={mode} onChange={handleModeChange}>
                        <option value="surah">Surah</option>
                        <option value="whole">Whole Quran</option>
                        <option value="juz">Juz</option>
                    </select>
                </div>
                <div className="input-group">
                    <button onClick={startQuiz} className="submit-btn">
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModeSelection;
