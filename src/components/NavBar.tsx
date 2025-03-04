import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="bg-white shadow p-3 flex justify-between items-center mb-5 md:flex-row flex-col md:gap-0 gap-3">
            <Link to="/" className="text-xl font-bold text-primary no-underline flex items-center gap-3">
                <span>📚</span> Quranic Quiz
            </Link>
            <div className="flex gap-5 md:w-auto w-full md:justify-start justify-center">
                <Link
                    to="/quiz/surah"
                    className={`text-dark no-underline p-2 rounded transition-colors hover:bg-gray-100 ${
                        currentPath === '/quiz/surah' ? 'text-primary font-bold' : ''
                    }`}
                >
                    Surah Quiz
                </Link>
                <Link
                    to="/quiz/juz"
                    className={`text-dark no-underline p-2 rounded transition-colors hover:bg-gray-100 ${
                        currentPath === '/quiz/juz' ? 'text-primary font-bold' : ''
                    }`}
                >
                    Juz Quiz
                </Link>
                <Link
                    to="/quiz/whole"
                    className={`text-dark no-underline p-2 rounded transition-colors hover:bg-gray-100 ${
                        currentPath === '/quiz/whole' ? 'text-primary font-bold' : ''
                    }`}
                >
                    Whole Quran
                </Link>
            </div>
        </nav>
    );
};

export default NavBar;
