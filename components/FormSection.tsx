import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  number: string;
  children: ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, number, children }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all hover:shadow-md">
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold text-sm">
          {number}
        </span>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  );
};