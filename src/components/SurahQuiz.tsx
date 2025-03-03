import React, { useState, useEffect } from 'react';
import { fetchSurah, fetchSurahs } from '../apiService';
import { maskWordInAyah, isWordMatch } from '../utils/helpers';

const SurahQuiz: React.FC = () => {
    const [surahs, setSurahs] = useState<any[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<string>('');
    const [ayah, setAyah] = useState<any>(null);
    const [maskedWord, setMaskedWord] = useState<string>('');
    const [maskedWordVariations, setMaskedWordVariations] = useState<string[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSurahChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const surahNumber = event.target.value;
        setSelectedSurah(surahNumber);
        await fetchNewAyah(surahNumber);
    };

    const fetchNewAyah = async (surahNumber: string) => {
        if (!surahNumber) return;

        setLoading(true);
        setError('');
        try {
            const surahData = await fetchSurah(surahNumber).then((data) => data[0]);
            const surahAyahs = surahData.ayahs || [];

            if (surahAyahs.length === 0) {
                setError('No ayahs found in this surah');
                setAyah(null);
                return;
            }

            const randomIndex = Math.floor(Math.random() * surahData.numberOfAyahs);
            const selectedAyah = surahAyahs[randomIndex];
            const { maskedText, maskedWord, maskedWordVariations } = maskWordInAyah(selectedAyah.text);
            setAyah({ ...selectedAyah, text: maskedText });
            setMaskedWord(maskedWord);
            setMaskedWordVariations(maskedWordVariations);
            setFeedback('');
            setUserInput('');
        } catch (error) {
            console.error('Error fetching surah:', error);
            setError('Failed to fetch ayahs. Please try again.');
            setAyah(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!userInput.trim()) {
            setFeedback('Please enter a word.');
            return;
        }

        if (isWordMatch(userInput, maskedWord)) {
            setFeedback('Correct!');
        } else {
            setFeedback(`Incorrect. The correct word was "${maskedWord}".`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    useEffect(() => {
        const loadSurahs = async () => {
            setLoading(true);
            try {
                const surahData = await fetchSurahs();
                setSurahs(surahData);
                if (surahData.length > 0) {
                    setSelectedSurah(surahData[0].number.toString());
                    await fetchNewAyah(surahData[0].number.toString());
                }
            } catch (error) {
                console.error('Error loading surahs:', error);
                setError('Failed to load surahs. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        loadSurahs();
    }, []);

    return (
        <div className="quiz-container">
            <h1>Surah Quiz</h1>
            <div className="quiz-controls">
                <label htmlFor="surah">Select Surah:</label>
                <select id="surah" value={selectedSurah} onChange={handleSurahChange}>
                    {surahs.map((surah) => (
                        <option key={surah.name} value={surah.number}>
                            {surah.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="quiz-content">
                <h2>Quiz</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && ayah && (
                    <div className="quiz-question">
                        <p className="ayah-text" dangerouslySetInnerHTML={{ __html: ayah.text }}></p>
                        <div className="input-group">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type the masked word"
                                className="word-input"
                            />
                            <button onClick={handleSubmit} className="submit-btn">
                                Submit
                            </button>
                            <button onClick={() => fetchNewAyah(selectedSurah)} className="next-btn">
                                Next Question
                            </button>
                        </div>
                        {feedback && (
                            <p className={feedback.startsWith('Correct') ? 'feedback-correct' : 'feedback-incorrect'}>
                                {feedback}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurahQuiz;
