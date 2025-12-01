import {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import {
  ProcessedText,
  ReadingSettings,
  User,
  FileHistoryItem,
} from "../types";
import { useAuth } from "../../supabase/auth";
import { useFileHistory } from "../hooks/useFileHistory";
import { useSessionState } from "../hooks/useSessionState";
import { useCameraOCR } from "../hooks/useCameraOCR";
import { useFileProcessing } from "../hooks/useFileProcessing";
import { useBionicProcessor } from "../hooks/useBionicProcessor";
import { useDownloader } from "../hooks/useDownloader";
// Import Supabase & API functions
import { supabase } from "../../supabase/supabase"; 
import { 
  summarizeText, 
  generateSpeech, 
  chatWithDocument, 
  generateMindMap 
} from "../services/api";

// --- Chat Message Type ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface BionicReaderContextType {
  // Base State
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  processedText: ProcessedText | null;
  setProcessedText: Dispatch<SetStateAction<ProcessedText | null>>;
  boldIntensity: number[];
  setBoldIntensity: Dispatch<SetStateAction<number[]>>;
  showOriginal: boolean;
  setShowOriginal: Dispatch<SetStateAction<boolean>>;
  readingSettings: ReadingSettings;
  setReadingSettings: Dispatch<SetStateAction<ReadingSettings>>;
  usePythonBackend: boolean;
  setUsePythonBackend: Dispatch<SetStateAction<boolean>>;
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;

  // User
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveSessionState: () => void;

  // File History
  fileHistory: FileHistoryItem[];
  showFileHistory: boolean;
  setShowFileHistory: Dispatch<SetStateAction<boolean>>;
  selectedHistoryFile: FileHistoryItem | null;
  setSelectedHistoryFile: Dispatch<SetStateAction<FileHistoryItem | null>>;
  historySearchTerm: string;
  setHistorySearchTerm: Dispatch<SetStateAction<string>>;
  loadFileHistory: () => void;
  addFileToHistory: (
    item: Omit<FileHistoryItem, "id" | "created_at" | "updated_at">,
  ) => void;
  updateFileHistory: (fileId: string, updates: Partial<FileHistoryItem>) => void;
  deleteFileFromHistory: (fileId: string, fileName: string) => void;

  // Camera
  showCamera: boolean;
  setShowCamera: Dispatch<SetStateAction<boolean>>;
  capturedImage: string | null;
  setCapturedImage: Dispatch<SetStateAction<string | null>>;
  isOCRProcessing: boolean;
  ocrProgress: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: () => void;
  stopCamera: () => void;
  captureImage: () => void;
  processImageOCR: (imageDataUrl: string) => void;

  // File Processing
  isProcessing: boolean;
  uploadProgress: number;
  handleFileUpload: (uploadedFile: File) => void;

  // Bionic Processing
  handleIntensityChange: (value: number[]) => void;
  applySettings: (intensity: number) => void;

  // Downloader
  handleDownloadPDF: () => void;
  handleDownloadDocx: () => void;

  // --- AI Features ---
  summary: string | null;
  isSummarizing: boolean;
  showSummaryModal: boolean;
  setShowSummaryModal: Dispatch<SetStateAction<boolean>>;
  getSummary: (text: string) => Promise<void>;

  audioURL: string | null;
  isGeneratingSpeech: boolean;
  getSpeech: (text: string) => Promise<void>;

  // --- Chat Features ---
  isChatOpen: boolean;
  setIsChatOpen: Dispatch<SetStateAction<boolean>>;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  sendChatMessage: (question: string) => Promise<void>;
  clearChat: () => void;

  // --- Mind Map Features ---
  mindMapCode: string | null;
  isGeneratingMindMap: boolean;
  showMindMapModal: boolean;
  setShowMindMapModal: Dispatch<SetStateAction<boolean>>;
  getMindMap: (text: string) => Promise<void>;

  // --- Focus Mode Features ---
  showFocusModal: boolean;
  setShowFocusModal: Dispatch<SetStateAction<boolean>>;

  // --- Full Mode State ---
  isFullMode: boolean;
  setIsFullMode: Dispatch<SetStateAction<boolean>>;
}

const BionicReaderContext = createContext<BionicReaderContextType | undefined>(
  undefined,
);

export const BionicReaderProvider = ({ children }: { children: ReactNode }) => {
  // Base State
  const [file, setFile] = useState<File | null>(null);
  const [processedText, setProcessedText] = useState<ProcessedText | null>(null);
  const [boldIntensity, setBoldIntensity] = useState([50]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [usePythonBackend, setUsePythonBackend] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // --- UPDATED DEFAULT SETTINGS ---
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    fixationControl: "bold",
    saccadeControl: true,
    opacityLevel: 80,
    textSize: 16,
    fontFamily: "Inter, sans-serif",
    lineSpacing: 1.5,
    letterSpacing: 0,
    theme: "light",
    columnWidth: "medium",
    fixationFrequency: 1
  });

  // --- AI State ---
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);

  // --- Chat State ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
        id: 'init', 
        role: 'assistant', 
        content: 'Hi! I am your reading assistant. Ask me anything about this document.' 
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- Mind Map State ---
  const [mindMapCode, setMindMapCode] = useState<string | null>(null);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [showMindMapModal, setShowMindMapModal] = useState(false);

  // --- Focus Mode State ---
  const [showFocusModal, setShowFocusModal] = useState(false);

  // --- NEW: Full Mode State ---
  const [isFullMode, setIsFullMode] = useState(false);

  // Auth
  const { user, loading, signIn, signUp, signOut } = useAuth();

  // History Hook
  const {
    fileHistory,
    setFileHistory,
    showFileHistory,
    setShowFileHistory,
    selectedHistoryFile,
    setSelectedHistoryFile,
    historySearchTerm,
    setHistorySearchTerm,
    loadFileHistory,
    addFileToHistory,
    updateFileHistory,
    deleteFileFromHistory,
  } = useFileHistory(user);

  // Session Hook
  const { saveSessionState } = useSessionState(
    { 
      file, 
      processedText, 
      boldIntensity, 
      showOriginal, 
      readingSettings, 
      user 
    },
    {
      setFile,
      setProcessedText,
      setBoldIntensity,
      setShowOriginal,
      setReadingSettings,
    },
    loadFileHistory,
  );

  // Camera Hook
  const {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    isOCRProcessing,
    setIsOCRProcessing,
    ocrProgress,
    setOcrProgress,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureImage,
    processImageOCR,
  } = useCameraOCR({
    boldIntensity,
    readingSettings,
    user,
    addFileToHistory,
    setFile,
    setProcessedText,
  });

  // File Processing Hook
  const { isProcessing, uploadProgress, handleFileUpload } = useFileProcessing({
    boldIntensity,
    readingSettings,
    user,
    addFileToHistory,
    setFile,
    setProcessedText,
    setIsOCRProcessing,
    setOcrProgress,
  });

  // Bionic Processor Hook
  const { handleIntensityChange, applySettings } = useBionicProcessor({
    processedText,
    readingSettings,
    setProcessedText,
    saveSessionState,
  });

  // Downloader Hook
  const { handleDownloadPDF, handleDownloadDocx } = useDownloader({
    processedText,
    file,
    boldIntensity,
  });

  // Wrapper for handleIntensityChange
  const handleIntensityChangeWrapper = (value: number[]) => {
    setBoldIntensity(value);
    handleIntensityChange(value);
  };

  // --- Helper: Find Matching File in History (DATABASE CACHE) ---
  const findMatchingHistoryItem = () => {
    if (selectedHistoryFile) return selectedHistoryFile;
    if (!file || fileHistory.length === 0) return null;
    return fileHistory.find(f => f.file_name === file.name);
  };

  // --- Helper: Find the current file ID ---
  const getCurrentFileId = (): string | null => {
    const match = findMatchingHistoryItem();
    return match ? match.id : null;
  };

  // --- Helper: Prepare History Item for Lazy Save ---
  const prepareCurrentItem = (extraData: { summary?: string; mind_map_code?: string; audio_path?: string }) => {
    if (!file || !processedText) return null;
    return {
        file_name: file.name,
        original_text: processedText.original,
        processed_text: processedText.processed,
        bold_intensity: boldIntensity[0],
        file_size: file.size,
        file_type: file.type,
        ...extraData
    };
  };

  // --- AI Handlers ---
  const getSummary = async (text: string) => {
    if (summary) {
        console.log("[CONTEXT DEBUG] Using active summary from state (Hot Cache).");
        setShowSummaryModal(true);
        return; 
    }

    const existingItem = findMatchingHistoryItem();
    if (existingItem && existingItem.summary) {
        console.log("[CONTEXT DEBUG] Found saved summary in database/history.");
        setSummary(existingItem.summary);
        setShowSummaryModal(true);
        return;
    }

    setIsSummarizing(true);
    try {
      const result = await summarizeText(text);
      setSummary(result.summary);
      setShowSummaryModal(true);
      
      const fileId = existingItem ? existingItem.id : null;
      if (fileId) {
        updateFileHistory(fileId, { summary: result.summary });
        if (selectedHistoryFile && selectedHistoryFile.id === fileId) {
            setSelectedHistoryFile({ ...selectedHistoryFile, summary: result.summary });
        }
      } else {
        const newItem = prepareCurrentItem({ summary: result.summary });
        if (newItem) addFileToHistory(newItem);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to summarize text. Ensure Python backend is running.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const getSpeech = async (text: string) => {
    // 1. HOT CACHE
    if (audioURL) {
      console.log("[CONTEXT DEBUG] Using audio from state.");
      return; 
    }

    // 2. DB CACHE
    const existingItem = findMatchingHistoryItem();
    if (existingItem && existingItem.audio_path) {
      console.log("[CONTEXT DEBUG] Found Audio Path in history:", existingItem.audio_path);
      
      // Get Public URL
      const { data } = supabase.storage
        .from('audio-files')
        .getPublicUrl(existingItem.audio_path);
        
      if (data.publicUrl) {
        setAudioURL(data.publicUrl);
        return; // Success - skip generation
      }
    }

    // 3. GENERATE & SAVE
    setIsGeneratingSpeech(true);
    try {
      const blob = await generateSpeech(text);
      const url = URL.createObjectURL(blob);
      setAudioURL(url); // Immediate playback
      
      if (user) {
        console.log("[CONTEXT DEBUG] Uploading generated audio to Storage...");
        // Sanitize filename to be safe
        const cleanName = (file?.name || 'speech').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${user.id}/${Date.now()}-${cleanName}.wav`;
        
        // Upload
        const { error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(fileName, blob, {
            contentType: 'audio/wav',
            upsert: false
          });

        if (uploadError) {
          console.error("[CONTEXT DEBUG] Audio Upload Failed:", uploadError);
        } else {
          console.log("[CONTEXT DEBUG] Audio Upload Success. Updating DB Record.");
          
          const fileId = getCurrentFileId();
          if (fileId) {
            updateFileHistory(fileId, { audio_path: fileName });
            
            // CRITICAL: Update local state so we know we have audio now
            if (selectedHistoryFile && selectedHistoryFile.id === fileId) {
                setSelectedHistoryFile({ ...selectedHistoryFile, audio_path: fileName });
            }
          } else {
            const newItem = prepareCurrentItem({ audio_path: fileName });
            if (newItem) addFileToHistory(newItem);
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate audio.");
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const sendChatMessage = async (question: string) => {
    if (!question.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: question };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
        const context = processedText?.original || ""; 
        const result = await chatWithDocument(context, question);
        const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: result.answer };
        setChatMessages(prev => [...prev, botMsg]);
    } catch (error) {
        console.error(error);
        const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'assistant', content: "Connection error." };
        setChatMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const clearChat = () => {
      setChatMessages([{ id: 'init', role: 'assistant', content: 'Hi! I am your reading assistant. Ask me anything about this document.' }]);
  };

  const getMindMap = async (text: string) => {
    if (mindMapCode) {
        console.log("[CONTEXT DEBUG] Using active Mind Map from state.");
        setShowMindMapModal(true);
        return; 
    }

    const existingItem = findMatchingHistoryItem();
    if (existingItem && existingItem.mind_map_code) {
        console.log("[CONTEXT DEBUG] Found saved Mind Map in history.");
        setMindMapCode(existingItem.mind_map_code);
        setShowMindMapModal(true);
        return; 
    }

    setIsGeneratingMindMap(true);
    try {
      const result = await generateMindMap(text);
      setMindMapCode(result.mermaidCode);
      setShowMindMapModal(true);

      const fileId = existingItem ? existingItem.id : null;
      if (fileId) {
        updateFileHistory(fileId, { mind_map_code: result.mermaidCode });
        if (selectedHistoryFile && selectedHistoryFile.id === fileId) {
            setSelectedHistoryFile({ ...selectedHistoryFile, mind_map_code: result.mermaidCode });
        }
      } else {
        const newItem = prepareCurrentItem({ mind_map_code: result.mermaidCode });
        if (newItem) addFileToHistory(newItem);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate mind map.");
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  // Restore saved AI data when selecting a history file
  useEffect(() => {
    if (selectedHistoryFile) {
        setSummary(selectedHistoryFile.summary || null);
        setMindMapCode(selectedHistoryFile.mind_map_code || null);
        
        if (selectedHistoryFile.audio_path) {
            console.log("[CONTEXT DEBUG] Restoring Audio:", selectedHistoryFile.audio_path);
            const { data } = supabase.storage
                .from('audio-files')
                .getPublicUrl(selectedHistoryFile.audio_path);
            if (data.publicUrl) setAudioURL(data.publicUrl);
        } else {
            setAudioURL(null);
        }
        
        clearChat();
    }
  }, [selectedHistoryFile]);

  // Reset/Clear AI data when a fresh file is uploaded (Auto-Connect Logic)
  useEffect(() => {
    if (processedText && !selectedHistoryFile) {
        const match = findMatchingHistoryItem();
        if (match) {
            console.log("[CONTEXT DEBUG] Fresh upload matches existing history item:", match.id);
            if (match.summary) setSummary(match.summary);
            if (match.mind_map_code) setMindMapCode(match.mind_map_code);
            if (match.audio_path) {
                const { data } = supabase.storage.from('audio-files').getPublicUrl(match.audio_path);
                setAudioURL(data.publicUrl);
            }
        } else {
            setSummary(null);
            setMindMapCode(null);
            setAudioURL(null);
        }
        clearChat();
    }
  }, [processedText, selectedHistoryFile, fileHistory]); 

  const value: BionicReaderContextType = {
    // State & Setters
    file, setFile, processedText, setProcessedText, boldIntensity, setBoldIntensity,
    showOriginal, setShowOriginal, readingSettings, setReadingSettings,
    usePythonBackend, setUsePythonBackend, showSettings, setShowSettings,
    
    // Features
    user, loading, signIn, signUp, signOut, saveSessionState,
    fileHistory, showFileHistory, setShowFileHistory, selectedHistoryFile,
    setSelectedHistoryFile, historySearchTerm, setHistorySearchTerm, loadFileHistory,
    addFileToHistory, updateFileHistory, deleteFileFromHistory,
    showCamera, setShowCamera, capturedImage, setCapturedImage, isOCRProcessing,
    ocrProgress, videoRef, canvasRef, startCamera, stopCamera, captureImage, processImageOCR,
    isProcessing, uploadProgress, handleFileUpload,
    handleIntensityChange: handleIntensityChangeWrapper, applySettings,
    handleDownloadPDF, handleDownloadDocx,
    summary, isSummarizing, showSummaryModal, setShowSummaryModal, getSummary,
    audioURL, isGeneratingSpeech, getSpeech,
    isChatOpen, setIsChatOpen, chatMessages, isChatLoading, sendChatMessage, clearChat,
    mindMapCode, isGeneratingMindMap, showMindMapModal, setShowMindMapModal, getMindMap,
    showFocusModal, setShowFocusModal, isFullMode, setIsFullMode
  };

  return (
    <BionicReaderContext.Provider value={value}>
      {children}
    </BionicReaderContext.Provider>
  );
};

export const useBionicReader = () => {
  const context = useContext(BionicReaderContext);
  if (context === undefined) {
    throw new Error(
      "useBionicReader must be used within a BionicReaderProvider",
    );
  }
  return context;
};