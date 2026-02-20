export interface UserPreferences {
  theme: string;
  language: string;
  cultureFormat: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  category: 'light' | 'dark';
  previewColor: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export interface CultureOption {
  code: string;
  name: string;
  sampleNumber: string;
  sampleDate: string;
}
