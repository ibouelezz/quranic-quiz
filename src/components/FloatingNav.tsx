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
        <div className="fixed bottom-6 right-6 z-50">
            <div
                className={`absolute bottom-[70px] right-0 flex flex-col gap-4 transition-all duration-300 ${
                    isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-10'
                }`}
            >
                <div
                    className="w-12 h-12 rounded-full bg-white shadow-md text-primary flex items-center justify-center text-xl cursor-pointer transition-transform hover:scale-110"
                    onClick={() => navigateTo('/')}
                >
                    <span>🏠</span>
                </div>
                {currentPath !== '/quiz/surah' && (
                    <div
                        className="w-12 h-12 rounded-full bg-white shadow-md text-primary flex items-center justify-center text-xl cursor-pointer transition-transform hover:scale-110"
                        onClick={() => navigateTo('/quiz/surah')}
                    >
                        <span>📖</span>
                    </div>
                )}
                {currentPath !== '/quiz/juz' && (
                    <div
                        className="w-12 h-12 rounded-full bg-white shadow-md text-primary flex items-center justify-center text-xl cursor-pointer transition-transform hover:scale-110"
                        onClick={() => navigateTo('/quiz/juz')}
                    >
                        <span>📚</span>
                    </div>
                )}
                {currentPath !== '/quiz/whole' && (
                    <div
                        className="w-12 h-12 rounded-full bg-white shadow-md text-primary flex items-center justify-center text-xl cursor-pointer transition-transform hover:scale-110"
                        onClick={() => navigateTo('/quiz/whole')}
                    >
                        <span>🕋</span>
                    </div>
                )}
            </div>
            <div
                className={`w-14 h-14 rounded-full font-hand text-white flex items-center justify-center text-2xl cursor-pointer transform shadow-md transition-all duration-300 ${
                    isOpen ? 'bg-error rotate-45 scale-110' : 'bg-primary hover:scale-105'
                }`}
                onClick={toggleMenu}
            >
                {isOpen ? '+' : '≡'}
            </div>
        </div>
    );
};

export default FloatingNav;
