import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModeSelection: React.FC = () => {
  const [mode, setMode] = useState<'surah' | 'whole'>('surah');
  const navigate = useNavigate();

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(event.target.value as 'surah' | 'whole');
  };

  const startQuiz = () => {
    navigate(`/quiz?mode=${mode}`);
  };

  return (
    <div>
      <h1>Select Quiz Mode</h1>
      <div>
        <label htmlFor="mode">Select Mode:</label>
        <select id="mode" value={mode} onChange={handleModeChange}>
          <option value="surah">Surah</option>
          <option value="whole">Whole Quran</option>
        </select>
      </div>
      <button onClick={startQuiz}>Start Quiz</button>
    </div>
  );
};

export default ModeSelection; 