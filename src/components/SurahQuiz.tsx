import React, { useState, useEffect } from 'react';
import { fetchSurah, fetchSurahs } from '../apiService';
import { maskWordInAyah, removeDiacritics } from '../utils/helpers';

const SurahQuiz: React.FC = () => {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [ayah, setAyah] = useState<any>(null);
  const [maskedWord, setMaskedWord] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

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
      const selectedAyah = surahAyahs[randomIndex];
      const { maskedText, maskedWord } = maskWordInAyah(selectedAyah.text);
      setAyah({ ...selectedAyah, text: maskedText });
      setMaskedWord(maskedWord);
      setFeedback('');
      setUserInput('');
    } catch (error) {
      console.error('Error fetching surah:', error);
    }
  };

  const handleSubmit = () => {
    const normalizedInput = removeDiacritics(userInput.trim().toLowerCase());
    const normalizedMaskedWord = removeDiacritics(maskedWord.trim().toLowerCase());

    console.log(`"${normalizedInput}"`, `"${normalizedMaskedWord}"`);

    if (normalizedInput === normalizedMaskedWord) {
      setFeedback('Correct!');
    } else {
      setFeedback(`Incorrect. The correct word was "${maskedWord}".`);
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
            <p>{ayah.text}</p>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the masked word"
            />
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => fetchNewAyah(selectedSurah)}>Next Question</button>
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahQuiz; 