export interface ProcessedText {
  original: string;
  processed: string;
  structure: TextStructure;
}

export interface TextStructure {
  headings: Array<{
    level: number;
    text: string;
    position: number;
  }>;
  paragraphs: Array<{
    text: string;
    position: number;
    wordCount: number;
  }>;
  lists: Array<{
    items: string[];
    position: number;
  }>;
  totalWords: number;
  readingTime: number;
}

export interface ReadingSettings {
  fixationControl: "highlight" | "bold" | "off";
  saccadeControl: boolean;
  opacityLevel: number;
  textSize: number;
  fontFamily: string;
  lineSpacing: number;
  letterSpacing: number;
  
  // --- NEW VISUAL SETTINGS ---
  theme: "light" | "sepia" | "dark" | "slate";
  columnWidth: "narrow" | "medium" | "wide" | "full";
  fixationFrequency: 1 | 2 | 3; // 1 = Every word, 2 = Every 2nd, etc.
}

export interface SessionState {
  fileData: {
    name: string;
    type: string;
    size: number;
    content: string;
  } | null;
  processedText: ProcessedText | null;
  boldIntensity: number;
  showOriginal: boolean;
  readingSettings: ReadingSettings;
  timestamp: number;
}

export interface AppState {
  sessionState: SessionState | null;
  navigationHistory: string[];
  lastActiveRoute: string;
}

// For Supabase user, if not already defined elsewhere
export interface User {
  id: string;
  email?: string;
  // add other user properties if you have them
}

// For file history item
export interface FileHistoryItem {
  id: string;
  file_name: string;
  original_text: string;
  processed_text: string;
  bold_intensity: number;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  
  // --- NEW AI FEATURES PERSISTENCE ---
  summary?: string | null;
  mind_map_code?: string | null;
  audio_path?: string | null;
}