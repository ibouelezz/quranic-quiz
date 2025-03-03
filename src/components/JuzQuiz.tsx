import React, { useState, useEffect } from 'react';
import { fetchJuz } from '../apiService';
import { maskWordInAyah, isWordMatch } from '../utils/helpers';

const JuzQuiz: React.FC = () => {
    const [juzNumber, setJuzNumber] = useState<string>('1');
    const [ayah, setAyah] = useState<any>(null);
    const [maskedWord, setMaskedWord] = useState<string>('');
    const [maskedWordVariations, setMaskedWordVariations] = useState<string[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleJuzChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedJuz = event.target.value;
        setJuzNumber(selectedJuz);
        await fetchNewAyah(selectedJuz);
    };

    const fetchNewAyah = async (juzNumber: string) => {
        setLoading(true);
        setError('');
        try {
            const juzData = await fetchJuz(juzNumber);
            const juzAyahs = juzData.ayahs || [];

            if (juzAyahs.length === 0) {
                setError('No ayahs found in this juz');
                setAyah(null);
                return;
            }

            const randomIndex = Math.floor(Math.random() * juzAyahs.length);
            const selectedAyah = juzAyahs[randomIndex];
            const { maskedText, maskedWord, maskedWordVariations } = maskWordInAyah(selectedAyah.text);
            setAyah({ ...selectedAyah, text: maskedText });
            setMaskedWord(maskedWord);
            setMaskedWordVariations(maskedWordVariations);
            setFeedback('');
            setUserInput('');
        } catch (error) {
            console.error('Error fetching Juz:', error);
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
        fetchNewAyah(juzNumber);
    }, []);

    return (
        <div className="quiz-container">
            <h1>Juz' Quiz</h1>
            <div className="quiz-controls">
                <label htmlFor="juz">Select Juz':</label>
                <select id="juz" value={juzNumber} onChange={handleJuzChange}>
                    {Array.from({ length: 30 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{`Juz' ${i + 1}`}</option>
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
                            <button onClick={() => fetchNewAyah(juzNumber)} className="next-btn">
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

export default JuzQuiz;
