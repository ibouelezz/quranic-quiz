import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Quiz from './components/Quiz';
import ModeSelection from './components/ModeSelection';
import SurahQuiz from './components/SurahQuiz';
import WholeQuranQuiz from './components/WholeQuranQuiz';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ModeSelection />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/surah" element={<SurahQuiz />} />
        <Route path="/quiz/whole" element={<WholeQuranQuiz />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;
