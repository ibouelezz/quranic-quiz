import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ModeSelection from './components/ModeSelection';
import SurahQuiz from './components/SurahQuiz';
import WholeQuranQuiz from './components/WholeQuranQuiz';
import JuzQuiz from './components/JuzQuiz';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ModeSelection />} />
                <Route path="/quiz/surah" element={<SurahQuiz />} />
                <Route path="/quiz/juz" element={<JuzQuiz />} />
                <Route path="/quiz/whole" element={<WholeQuranQuiz />} />
                {/* Add more routes here as needed */}
            </Routes>
        </Router>
    );
}

export default App;
