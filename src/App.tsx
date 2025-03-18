import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ModeSelection from './components/ModeSelection';
import SurahQuiz from './components/SurahQuiz';
import WholeQuranQuiz from './components/WholeQuranQuiz';
import JuzQuiz from './components/JuzQuiz';
import NavBar from './components/NavBar';
import FloatingNav from './components/FloatingNav';
import { preloadAudioFiles } from './utils/helpers';

// Wrapper component to conditionally show NavBar
const AppContent: React.FC = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    // Preload audio files when the app starts
    useEffect(() => {
        preloadAudioFiles();
    }, []);

    // Function to unlock audio on first user interaction
    const unlockAudio = () => {
        // Create and play a silent audio to unlock audio
        const silentAudio = new Audio(
            'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA='
        );
        silentAudio.volume = 0.01;
        silentAudio.play().catch(() => {});

        // Remove the handler after first click
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    // Add event listeners to unlock audio on first interaction
    useEffect(() => {
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    return (
        <div className="min-h-screen bg-light">
            {!isHomePage && <NavBar />}
            <Routes>
                <Route path="/" element={<ModeSelection />} />
                <Route path="/quiz/surah" element={<SurahQuiz />} />
                <Route path="/quiz/juz" element={<JuzQuiz />} />
                <Route path="/quiz/whole" element={<WholeQuranQuiz />} />
                {/* Add more routes here as needed */}
            </Routes>
            <FloatingNav />
        </div>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
