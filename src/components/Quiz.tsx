import React, { useState, useEffect } from 'react';
import { fetchSurahs, fetchAyah } from '../apiService';
import { useLocation } from 'react-router-dom';

const Quiz: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode') as 'surah' | 'whole';
  const [surahs, setSurahs] = useState<any[]>([]);
  const [ayah, setAyah] = useState<any>(null);
  const [selectedSurah, setSelectedSurah] = useState<string>('');

  const handleSurahChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSurah(event.target.value);
  };

  const getRandomAyah = () => {
    if (mode === 'surah' && selectedSurah) {
      // Fetch a random ayah from the selected surah
      const surahAyahs = surahs.find(surah => surah.name === selectedSurah)?.ayahs || [];
      const randomIndex = Math.floor(Math.random() * surahAyahs.length);
      return surahAyahs[randomIndex];
    } else if (mode === 'whole') {
      // Fetch a random ayah from the whole Quran
      const allAyahs = surahs.flatMap(surah => surah.ayahs);
      const randomIndex = Math.floor(Math.random() * allAyahs.length);
      return allAyahs[randomIndex];
    }
    return null;
  };

  useEffect(() => {
    const loadSurahs = async () => {
      const surahData = await fetchSurahs();
      setSurahs(surahData);
    };

    const loadAyah = async () => {
      const ayahData = await fetchAyah('2:255'); // Example ayah
      setAyah(ayahData);
    };

    loadSurahs();
    loadAyah();
  }, []);

  useEffect(() => {
    if (mode === 'surah' && selectedSurah) {
      const ayahData = getRandomAyah();
      setAyah(ayahData);
    } else if (mode === 'whole') {
      const ayahData = getRandomAyah();
      setAyah(ayahData);
    }
  }, [mode, selectedSurah, surahs]);

  return (
    <div>
      <h1>Quran Quiz</h1>
      {mode === 'surah' && (
        <div>
          <label htmlFor="surah">Select Surah:</label>
          <select id="surah" value={selectedSurah} onChange={handleSurahChange}>
            {surahs.map(surah => (
              <option key={surah.name} value={surah.name}>{surah.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <h2>Quiz</h2>
        {ayah && (
          <div>
            {mode === 'surah' ? (
              <p>{ayah.text.replace(/\b\w+\b/, '____')}</p> // Mask a word
            ) : (
              <p>{ayah.text}</p> // Show full ayah
            )}
            <p>What is the name of the surah?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz; 