import React, { useState, useEffect } from 'react';
import { fetchWholeQuran } from '../apiService';

const WholeQuranQuiz: React.FC = () => {
    const [surahs, setSurahs] = useState<any[]>([]);
    const [ayah, setAyah] = useState<any>(null);
    const [userGuess, setUserGuess] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const getRandomAyah = () => {
        const allAyahs = surahs.flatMap((surah) =>
            surah.ayahs.map((ayah: any) => ({
                ...ayah,
                surahName: surah.englishName,
                surahNameTranslation: surah.englishNameTranslation,
                name: surah.name,
            }))
        );
        const randomIndex = Math.floor(Math.random() * allAyahs.length);
        return allAyahs[randomIndex];
    };

    useEffect(() => {
        const loadSurahs = async () => {
            setLoading(true);
            setError('');
            try {
                const wholeQuran = await fetchWholeQuran();
                setSurahs(wholeQuran.surahs);
            } catch (error) {
                console.error('Error loading Quran data:', error);
                setError('Failed to load Quran data. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        loadSurahs();
    }, []);

    useEffect(() => {
        if (surahs.length > 0) {
            const ayahData = getRandomAyah();
            setAyah(ayahData);
        }
    }, [surahs]);

    const handleNextQuestion = () => {
        const ayahData = getRandomAyah();
        setAyah(ayahData);
        setUserGuess('');
        setFeedback('');
    };

    const handleGuessSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (ayah) {
            const possibleNames = [
                ayah.surahName.toLowerCase(), // English name
                ayah.surahNameTranslation.toLowerCase(), // English translation
                ayah.name, // Arabic name
            ];
            if (possibleNames.includes(userGuess.toLowerCase())) {
                setFeedback('Correct!');
            } else {
                setFeedback(`Incorrect. The correct answer is ${ayah.surahName} (${ayah.name}).`);
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleGuessSubmit(event as unknown as React.FormEvent);
        }
    };

    return (
        <div className="quiz-container">
            <h1>Whole Quran Quiz</h1>
            <div className="quiz-content">
                <h2>Quiz</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && ayah && (
                    <div className="quiz-question">
                        <p className="ayah-text">{ayah.text}</p>
                        <form onSubmit={handleGuessSubmit}>
                            <p>What is the name of the surah?</p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={userGuess}
                                    onChange={(e) => setUserGuess(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter surah name"
                                    className="word-input"
                                />
                                <button type="submit" className="submit-btn">
                                    Submit
                                </button>
                                <button type="button" onClick={handleNextQuestion} className="next-btn">
                                    Next
                                </button>
                            </div>
                        </form>
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

export default WholeQuranQuiz;
