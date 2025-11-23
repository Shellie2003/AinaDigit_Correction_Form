import React from 'react';
import { FileText, PenTool, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="relative text-center mb-10 pt-4">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute right-0 top-0 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="inline-flex items-center justify-center p-3 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-4 ring-1 ring-primary-100 dark:ring-primary-800">
        <PenTool className="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        Demande de Correction
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg">
        Service proposé par <span className="text-primary-600 dark:text-primary-400 font-bold">AinaDigit</span>
      </p>
    </header>
  );
};