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
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
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
        setShowConfetti(false);
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

        // Immediately set answered state and check result
        setAnswered(true);
        setTotalAttempts((prev) => prev + 1);

        const isCorrectGuess = isWordMatch(userInput, maskedWord);
        setIsCorrect(isCorrectGuess);

        // Play sound immediately - before any state updates or UI changes
        playSound(isCorrectGuess ? 'correct' : 'incorrect');

        // Apply immediate visual feedback
        if (ayahContainerRef.current) {
            // Apply class without removal timeout to ensure it's seen
            ayahContainerRef.current.classList.remove('correct-answer', 'incorrect-answer');
            ayahContainerRef.current.classList.add(isCorrectGuess ? 'correct-answer' : 'incorrect-answer');
        }

        if (isCorrectGuess) {
            // Immediate feedback
            setFeedback('Correct!');
            setScore((prev) => prev + 1);
            setShowConfetti(true);

            // Automatic next question after a delay (this delay is necessary for UX)
            setTimeout(() => {
                if (ayahContainerRef.current) {
                    ayahContainerRef.current.classList.remove('correct-answer');
                }
                setShowConfetti(false);
                fetchNewAyah(juzNumber);
            }, 1500); // Reduced from 2000ms to 1500ms for faster progression
        } else {
            // Immediate feedback
            setFeedback(`Incorrect. The correct word was "${maskedWord}".`);
            setIsShaking(true);

            // Only use a minimal delay for shake animation
            setTimeout(() => {
                setIsShaking(false);
                if (ayahContainerRef.current) {
                    ayahContainerRef.current.classList.remove('incorrect-answer');
                }
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

        // Use a safer approach for splitting text with a unique marker
        const marker = '<span id="masked-word-container" class="masked"></span>';

        try {
            const parts = ayah.text.split(marker);
            return {
                before: parts[0] || '',
                after: parts[1] || '',
            };
        } catch (error) {
            console.warn('Error splitting ayah text:', error);
            return { before: ayah.text, after: '' };
        }
    };

    const { before, after } = getAyahParts();

    // Generate random confetti particles
    const renderConfetti = () => {
        if (!showConfetti) return null;

        const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#9B5DE5', '#F15BB5', '#00BBF9', '#00F5D4'];
        const particles = Array.from({ length: 50 }, (_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: colors[Math.floor(Math.random() * colors.length)],
                animationDelay: `${Math.random() * 0.5}s`,
            };
            return <div key={i} className="confetti" style={style} />;
        });

        return <div className="confetti-container">{particles}</div>;
    };

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
                <span
                    className={`font-arabic text-2xl font-bold animate-pop-in ${
                        isCorrect ? 'text-success' : 'text-error'
                    }`}
                >
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
        <div className="max-w-4xl mx-auto p-5 font-hand">
            <h1 className="text-4xl mb-6 text-center">Juz' Quiz</h1>
            <ScoreCounter score={score} total={totalAttempts} />
            <div className="mb-6 flex items-center justify-center gap-3">
                <label htmlFor="juz" className="font-sketch text-lg">
                    Select Juz':
                </label>
                <select
                    id="juz"
                    value={juzNumber}
                    onChange={handleJuzChange}
                    className="fun-input p-2 min-w-[150px] font-hand text-base"
                >
                    {Array.from({ length: 30 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{`Juz' ${i + 1}`}</option>
                    ))}
                </select>
            </div>
            <div className="quiz-container">
                <h2 className="text-3xl mb-4 text-center">Quiz</h2>
                {loading && <p className="text-center animate-pulse-slow">Loading...</p>}
                {error && <p className="text-error text-center font-bold animate-shake">{error}</p>}
                {!loading && !error && ayah && (
                    <div className="flex flex-col gap-5">
                        <div
                            ref={ayahContainerRef}
                            className={`relative quran-text p-5 bg-white rounded-xl shadow-lg mb-5 border-3 border-navy border-dashed ${
                                isShaking ? 'animate-shake' : ''
                            }`}
                        >
                            {/* Use spans instead of direct text insertion to avoid HTML parsing issues */}
                            <span className="inline">{before}</span>
                            {renderMaskedInline()}
                            <span className="inline">{after}</span>
                            {renderConfetti()}
                        </div>
                        <div className="flex flex-col items-center gap-3 my-4">
                            <p className="text-center text-ink font-hand text-lg">
                                {answered
                                    ? isCorrect
                                        ? '✨ Correct! Moving to next question... ✨'
                                        : `✏️ Click "Next Question" to continue.`
                                    : '✍️ Type the missing word in the highlighted area.'}
                            </p>

                            {feedback && (
                                <p
                                    className={`text-center font-bold text-lg animate-pop-in ${
                                        isCorrect ? 'text-success' : 'text-error'
                                    }`}
                                >
                                    {feedback}
                                </p>
                            )}

                            <button
                                onClick={() => fetchNewAyah(juzNumber)}
                                className="btn btn-secondary hover:animate-wobble"
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
