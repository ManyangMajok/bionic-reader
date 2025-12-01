import { useCallback, useEffect } from "react";
import { useToast } from "../components/ui/use-toast";
import {
  ProcessedText,
  ReadingSettings,
  SessionState,
  AppState,
  User,
} from "../types";

interface UseSessionStateProps {
  file: File | null;
  processedText: ProcessedText | null;
  boldIntensity: number[];
  showOriginal: boolean;
  readingSettings: ReadingSettings;
  user: User | null;
}

interface Setters {
  setFile: (file: File | null) => void;
  setProcessedText: (text: ProcessedText | null) => void;
  setBoldIntensity: (value: number[]) => void;
  setShowOriginal: (show: boolean) => void;
  setReadingSettings: (settings: ReadingSettings) => void;
}

export const useSessionState = (
  state: UseSessionStateProps,
  setters: Setters,
  loadFileHistory: () => void,
) => {
  const {
    file,
    processedText,
    boldIntensity,
    showOriginal,
    readingSettings,
    user,
  } = state;
  const {
    setFile,
    setProcessedText,
    setBoldIntensity,
    setShowOriginal,
    setReadingSettings,
  } = setters;
  const { toast } = useToast();

  const saveSessionState = useCallback(() => {
    if (!file && !processedText) return;

    const sessionState: SessionState = {
      fileData: file
        ? {
            name: file.name,
            type: file.type,
            size: file.size,
            content: processedText?.original || "",
          }
        : null,
      processedText,
      boldIntensity: boldIntensity[0],
      showOriginal,
      readingSettings,
      timestamp: Date.now(),
    };

    localStorage.setItem("bionicReaderSession", JSON.stringify(sessionState));

    const appState: AppState = {
      sessionState,
      navigationHistory: JSON.parse(
        localStorage.getItem("navigationHistory") || "[]",
      ),
      lastActiveRoute: "/bionic-reader",
    };
    localStorage.setItem("appState", JSON.stringify(appState));
  }, [file, processedText, boldIntensity, showOriginal, readingSettings]);

  // Auto-save session state periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (processedText || file) {
        saveSessionState();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [saveSessionState, processedText, file]);

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveSessionState();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveSessionState]);

  // Enhanced session state restoration
  const restoreSessionState = useCallback(async () => {
    const savedState = localStorage.getItem("bionicReaderSession");
    const appState = localStorage.getItem("appState");

    if (!savedState && !appState) return;

    try {
      let sessionState: SessionState | null = null;

      if (appState) {
        const parsedAppState: AppState = JSON.parse(appState);
        sessionState = parsedAppState.sessionState;
      } else if (savedState) {
        sessionState = JSON.parse(savedState);
      }

      if (sessionState?.fileData && sessionState.processedText) {
        const isSessionValid =
          sessionState.timestamp &&
          Date.now() - sessionState.timestamp < 24 * 60 * 60 * 1000;

        if (isSessionValid) {
          const restoredFile = new File(
            [sessionState.fileData.content],
            sessionState.fileData.name,
            { type: sessionState.fileData.type },
          );

          setFile(restoredFile);
          setProcessedText(sessionState.processedText);
          setBoldIntensity([sessionState.boldIntensity]);
          setShowOriginal(sessionState.showOriginal);

          if (sessionState.readingSettings) {
            setReadingSettings(sessionState.readingSettings);
          }

          toast({
            title: "Welcome back!",
            description: "Your previous work has been restored seamlessly.",
          });
        } else {
          localStorage.removeItem("bionicReaderSession");
          localStorage.removeItem("appState");
        }
      }
    } catch (error) {
      console.error("Error restoring session state:", error);
      localStorage.removeItem("bionicReaderSession");
      localStorage.removeItem("appState");
    }
  }, [
    toast,
    setFile,
    setProcessedText,
    setBoldIntensity,
    setShowOriginal,
    setReadingSettings,
  ]);

  // Restore session on component mount if user is authenticated
  useEffect(() => {
    if (user) {
      restoreSessionState();
      loadFileHistory();
    }
  }, [user, restoreSessionState, loadFileHistory]);

  // Return save function for manual triggers
  return { saveSessionState };
};