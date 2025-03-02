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
    setSelectedSurah(event.target.value);
    const ayahData = await getRandomAyah(event.target.value);
    setAyah((prevAyah: any) => ({ ...prevAyah, ...ayahData }));
  };

  const getRandomAyah = async (selectedSurah: string) => {
    console.log(selectedSurah)

      try {
        const surahData = await fetchSurah(selectedSurah);
        const surahAyahs = surahData.ayahs || [];
        const randomIndex = Math.floor(Math.random() * surahData.numberOfAyahs);
        return surahAyahs[randomIndex];
      } catch (error) {
        console.error('Error fetching surah:', error);
        return null;
      }
  };

  useEffect(() => { 
    console.log({ayah})
  }, [ayah])

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
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahQuiz; 