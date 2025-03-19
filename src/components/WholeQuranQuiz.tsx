import React, { useState, useEffect, useRef } from 'react';
import { fetchWholeQuran } from '../apiService';
import { isSurahNameMatch, playSound } from '../utils/helpers';
import ScoreCounter from './ScoreCounter';

const WholeQuranQuiz: React.FC = () => {
    const [surahs, setSurahs] = useState<any[]>([]);
    const [ayah, setAyah] = useState<any>(null);
    const [userGuess, setUserGuess] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [motivationalMessage, setMotivationalMessage] = useState<string>('');
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

    // Motivational messages for correct answers
    const correctMessages = ['ما شاء الله!', 'أحسنت!', 'ممتاز!', 'بارك الله فيك!', 'رائع جداً!'];

    // Encouraging messages for incorrect answers
    const incorrectMessages = [
        'حاول مرة أخرى!',
        'لا تستسلم!',
        'استمر في المحاولة!',
        'أنت تتحسن!',
        'ستنجح في المرة القادمة!',
    ];

    // Get a random motivational message
    const getRandomMessage = (isCorrect: boolean) => {
        const messages = isCorrect ? correctMessages : incorrectMessages;
        return messages[Math.floor(Math.random() * messages.length)];
    };

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
            setTimeout(() => inputRef.current?.focus(), 100);
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

            // Check correctness first
            const isCorrectGuess = isSurahNameMatch(userGuess, possibleNames);

            // Play sound immediately - before any state updates that might cause delays
            playSound(isCorrectGuess ? 'correct' : 'incorrect');

            // Now update state after sound is triggered
            setAnswered(true);
            setTotalAttempts((prev) => prev + 1);
            setIsCorrect(isCorrectGuess);

            // Set a motivational message
            setMotivationalMessage(getRandomMessage(isCorrectGuess));

            // Immediate visual feedback
            if (ayahContainerRef.current) {
                // Apply class without removal timeout to ensure it's seen
                ayahContainerRef.current.classList.remove('correct-answer', 'incorrect-answer');
                ayahContainerRef.current.classList.add(isCorrectGuess ? 'correct-answer' : 'incorrect-answer');
            }

            if (isCorrectGuess) {
                // Immediate feedback with surah number
                setFeedback(`صحيح! سورة ${ayah.name} (${ayah.number})`);
                setScore((prev) => prev + 1);
                setShowConfetti(true);

                // Automatic next question after a short delay
                setTimeout(() => {
                    if (ayahContainerRef.current) {
                        ayahContainerRef.current.classList.remove('correct-answer');
                    }
                    setShowConfetti(false);
                    handleNextQuestion();
                }, 1800); // Slightly longer delay to read the message
            } else {
                // Immediate feedback with surah number
                setFeedback(`${ayah.surahName} (${ayah.name}) - سورة رقم ${ayah.number}`);
                setIsShaking(true);

                // Only use a minimal delay for shake animation
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

        const colors = ['#F9A826', '#39B9D2', '#7854F4', '#4CAF50', '#E53935'];
        const particles = Array.from({ length: 50 }, (_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: colors[Math.floor(Math.random() * colors.length)],
                animationDelay: `${Math.random() * 0.3}s`,
                transform: `rotate(${Math.random() * 180}deg)`,
            };
            return <div key={i} className="confetti" style={style} />;
        });

        return <div className="confetti-container">{particles}</div>;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 font-hand">
            <ScoreCounter score={score} total={totalAttempts} />

            <div className="quiz-container">
                {loading && <p className="text-center animate-pulse-slow py-12">Loading...</p>}
                {error && <p className="text-error text-center font-bold animate-shake">{error}</p>}

                {!loading && !error && ayah && (
                    <div className="flex flex-col gap-5">
                        <div
                            ref={ayahContainerRef}
                            className={`relative quran-text ${isShaking ? 'animate-shake' : ''}`}
                        >
                            <span className="inline">{ayah.text}</span>
                            {renderConfetti()}
                        </div>

                        <form onSubmit={handleGuessSubmit} className="animate-pop-in">
                            <p className="text-center mb-3 font-arabic text-lg text-primary font-bold rtl">
                                ما اسم السورة؟
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center my-3 md:flex-row flex-col">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userGuess}
                                    onChange={(e) => setUserGuess(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter surah name / أدخل اسم السورة"
                                    className="fun-input text-lg flex-grow max-w-xs md:max-w-full md:mb-0 mb-3"
                                    disabled={answered}
                                />

                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary btn-arabic" disabled={answered}>
                                        <span className="arabic">إرسال</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextQuestion}
                                        className="btn btn-secondary btn-arabic"
                                    >
                                        <span className="arabic">سؤال جديد</span>
                                    </button>
                                </div>
                            </div>
                        </form>

                        {feedback && (
                            <div className="feedback-message">
                                <p className={isCorrect ? 'feedback-correct arabic' : 'feedback-incorrect arabic'}>
                                    {feedback}
                                </p>
                                {motivationalMessage && <p className="motivational-message">{motivationalMessage}</p>}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <p className="text-xs opacity-60 font-hand ltr">Ayah {ayah.numberInSurah}</p>
                            <p className="text-xs opacity-60 font-arabic rtl">
                                {ayah.number ? `سورة رقم ${ayah.number}` : ''}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholeQuranQuiz;
