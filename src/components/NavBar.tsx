import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="bg-white/90 flex justify-between items-center mb-4 md:flex-row flex-col md:gap-0 gap-2 px-5 py-3 border-b border-primary/20">
            <Link to="/" className="text-2xl font-hand text-primary no-underline flex items-center gap-2 font-bold">
                <span>📚</span> Quranic Quiz <span className="font-arabic mr-1">اختبار قرآني</span>
            </Link>
            <div className="flex gap-4 md:w-auto w-full md:justify-start justify-center">
                <Link
                    to="/quiz/surah"
                    className={`font-hand text-lg no-underline rounded-full px-3 py-1 transition-colors flex items-center gap-1 ${
                        currentPath === '/quiz/surah'
                            ? 'bg-primary text-white shadow-sm'
                            : 'hover:bg-primary/10 text-ink hover:text-primary'
                    }`}
                >
                    <span className="ltr">Surah</span>
                    <span className="font-arabic rtl text-sm">سورة</span>
                </Link>
                <Link
                    to="/quiz/juz"
                    className={`font-hand text-lg no-underline rounded-full px-3 py-1 transition-colors flex items-center gap-1 ${
                        currentPath === '/quiz/juz'
                            ? 'bg-primary text-white shadow-sm'
                            : 'hover:bg-primary/10 text-ink hover:text-primary'
                    }`}
                >
                    <span className="ltr">Juz</span>
                    <span className="font-arabic rtl text-sm">جزء</span>
                </Link>
                <Link
                    to="/quiz/whole"
                    className={`font-hand text-lg no-underline rounded-full px-3 py-1 transition-colors flex items-center gap-1 ${
                        currentPath === '/quiz/whole'
                            ? 'bg-primary text-white shadow-sm'
                            : 'hover:bg-primary/10 text-ink hover:text-primary'
                    }`}
                >
                    <span className="ltr">Whole</span>
                    <span className="font-arabic rtl text-sm">كامل</span>
                </Link>
            </div>
        </nav>
    );
};

export default NavBar;
