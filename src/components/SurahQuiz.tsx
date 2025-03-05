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

    useEffect(() => {
        if (userInput.length <= maskedWordLength) {
            // Auto-check answer if the input length matches the masked word length
            if (userInput.length === maskedWordLength && !answered) {
                setTimeout(() => checkAnswer(), 300);
            }
        }
    }, [userInput]);

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
                fetchNewAyah(selectedSurah);
            }, 1000);
        } else {
            setFeedback(`Incorrect. The correct word was "${maskedWord}".`);
            setIsShaking(true);

            setTimeout(() => {
                setIsShaking(false);
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
        const parts = ayah.text.split('<span id="masked-word-container" class="masked"></span>');
        return { before: parts[0], after: parts[1] || '' };
    };

    const { before, after } = getAyahParts();

    // Inline rendering of masked word
    const renderMaskedInline = () => {
        if (!answered) {
            return (
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`font-arabic text-2xl bg-transparent text-primary font-bold text-right placeholder:text-2xl outline-none`}
                    style={{ width: `${maskedWordLength * 1}ch` }}
                    placeholder={''.padEnd(maskedWordLength, '_')}
                    // maxLength={maskedWordLength}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    autoFocus
                />
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

    return (
        <div className="max-w-4xl mx-auto p-5 font-sans">
            <h1 className="text-3xl font-bold text-dark mb-6 text-center">Surah Quiz</h1>
            <ScoreCounter score={score} total={totalAttempts} />

            <div className="mb-6 flex items-center justify-center gap-3">
                <label htmlFor="surah">Select Surah:</label>
                <select
                    id="surah"
                    value={selectedSurah}
                    onChange={handleSurahChange}
                    className="p-2 rounded border border-gray-300 text-base min-w-[150px]"
                    disabled={loading}
                >
                    {surahs.map((surah) => (
                        <option key={surah.name} value={surah.number}>
                            {surah.name}
                        </option>
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
                                onClick={() => fetchNewAyah(selectedSurah)}
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

export default SurahQuiz;
