import React, { useState, useEffect } from 'react';
import { fetchSurahs } from '../apiService';

const WholeQuranQuiz: React.FC = () => {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [ayah, setAyah] = useState<any>(null);

  const getRandomAyah = () => {
    const allAyahs = surahs.flatMap(surah => surah.ayahs);
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    return allAyahs[randomIndex];
  };

  useEffect(() => {
    const loadSurahs = async () => {
      const surahData = await fetchSurahs();
      setSurahs(surahData);
    };

    loadSurahs();
  }, []);

  useEffect(() => {
    const ayahData = getRandomAyah();
    setAyah(ayahData);
  }, [surahs]);

  return (
    <div>
      <h1>Whole Quran Quiz</h1>
      <div>
        <h2>Quiz</h2>
        {ayah && (
          <div>
            <p>{ayah.text}</p> // Show full ayah
            <p>What is the name of the surah?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WholeQuranQuiz; 