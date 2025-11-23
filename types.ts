export interface CorrectionRequestData {
  fullName: string;
  email: string;
  phone: string;
  docTitle: string;
  totalPages: number | '';
  language: string;
  specificPages: string;
  errorTypes: string[];
  addParagraphs: boolean;
  paragraphCount: '1' | '2' | 'plus' | '';
  comments: string;
  files: File[];
  documents: File[];
}

export const INITIAL_DATA: CorrectionRequestData = {
  fullName: '',
  email: '',
  phone: '',
  docTitle: '',
  totalPages: '',
  language: '',
  specificPages: '',
  errorTypes: [],
  addParagraphs: false,
  paragraphCount: '',
  comments: '',
  files: [],
  documents: []
};

export const ERROR_TYPE_OPTIONS = [
  "Mise en page/Formatage",
  "Orthographe pure",
  "Grammaire/Conjugaison",
  "Reformulation de phrases lourdes",
  "Vérification de la cohérence des sources/citations"
];