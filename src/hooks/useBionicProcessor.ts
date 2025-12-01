import { useCallback } from "react";
import { ProcessedText, ReadingSettings } from "../types";
import { processBionicText } from "../lib/bionicProcessor";

interface ProcessorProps {
  processedText: ProcessedText | null;
  readingSettings: ReadingSettings;
  setProcessedText: (text: ProcessedText | null) => void;
  saveSessionState: () => void;
}

export const useBionicProcessor = (props: ProcessorProps) => {
  const {
    processedText,
    readingSettings,
    setProcessedText,
    saveSessionState,
  } = props;

  const handleIntensityChange = useCallback(
    (value: number[]) => {
      if (processedText) {
        const newProcessed = processBionicText(
          processedText.original,
          value[0],
          readingSettings,
        );
        
        // Fixed: Use direct value instead of function updater pattern
        const updatedText: ProcessedText = {
          ...processedText,
          processed: newProcessed
        };
        setProcessedText(updatedText);

        // Auto-save state after intensity change
        setTimeout(() => saveSessionState(), 500);
      }
    },
    [processedText, readingSettings, setProcessedText, saveSessionState],
  );

  const applySettings = useCallback(
    (intensity: number) => {
      if (processedText) {
        const newProcessed = processBionicText(
          processedText.original,
          intensity,
          readingSettings,
        );
        
        // Fixed: Use direct value instead of function updater pattern
        const updatedText: ProcessedText = {
          ...processedText,
          processed: newProcessed
        };
        setProcessedText(updatedText);
      }
    },
    [processedText, readingSettings, setProcessedText],
  );

  return {
    handleIntensityChange,
    applySettings,
  };
};