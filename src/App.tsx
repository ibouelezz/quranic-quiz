import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ModeSelection from './components/ModeSelection';
import SurahQuiz from './components/SurahQuiz';
import WholeQuranQuiz from './components/WholeQuranQuiz';
import JuzQuiz from './components/JuzQuiz';
import NavBar from './components/NavBar';
import FloatingNav from './components/FloatingNav';

// Wrapper component to conditionally show NavBar
const AppContent: React.FC = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

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
