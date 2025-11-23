import React, { useState, useEffect } from 'react';
import { CheckCircle, Send, AlertCircle, AlertTriangle } from 'lucide-react';
import { Header } from './components/Header';
import { FormSection } from './components/FormSection';
import { Input, TextArea, Select, Checkbox, FileUpload } from './components/ui/FormInputs';
import { CorrectionRequestData, INITIAL_DATA, ERROR_TYPE_OPTIONS } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [formData, setFormData] = useState<CorrectionRequestData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Apply Theme to Document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleChange = (field: keyof CorrectionRequestData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (errorType: string) => {
    setFormData((prev) => {
      const currentTypes = prev.errorTypes;
      if (currentTypes.includes(errorType)) {
        return { ...prev, errorTypes: currentTypes.filter((t) => t !== errorType) };
      } else {
        return { ...prev, errorTypes: [...currentTypes, errorType] };
      }
    });
  };

  // Helper function to upload files
  const uploadFiles = async (files: File[], folderId: string, type: 'documents' | 'photos') => {
    if (files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      // Clean filename to avoid issues
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folderId}/${type}/${Date.now()}_${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('correction_uploads')
        .upload(filePath, file);

      if (error) {
        console.error(`Error uploading ${file.name}:`, error);
        
        // Handle specific "Bucket not found" error to help debugging
        if (error.message && error.message.includes('Bucket not found')) {
            throw new Error(`Erreur critique: Le dossier de stockage (Bucket) n'existe pas. Veuillez exécuter le script SQL 'supabase_storage.sql'.`);
        }
        
        throw new Error(`Échec du téléchargement de ${file.name}: ${error.message}`);
      }

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('correction_uploads')
        .getPublicUrl(filePath);

      return {
        name: file.name,
        size: file.size,
        type: file.type,
        path: data.path,
        url: publicUrlData.publicUrl
      };
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Generate a unique ID for this submission folder
      const submissionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

      // 2. Upload Files to Supabase Storage
      let documentMetadata: any[] = [];
      let photoMetadata: any[] = [];

      // Try uploading if files exist.
      if (formData.documents.length > 0) {
          documentMetadata = await uploadFiles(formData.documents, submissionId, 'documents');
      }
      if (formData.files.length > 0) {
          photoMetadata = await uploadFiles(formData.files, submissionId, 'photos');
      }

      // 3. Insert Data into Supabase Table
      const { error: insertError } = await supabase
        .from('correction_requests')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          doc_title: formData.docTitle,
          total_pages: formData.totalPages === '' ? null : Number(formData.totalPages),
          language: formData.language,
          specific_pages: formData.specificPages,
          error_types: formData.errorTypes,
          add_paragraphs: formData.addParagraphs,
          paragraph_count: formData.paragraphCount,
          comments: formData.comments,
          documents_metadata: documentMetadata, // Save metadata JSON
          photos_metadata: photoMetadata       // Save metadata JSON
        });

      if (insertError) {
        console.error('Database Insert Error:', insertError);
        throw new Error("Erreur lors de l'enregistrement de la demande. Veuillez réessayer.");
      }

      // Success
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || "Une erreur inattendue s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-2xl shadow-xl p-8 text-center animate-[fadeIn_0.5s_ease-out] border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Demande Envoyée !</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Merci <span className="font-semibold">{formData.fullName}</span>. Votre demande de correction pour <span className="italic">"{formData.docTitle}"</span> a bien été reçue. L'équipe AinaDigit vous contactera sous peu.
          </p>
          <button
            onClick={() => { setIsSuccess(false); setFormData(INITIAL_DATA); setErrorMessage(null); }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors w-full"
          >
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <Header theme={theme} toggleTheme={toggleTheme} />
        
        <form onSubmit={handleSubmit} className="animate-[fadeIn_0.3s_ease-out]">
          
          {errorMessage && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertTriangle className="text-red-500 dark:text-red-400 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-medium">Erreur</h3>
                <p className="text-red-700 dark:text-red-200 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Section 1: Coordonnées */}
          <FormSection title="Vos Coordonnées" number="1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nom & Prénom"
                type="text"
                name="fullName"
                placeholder="Jean Dupont"
                required
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
              <Input
                label="Adresse E-mail"
                type="email"
                name="email"
                placeholder="jean.dupont@example.com"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <Input
              label="Téléphone (Optionnel)"
              type="tel"
              name="phone"
              placeholder="06 12 34 56 78"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </FormSection>

          {/* Section 2: Détails du Document */}
          <FormSection title="Détails du Document" number="2">
            <Input
              label="Titre du Document / Sujet"
              type="text"
              required
              placeholder="Ex: Thèse sur l'IA en médecine"
              value={formData.docTitle}
              onChange={(e) => handleChange('docTitle', e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nombre Total de Pages"
                type="number"
                min={1}
                required
                placeholder="Ex: 45"
                value={formData.totalPages}
                onChange={(e) => handleChange('totalPages', e.target.value)}
              />
              <Select
                label="Langue du Document"
                required
                options={[
                  { value: 'fr', label: 'Français' },
                  { value: 'en', label: 'Anglais' },
                  { value: 'autre', label: 'Autre' },
                ]}
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
              />
            </div>
          </FormSection>

          {/* Section 3: Zones et Types d'Erreurs */}
          <FormSection title="Besoins de Correction" number="3">
            <Input
              label="Pages Spécifiques (Optionnel)"
              type="text"
              placeholder="Ex: 10-15, 22, 50 (Laissez vide pour tout le document)"
              value={formData.specificPages}
              onChange={(e) => handleChange('specificPages', e.target.value)}
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Types de Correction Souhaitée
              </label>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 space-y-1">
                {ERROR_TYPE_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    label={option}
                    checked={formData.errorTypes.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                  />
                ))}
                
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                  <Checkbox
                    label="Ajout de Paragraphe/Contenu"
                    checked={formData.addParagraphs}
                    onChange={(e) => {
                      handleChange('addParagraphs', e.target.checked);
                      if (!e.target.checked) handleChange('paragraphCount', '');
                    }}
                  />
                </div>

                {/* Conditional Radio Group for Paragraphs */}
                {formData.addParagraphs && (
                  <div className="ml-8 mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 animate-[fadeIn_0.2s_ease-in]">
                    <p className="text-sm font-semibold text-primary-800 dark:text-primary-300 mb-2">Combien de paragraphes ?</p>
                    <div className="space-y-2">
                      {[
                        { val: '1', lbl: '1 Paragraphe' },
                        { val: '2', lbl: '2 Paragraphes' },
                        { val: 'plus', lbl: 'Plus de 2 (Détaillez ci-dessous)' }
                      ].map((item) => (
                        <label key={item.val} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paragraphCount"
                            value={item.val}
                            checked={formData.paragraphCount === item.val}
                            onChange={(e) => handleChange('paragraphCount', e.target.value)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{item.lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <TextArea
              label="Commentaires & Instructions"
              placeholder="Ex: 'Je suis faible sur la ponctuation', 'Le chapitre 3 est prioritaire'..."
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
            />

            <FileUpload
              label="Document à corriger (PDF, Doc, Docx)"
              files={formData.documents}
              onChange={(files) => handleChange('documents', files)}
              maxFiles={5}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              helperText="PDF, Word (Max 5 fichiers)"
            />

            <FileUpload
              label="Photos / Captures d'écran (Max 5)"
              files={formData.files}
              onChange={(files) => handleChange('files', files)}
              maxFiles={5}
              accept="image/*"
              helperText="PNG, JPG (Max 5 fichiers)"
            />
          </FormSection>

          {/* Action Bar */}
          <div className="sticky bottom-4 z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 -top-12 pointer-events-none h-32"></div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl text-lg font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                isSubmitting
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-600/30 dark:bg-primary-600 dark:hover:bg-primary-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Soumettre la Demande</span>
                </>
              )}
            </button>
            <div className="text-center mt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 relative z-20">
               <AlertCircle size={12} />
               <span>Vos informations sont traitées de manière confidentielle.</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default App;