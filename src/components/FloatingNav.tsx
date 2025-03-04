import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingNav: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const navigateTo = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    // Don't show on home page
    if (currentPath === '/') {
        return null;
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div
                className={`absolute bottom-[70px] right-0 flex flex-col gap-3 transition-all ${
                    isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-5'
                }`}
            >
                <div
                    className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl shadow cursor-pointer transition-all hover:scale-110 hover:shadow-lg relative"
                    onClick={() => navigateTo('/')}
                >
                    <span>🏠</span>
                    <div className="absolute right-[60px] bg-gray-800 text-white py-1 px-3 rounded text-sm whitespace-nowrap opacity-0 invisible transition-all group-hover:opacity-100 group-hover:visible">
                        Home
                    </div>
                </div>
                {currentPath !== '/quiz/surah' && (
                    <div
                        className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl shadow cursor-pointer transition-all hover:scale-110 hover:shadow-lg relative group"
                        onClick={() => navigateTo('/quiz/surah')}
                    >
                        <span>📖</span>
                        <div className="absolute right-[60px] bg-gray-800 text-white py-1 px-3 rounded text-sm whitespace-nowrap opacity-0 invisible transition-all group-hover:opacity-100 group-hover:visible">
                            Surah Quiz
                        </div>
                    </div>
                )}
                {currentPath !== '/quiz/juz' && (
                    <div
                        className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl shadow cursor-pointer transition-all hover:scale-110 hover:shadow-lg relative group"
                        onClick={() => navigateTo('/quiz/juz')}
                    >
                        <span>📚</span>
                        <div className="absolute right-[60px] bg-gray-800 text-white py-1 px-3 rounded text-sm whitespace-nowrap opacity-0 invisible transition-all group-hover:opacity-100 group-hover:visible">
                            Juz Quiz
                        </div>
                    </div>
                )}
                {currentPath !== '/quiz/whole' && (
                    <div
                        className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl shadow cursor-pointer transition-all hover:scale-110 hover:shadow-lg relative group"
                        onClick={() => navigateTo('/quiz/whole')}
                    >
                        <span>🕋</span>
                        <div className="absolute right-[60px] bg-gray-800 text-white py-1 px-3 rounded text-sm whitespace-nowrap opacity-0 invisible transition-all group-hover:opacity-100 group-hover:visible">
                            Whole Quran
                        </div>
                    </div>
                )}
            </div>
            <div
                className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl shadow-lg cursor-pointer transition-all hover:scale-110 hover:shadow-xl"
                onClick={toggleMenu}
            >
                {isOpen ? '✕' : '≡'}
            </div>
        </div>
    );
};

export default FloatingNav;
