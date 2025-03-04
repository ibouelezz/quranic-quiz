import React, { useState, useEffect } from 'react';
import { fetchWholeQuran } from '../apiService';
import { isSurahNameMatch } from '../utils/helpers';
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

    const handleNextQuestion = () => {
        const ayahData = getRandomAyah();
        setAyah(ayahData);
        setUserGuess('');
        setFeedback('');
        setAnswered(false);
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

            if (isSurahNameMatch(userGuess, possibleNames)) {
                setFeedback('Correct!');
                setScore((prev) => prev + 1);
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

    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto p-5 font-sans">
            <h1 className="text-3xl font-bold text-dark mb-6 text-center">Whole Quran Quiz</h1>
            <ScoreCounter score={score} total={totalAttempts} />
            <div className="bg-background p-6 rounded-xl shadow-card">
                <h2 className="text-2xl font-bold text-primary mb-4 text-center">Quiz</h2>
                {loading && <p className="text-center">Loading...</p>}
                {error && <p className="text-error text-center font-bold">{error}</p>}
                {!loading && !error && ayah && (
                    <div className="flex flex-col gap-5">
                        <p className="font-arabic text-2xl leading-relaxed text-right rtl p-5 bg-white rounded-lg shadow mb-5">
                            {ayah.text}
                        </p>
                        <form onSubmit={handleGuessSubmit}>
                            <p className="text-center mb-4">What is the name of the surah?</p>
                            <div className="flex flex-wrap gap-3 justify-center my-4 md:flex-row flex-col">
                                <input
                                    type="text"
                                    value={userGuess}
                                    onChange={(e) => setUserGuess(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter surah name"
                                    className="font-arabic p-3 rounded border border-gray-300 text-lg flex-grow max-w-xs md:max-w-full md:mb-0 mb-3"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary text-white py-3 px-6 rounded-full font-bold shadow-button transition-all hover:bg-blue-600 hover:shadow-button-hover hover:-translate-y-0.5 md:w-auto w-full md:mb-0 mb-3"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextQuestion}
                                    className="bg-secondary text-white py-3 px-6 rounded-full font-bold shadow transition-all hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 md:w-auto w-full"
                                >
                                    Next Question
                                </button>
                            </div>
                        </form>
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

export default WholeQuranQuiz;
