import React, { useState, useEffect } from 'react';
import { fetchJuz } from '../apiService';
import { maskWordInAyah, isWordMatch } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import ScoreCounter from './ScoreCounter';

const JuzQuiz: React.FC = () => {
    const [juzNumber, setJuzNumber] = useState<string>('1');
    const [ayah, setAyah] = useState<any>(null);
    const [maskedWord, setMaskedWord] = useState<string>('');
    const [maskedWordVariations, setMaskedWordVariations] = useState<string[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [totalAttempts, setTotalAttempts] = useState<number>(0);
    const [answered, setAnswered] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleJuzChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedJuz = event.target.value;
        setJuzNumber(selectedJuz);
        await fetchNewAyah(selectedJuz);
    };

    const fetchNewAyah = async (juzNumber: string) => {
        setLoading(true);
        setError('');
        setAnswered(false);
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

        if (answered) {
            return;
        }

        setAnswered(true);
        setTotalAttempts((prev) => prev + 1);

        if (isWordMatch(userInput, maskedWord)) {
            setFeedback('Correct!');
            setScore((prev) => prev + 1);
        } else {
            setFeedback(`Incorrect. The correct word was "${maskedWord}".`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    const goToHome = () => {
        navigate('/');
    };

    useEffect(() => {
        fetchNewAyah(juzNumber);
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-5 font-sans">
            <h1 className="text-3xl font-bold text-dark mb-6 text-center">Juz' Quiz</h1>
            <ScoreCounter score={score} total={totalAttempts} />
            <div className="mb-6 flex items-center justify-center gap-3">
                <label htmlFor="juz">Select Juz':</label>
                <select
                    id="juz"
                    value={juzNumber}
                    onChange={handleJuzChange}
                    className="p-2 rounded border border-gray-300 text-base min-w-[150px]"
                >
                    {Array.from({ length: 30 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{`Juz' ${i + 1}`}</option>
                    ))}
                </select>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-card">
                <h2 className="text-2xl font-bold text-primary mb-4 text-center">Quiz</h2>
                {loading && <p className="text-center">Loading...</p>}
                {error && <p className="text-error text-center font-bold">{error}</p>}
                {!loading && !error && ayah && (
                    <div className="flex flex-col gap-5">
                        <p
                            className="font-arabic text-2xl leading-relaxed text-right rtl p-5 bg-white rounded-lg shadow mb-5"
                            dangerouslySetInnerHTML={{ __html: ayah.text }}
                        ></p>
                        <div className="flex flex-wrap gap-3 justify-center my-4 md:flex-row flex-col">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type the masked word"
                                className="font-arabic p-3 rounded border border-gray-300 text-lg flex-grow max-w-xs md:max-w-full md:mb-0 mb-3"
                            />
                            <button
                                onClick={handleSubmit}
                                className="bg-primary text-white py-3 px-6 rounded-full font-bold shadow-button transition-all hover:bg-blue-600 hover:shadow-button-hover hover:-translate-y-0.5 md:w-auto w-full md:mb-0 mb-3"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => fetchNewAyah(juzNumber)}
                                className="bg-secondary text-white py-3 px-6 rounded-full font-bold shadow transition-all hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 md:w-auto w-full"
                            >
                                Next Question
                            </button>
                        </div>
                        {feedback && (
                            <p
                                className={
                                    feedback.startsWith('Correct')
                                        ? 'text-success font-bold text-center'
                                        : 'text-error font-bold text-center'
                                }
                            >
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
