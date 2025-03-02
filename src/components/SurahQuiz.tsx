import React, { useState, useEffect } from 'react';
import { fetchSurah, fetchSurahs } from '../apiService';

const maskWordInAyah = (text: string): string => {
  const words = text.split(' ');
  const randomIndex = Math.floor(Math.random() * words.length);
  words[randomIndex] = '____';
  return words.join(' ');
};

const SurahQuiz: React.FC = () => {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [ayah, setAyah] = useState<any>(null);

  const handleSurahChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNumber = event.target.value;
    setSelectedSurah(surahNumber);
    await fetchNewAyah(surahNumber);
  };

  const fetchNewAyah = async (surahNumber: string) => {
    try {
      const surahData = await fetchSurah(surahNumber);
      const surahAyahs = surahData.ayahs || [];
      const randomIndex = Math.floor(Math.random() * surahData.numberOfAyahs);
      setAyah(surahAyahs[randomIndex]);
    } catch (error) {
      console.error('Error fetching surah:', error);
    }
  };

  useEffect(() => {
    const loadSurahs = async () => {
      const surahData = await fetchSurahs();
      setSurahs(surahData);
    };

    loadSurahs();
  }, []);

  return (
    <div>
      <h1>Surah Quiz</h1>
      <div>
        <label htmlFor="surah">Select Surah:</label>
        <select id="surah" value={selectedSurah} onChange={handleSurahChange}>
          {surahs.map(surah => (
            <option key={surah.name} value={surah.number}>{surah.name}</option>
          ))}
        </select>
      </div>
      <div>
        <h2>Quiz</h2>
        {ayah && (
          <div>
            <p>{maskWordInAyah(ayah?.text)}</p>
            <p>What is the correct word?</p>
            <button onClick={() => fetchNewAyah(selectedSurah)}>Next Question</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahQuiz; 