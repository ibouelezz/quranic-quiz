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
    const [motivationalMessage, setMotivationalMessage] = useState<string>('');
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
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

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
            // Smaller delay for more immediate feedback
            setTimeout(() => handleSubmit(), 100);
        }
    }, [userInput, maskedWordLength, answered]);

    // Auto-focus on input when ayah changes
    useEffect(() => {
        if (inputRef.current && !answered && ayah) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [ayah, answered]);

    const handleSurahChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const surahNumber = event.target.value;
        setSelectedSurah(surahNumber);
        await fetchNewAyah(surahNumber);
    };

    const fetchNewAyah = async (surahNumber: string) => {
        setLoading(true);
        setError('');
        setAnswered(false);
        setUserInput('');
        setIsCorrect(false);
        setIsShaking(false);
        setShowConfetti(false);
        setFeedback('');
        setMotivationalMessage('');

        try {
            const surah = await fetchSurah(surahNumber).then((data) => data[0]);
            const ayahs = surah.ayahs || [];

            if (ayahs.length < 2) {
                setError('This surah has too few ayahs for a quiz.');
                setAyah(null);
                return;
            }

            // Choose a random ayah, excluding very short ones
            const filteredAyahs = ayahs.filter((a: any) => a.text.split(' ').length > 3);
            const randomIndex = Math.floor(Math.random() * (filteredAyahs.length || 1));
            const selectedAyah = filteredAyahs[randomIndex] || ayahs[1]; // Fallback to second ayah if filter results in empty

            const { maskedText, maskedWord, maskedWordLength } = maskWordInAyah(selectedAyah.text);
            setAyah({ ...selectedAyah, text: maskedText, surahName: surah.name, surahNumber: surah.number });
            setMaskedWord(maskedWord);
            setMaskedWordLength(maskedWordLength);
        } catch (error) {
            console.error('Error fetching surah:', error);
            setError('Failed to fetch ayah. Please try again.');
            setAyah(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!userInput.trim() || answered) {
            return;
        }

        // Check correctness first
        const isCorrectGuess = isWordMatch(userInput, maskedWord);

        // Play sound immediately - before any state updates that might cause delays
        playSound(isCorrectGuess ? 'correct' : 'incorrect');

        // Now update state after sound is triggered
        setAnswered(true);
        setTotalAttempts((prev) => prev + 1);
        setIsCorrect(isCorrectGuess);

        // Set a motivational message
        setMotivationalMessage(getRandomMessage(isCorrectGuess));

        // Apply immediate visual feedback
        if (ayahContainerRef.current) {
            ayahContainerRef.current.classList.remove('correct-answer', 'incorrect-answer');
            ayahContainerRef.current.classList.add(isCorrectGuess ? 'correct-answer' : 'incorrect-answer');
        }

        if (isCorrectGuess) {
            // Immediate feedback
            setFeedback(`صحيح! "${maskedWord}"`);
            setScore((prev) => prev + 1);
            setShowConfetti(true);

            // Automatic next question after a short delay
            setTimeout(() => {
                if (ayahContainerRef.current) {
                    ayahContainerRef.current.classList.remove('correct-answer');
                }
                setShowConfetti(false);
                fetchNewAyah(selectedSurah);
            }, 1800); // Slightly longer delay to read the message
        } else {
            // Immediate feedback - show correct word
            setFeedback(`الكلمة الصحيحة: "${maskedWord}"`);
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

    // Split ayah text for rendering
    const getAyahParts = () => {
        if (!ayah) return { before: '', after: '' };

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

        const colors = ['#F9A826', '#39B9D2', '#7854F4', '#4CAF50', '#E53935'];
        const particles = Array.from({ length: 50 }, (_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: colors[Math.floor(Math.random() * colors.length)],
                animationDelay: `${Math.random() * 0.3}s`,
            };
            return <div key={i} className="confetti" style={style} />;
        });

        return <div className="confetti-container">{particles}</div>;
    };

    // Inline rendering of masked word
    const renderMaskedInline = () => {
        // Calculate exact width based on the masked word length
        const inputStyle = {
            width: `${maskedWordLength * 1.2}ch`,
            minWidth: '60px',
            direction: 'rtl' as 'rtl',
        };

        if (!answered) {
            return (
                <div className="inline-flex relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="font-arabic text-2xl md:text-3xl bg-transparent text-primary font-bold text-right outline-none"
                        style={inputStyle}
                        placeholder={''.padEnd(maskedWordLength, '_')}
                        maxLength={maskedWordLength}
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                    {userInput.length < maskedWordLength && (
                        <span
                            className="animate-blink absolute right-0 bottom-0 h-[1.2em] w-[2px] bg-primary"
                            style={{ transform: `translateX(${userInput.length * 1.2}ch)` }}
                        />
                    )}
                </div>
            );
        } else {
            return (
                <span
                    className={`font-arabic text-2xl md:text-3xl font-bold inline-block animate-pop-in ${
                        isCorrect ? 'text-success' : 'text-error'
                    }`}
                >
                    {maskedWord}
                </span>
            );
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 font-hand">
            <ScoreCounter score={score} total={totalAttempts} />

            <div className="mb-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                <select
                    value={selectedSurah}
                    onChange={handleSurahChange}
                    className="fun-input p-2 min-w-[200px] font-hand text-base"
                    disabled={loading}
                >
                    {surahs.map((surah) => (
                        <option key={surah.number} value={surah.number} className="ltr">
                            {surah.number}. {surah.englishName} ({surah.name})
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => fetchNewAyah(selectedSurah)}
                    className="btn btn-primary sm:ml-2 btn-arabic"
                    disabled={loading}
                >
                    <span className="arabic">سؤال جديد</span>
                </button>
            </div>

            <div className="quiz-container">
                {loading && <p className="text-center animate-pulse-slow py-12">Loading...</p>}
                {error && <p className="text-error text-center font-bold animate-shake">{error}</p>}

                {!loading && !error && ayah && (
                    <div className="flex flex-col gap-5">
                        <div
                            ref={ayahContainerRef}
                            className={`relative quran-text ${isShaking ? 'animate-shake' : ''}`}
                        >
                            <span className="inline">{before}</span>
                            {renderMaskedInline()}
                            <span className="inline">{after}</span>
                            {renderConfetti()}
                        </div>

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
                                سورة {ayah.surahName} ({ayah.surahNumber})
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurahQuiz;
