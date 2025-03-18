import React, { useState, useEffect, useRef } from 'react';
import { fetchSurah, fetchSurahs } from '../apiService';
import { maskWordInAyah, isWordMatch, playSound } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import ScoreCounter from './ScoreCounter';

const SurahQuiz: React.FC = () => {
    // State management
    const [surahs, setSurahs] = useState<any[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<string>('');
    const [ayah, setAyah] = useState<any>(null);
    const [maskedWord, setMaskedWord] = useState<string>('');
    const [maskedWordLength, setMaskedWordLength] = useState<number>(0);
    const [userInput, setUserInput] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [totalAttempts, setTotalAttempts] = useState<number>(0);
    const [answered, setAnswered] = useState<boolean>(false);
    const [isShaking, setIsShaking] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showConfetti, setShowConfetti] = useState<boolean>(false);

    // Refs
    const ayahContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Load surahs on component mount
    useEffect(() => {
        const loadSurahs = async () => {
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

    // Auto-submit when input length matches masked word length
    useEffect(() => {
        if (userInput.length === maskedWordLength && !answered) {
            // Small delay to allow the user to see what they typed
            setTimeout(() => checkAnswer(), 200);
        }
    }, [userInput, maskedWordLength, answered]);

    // Handle surah selection change
    const handleSurahChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const surahNumber = event.target.value;
        setSelectedSurah(surahNumber);
        await fetchNewAyah(surahNumber);
    };

    // Fetch a new ayah for the quiz
    const fetchNewAyah = async (surahNumber: string) => {
        if (!surahNumber) return;

        setLoading(true);
        setError('');
        setAnswered(false);
        setUserInput('');
        setIsCorrect(false);
        setIsShaking(false);
        setFeedback('');
        setShowConfetti(false);

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
            const { maskedText, maskedWord, maskedWordLength } = maskWordInAyah(selectedAyah.text);

            setAyah({ ...selectedAyah, text: maskedText });
            setMaskedWord(maskedWord);
            setMaskedWordLength(maskedWordLength);
        } catch (error) {
            console.error('Error fetching surah:', error);
            setError('Failed to fetch ayahs. Please try again.');
            setAyah(null);
        } finally {
            setLoading(false);
        }
    };

    // Check the user's answer
    const checkAnswer = () => {
        if (answered || !userInput) return;

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
                fetchNewAyah(selectedSurah);
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

    // Handle key press events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !answered) {
            checkAnswer();
        }
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

    return (
        <div className="max-w-4xl mx-auto p-5 font-hand">
            <h1 className="text-4xl mb-6 text-center">Surah Quiz</h1>
            <ScoreCounter score={score} total={totalAttempts} />

            <div className="mb-6 flex items-center justify-center gap-3">
                <label htmlFor="surah" className="font-sketch text-lg">
                    Select Surah:
                </label>
                <select
                    id="surah"
                    value={selectedSurah}
                    onChange={handleSurahChange}
                    className="fun-input p-2 min-w-[150px] font-hand text-base"
                    disabled={loading}
                >
                    {surahs.map((surah) => (
                        <option key={`surah-${surah.number}`} value={surah.number}>
                            {surah.name}
                        </option>
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
                            className={`relative quran-text p-5 bg-white rounded-xl shadow-lg mb-5 border-3 border-purple border-dashed ${
                                isShaking ? 'animate-shake' : ''
                            }`}
                        >
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
                                onClick={() => fetchNewAyah(selectedSurah)}
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

export default SurahQuiz;
