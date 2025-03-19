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

    // Simplify the useEffect hook
    useEffect(() => {
        // Initialize audio - much simpler now, just creates the cache entries
        preloadAudioFiles();

        // Add a class to the document body for better styling
        document.body.classList.add('game-mode');

        // Clean up function to remove class when component unmounts
        return () => {
            document.body.classList.remove('game-mode');
        };
    }, []);

    return (
        <div className="min-h-screen">
            {!isHomePage && <NavBar />}
            <Routes>
                <Route path="/" element={<ModeSelection />} />
                <Route path="/quiz/surah" element={<SurahQuiz />} />
                <Route path="/quiz/juz" element={<JuzQuiz />} />
                <Route path="/quiz/whole" element={<WholeQuranQuiz />} />
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
