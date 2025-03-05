import React, { useState, useEffect, useRef } from 'react';
import { fetchJuz } from '../apiService';
import { maskWordInAyah, isWordMatch, playSound } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import ScoreCounter from './ScoreCounter';

const JuzQuiz: React.FC = () => {
    const [juzNumber, setJuzNumber] = useState<string>('1');
    const [ayah, setAyah] = useState<any>(null);
    const [maskedWord, setMaskedWord] = useState<string>('');
    const [maskedWordVariations, setMaskedWordVariations] = useState<string[]>([]);
    const [maskedWordLength, setMaskedWordLength] = useState<number>(0);
    const [userInput, setUserInput] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [totalAttempts, setTotalAttempts] = useState<number>(0);
    const [answered, setAnswered] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [isShaking, setIsShaking] = useState<boolean>(false);
    const navigate = useNavigate();
    const ayahContainerRef = useRef<HTMLDivElement>(null);

    // Auto-submit when input length matches masked word length
    useEffect(() => {
        if (userInput.length === maskedWordLength && !answered) {
            // Small delay to allow the user to see what they typed
            setTimeout(() => handleSubmit(), 400);
        }
    }, [userInput, maskedWordLength, answered]);

    const handleJuzChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedJuz = event.target.value;
        setJuzNumber(selectedJuz);
        await fetchNewAyah(selectedJuz);
    };

    const fetchNewAyah = async (juzNumber: string) => {
        setLoading(true);
        setError('');
        setAnswered(false);
        setUserInput('');
        setIsCorrect(false);
        setIsShaking(false);
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
            const { maskedText, maskedWord, maskedWordVariations, maskedWordLength } = maskWordInAyah(
                selectedAyah.text
            );
            setAyah({ ...selectedAyah, text: maskedText });
            setMaskedWord(maskedWord);
            setMaskedWordVariations(maskedWordVariations);
            setMaskedWordLength(maskedWordLength);
            setFeedback('');
        } catch (error) {
            console.error('Error fetching Juz:', error);
            setError('Failed to fetch ayahs. Please try again.');
            setAyah(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!userInput.trim() || answered) {
            return;
        }

        setAnswered(true);
        setTotalAttempts((prev) => prev + 1);

        const isCorrectGuess = isWordMatch(userInput, maskedWord);
        setIsCorrect(isCorrectGuess);

        // Play sound immediately
        playSound(isCorrectGuess ? 'correct' : 'incorrect');

        if (isCorrectGuess) {
            setFeedback('Correct!');
            setScore((prev) => prev + 1);

            // Automatically move to next question after a delay
            setTimeout(() => {
                fetchNewAyah(juzNumber);
            }, 1000);
        } else {
            setFeedback(`Incorrect. The correct word was "${maskedWord}".`);
            setIsShaking(true);

            setTimeout(() => {
                setIsShaking(false);
            }, 500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !answered) {
            handleSubmit();
        }
    };

    const goToHome = () => {
        navigate('/');
    };

    // Add this helper function to split ayah text
    const getAyahParts = () => {
        if (!ayah) return { before: '', after: '' };
        const parts = ayah.text.split('<span id="masked-word-container" class="masked"></span>');
        return { before: parts[0], after: parts[1] || '' };
    };

    const { before, after } = getAyahParts();

    // Inline rendering of masked word
    const renderMaskedInline = () => {
        // Calculate exact width based on the masked word length
        const inputStyle: React.CSSProperties = {
            width: `${maskedWordLength}ch`,
            direction: 'rtl' as 'rtl',
        };

        if (!answered) {
            return (
                <div className="inline-flex relative">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`font-arabic text-2xl bg-transparent text-primary font-bold text-right outline-none ${
                            !userInput && 'animate-blink'
                        }`}
                        style={inputStyle}
                        placeholder={''.padEnd(maskedWordLength, '_')}
                        maxLength={maskedWordLength}
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        autoFocus
                    />
                </div>
            );
        } else {
            return (
                <span className={`font-arabic text-2xl font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                    {maskedWord}
                </span>
            );
        }
    };

    // Scroll to ayah container when it changes
    useEffect(() => {
        if (ayahContainerRef.current && ayah) {
            ayahContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [ayah]);

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
                        <div
                            ref={ayahContainerRef}
                            className={`relative font-arabic text-2xl leading-relaxed text-right rtl p-5 bg-white rounded-lg shadow mb-5 ${
                                isShaking ? 'animate-shake' : ''
                            }`}
                        >
                            {before}
                            {renderMaskedInline()}
                            {after}
                        </div>
                        <div className="flex flex-col items-center gap-3 my-4">
                            <p className="text-center text-gray-600">
                                {answered
                                    ? isCorrect
                                        ? 'Correct! Moving to next question...'
                                        : `Click "Next Question" to continue.`
                                    : 'Type the missing word in the highlighted area.'}
                            </p>

                            {feedback && (
                                <p className={`text-center font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                                    {feedback}
                                </p>
                            )}

                            <button
                                onClick={() => fetchNewAyah(juzNumber)}
                                className="bg-secondary text-white py-3 px-6 rounded-full font-bold shadow transition-all hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5"
                                disabled={loading}
                            >
                                Next Question
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JuzQuiz;
