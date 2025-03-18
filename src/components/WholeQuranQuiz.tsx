import React, { useState, useEffect, useRef } from 'react';
import { fetchWholeQuran } from '../apiService';
import { isSurahNameMatch, playSound } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import ScoreCounter from './ScoreCounter';

const WholeQuranQuiz: React.FC = () => {
    const [surahs, setSurahs] = useState<any[]>([]);
    const [ayah, setAyah] = useState<any>(null);
    const [userGuess, setUserGuess] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [totalAttempts, setTotalAttempts] = useState<number>(0);
    const [answered, setAnswered] = useState<boolean>(false);
    const [isShaking, setIsShaking] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const ayahContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const getRandomAyah = () => {
        const allAyahs = surahs.flatMap((surah) =>
            surah.ayahs.map((ayah: any) => ({
                ...ayah,
                surahName: surah.englishName,
                surahNameTranslation: surah.englishNameTranslation,
                name: surah.name,
                number: surah.number,
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

    // Auto-focus the input field when a new question is loaded
    useEffect(() => {
        if (ayah && !answered && inputRef.current) {
            inputRef.current.focus();
        }
    }, [ayah, answered]);

    const handleNextQuestion = () => {
        const ayahData = getRandomAyah();
        setAyah(ayahData);
        setUserGuess('');
        setFeedback('');
        setAnswered(false);
        setIsCorrect(false);
        setIsShaking(false);
        setShowConfetti(false);
    };

    const handleGuessSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!userGuess.trim()) {
            setFeedback('Please enter a surah name.');
            return;
        }

        if (answered) {
            return;
        }

        // Immediately set answered state
        setAnswered(true);
        setTotalAttempts((prev) => prev + 1);

        if (ayah) {
            const possibleNames = [
                ayah.surahName, // English name
                ayah.surahNameTranslation, // English translation
                ayah.name, // Arabic name
                `Surah ${ayah.surahName}`,
                `Surat ${ayah.surahName}`,
                `سورة ${ayah.name}`,
                ayah.number.toString(), // Surah number
                `${ayah.number}`, // Surah number as string
            ];

            const isCorrectGuess = isSurahNameMatch(userGuess, possibleNames);
            setIsCorrect(isCorrectGuess);

            // Play sound immediately - before any UI updates
            playSound(isCorrectGuess ? 'correct' : 'incorrect');

            // Immediate visual feedback
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

                // Shorter delay for better UX
                setTimeout(() => {
                    if (ayahContainerRef.current) {
                        ayahContainerRef.current.classList.remove('correct-answer');
                    }
                    setShowConfetti(false);
                    handleNextQuestion();
                }, 1500); // Reduced from 2000ms
            } else {
                // Immediate feedback
                setFeedback(`Incorrect. The correct answer is ${ayah.surahName} (${ayah.name}).`);
                setIsShaking(true);

                // Minimal delay for animation
                setTimeout(() => {
                    setIsShaking(false);
                    if (ayahContainerRef.current) {
                        ayahContainerRef.current.classList.remove('incorrect-answer');
                    }
                }, 500);
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleGuessSubmit(event as unknown as React.FormEvent);
        }
    };

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

    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto p-5 font-hand">
            <h1 className="text-4xl mb-6 text-center">Whole Quran Quiz</h1>
            <ScoreCounter score={score} total={totalAttempts} />
            <div className="quiz-container">
                <h2 className="text-3xl mb-4 text-center">Quiz</h2>
                {loading && <p className="text-center animate-pulse-slow">Loading...</p>}
                {error && <p className="text-error text-center font-bold animate-shake">{error}</p>}
                {!loading && !error && ayah && (
                    <div className="flex flex-col gap-5">
                        <div
                            ref={ayahContainerRef}
                            className={`relative quran-text p-5 bg-white rounded-xl shadow-lg mb-5 border-3 border-accent border-dashed ${
                                isShaking ? 'animate-shake' : ''
                            }`}
                        >
                            <span className="inline">{ayah.text}</span>
                            {renderConfetti()}
                        </div>
                        <form onSubmit={handleGuessSubmit} className="animate-pop-in">
                            <p className="text-center mb-4 font-sketch text-lg">What is the name of the surah?</p>
                            <div className="flex flex-wrap gap-3 justify-center my-4 md:flex-row flex-col">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userGuess}
                                    onChange={(e) => setUserGuess(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter surah name"
                                    className="fun-input text-lg flex-grow max-w-xs md:max-w-full md:mb-0 mb-3"
                                    disabled={answered}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary hover:animate-wobble"
                                    disabled={answered}
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextQuestion}
                                    className="btn btn-secondary hover:animate-wobble"
                                >
                                    Next Question
                                </button>
                            </div>
                        </form>
                        {feedback && (
                            <p
                                className={`text-center font-bold text-lg animate-pop-in ${
                                    isCorrect ? 'text-success' : 'text-error'
                                }`}
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

export default WholeQuranQuiz;
