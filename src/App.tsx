import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Quiz from './components/Quiz';
import ModeSelection from './components/ModeSelection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ModeSelection />} />
        <Route path="/quiz" element={<Quiz />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;
