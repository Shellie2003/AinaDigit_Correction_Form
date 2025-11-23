import React, { ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

// --- Text Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', error, ...props }) => (
  <div className="mb-5">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all placeholder:text-slate-400 ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

// --- Text Area ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => (
  <div className="mb-5">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <textarea
      className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all min-h-[120px] resize-y placeholder:text-slate-400 ${className}`}
      {...props}
    />
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="mb-5">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all appearance-none ${className}`}
        {...props}
      >
        <option value="">Sélectionnez une option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// --- Checkbox ---
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => (
  <label className="flex items-start space-x-3 mb-3 cursor-pointer group">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-500 rounded bg-white dark:bg-slate-800 peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all peer-focus:ring-2 peer-focus:ring-primary-200 dark:peer-focus:ring-primary-900"></div>
      <svg
        className="w-3.5 h-3.5 text-white absolute left-0.5 top-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors select-none text-sm pt-0.5">
      {label}
    </span>
  </label>
);

// --- File Upload ---
interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  label: string;
  accept?: string;
  helperText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onChange, 
  maxFiles = 5, 
  label, 
  accept, 
  helperText 
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Basic extension/type validation
      let validFiles = selectedFiles;
      if (accept) {
        validFiles = selectedFiles.filter(file => {
          const fileType = file.type;
          const extension = '.' + file.name.split('.').pop()?.toLowerCase();
          const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
          
          return acceptedTypes.some(type => {
             if (type.startsWith('.')) return extension === type;
             if (type.endsWith('/*')) {
                 const baseType = type.replace('/*', '');
                 return fileType.startsWith(baseType);
             }
             return fileType === type;
          });
        });
        
        if (validFiles.length !== selectedFiles.length) {
          alert(`Certains fichiers n'ont pas le format requis (${accept})`);
        }
      }

      const combinedFiles = [...files, ...validFiles].slice(0, maxFiles);
      onChange(combinedFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary-400 dark:hover:border-primary-500 transition-all cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/20">
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={files.length >= maxFiles}
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
            <Upload size={24} />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-primary-600 dark:text-primary-400">Cliquez pour ajouter</span> ou glissez vos fichiers
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{helperText || `Max ${maxFiles} fichiers`}</p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, idx) => (
            <li key={`${file.name}-${idx}`} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{file.name.split('.').pop()?.toUpperCase()}</span>
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};