import { useState, useCallback } from "react";
import { useToast } from "../components/ui/use-toast";
import {
  ProcessedText,
  ReadingSettings,
  User,
  FileHistoryItem,
} from "../types";
import {
  extractTextFromDOCX,
  extractTextFromImage,
} from "../lib/fileExtractors";
import { extractTextFromPDFPython } from "../services/api"; // Only import PDF extractor
import { analyzeTextStructure, processBionicText } from "../lib/bionicProcessor";

interface FileProcessingProps {
  boldIntensity: number[];
  readingSettings: ReadingSettings;
  user: User | null;
  addFileToHistory: (
    item: Omit<FileHistoryItem, "id" | "created_at" | "updated_at">,
  ) => void;
  setFile: (file: File | null) => void;
  setProcessedText: (text: ProcessedText | null) => void;
  setIsOCRProcessing: (isProcessing: boolean) => void;
  setOcrProgress: (progress: number) => void;
}

export const useFileProcessing = (props: FileProcessingProps) => {
  const {
    boldIntensity,
    readingSettings,
    user,
    addFileToHistory,
    setFile,
    setProcessedText,
    setIsOCRProcessing,
    setOcrProgress,
  } = props;

  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = useCallback(
    async (uploadedFile: File) => {
      if (!uploadedFile) return;

      const validTypes = [
        "text/plain",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
      ];
      const isImageFile = uploadedFile.type.startsWith("image/");
      if (
        !validTypes.includes(uploadedFile.type) &&
        !uploadedFile.name.endsWith(".txt") &&
        !isImageFile
      ) {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF, DOCX, TXT, or image file.",
          variant: "destructive",
        });
        return;
      }

      setFile(uploadedFile);
      setIsProcessing(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      try {
        let text = "";

        if (
          uploadedFile.type === "text/plain" ||
          uploadedFile.name.endsWith(".txt")
        ) {
          text = await uploadedFile.text();
        } else if (uploadedFile.type === "application/pdf") {
          // Use Python backend for PDF
          text = await extractTextFromPDFPython(uploadedFile);
        } else if (
          uploadedFile.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          uploadedFile.name.endsWith(".docx")
        ) {
          // Use client-side 'mammoth' for DOCX
          text = await extractTextFromDOCX(uploadedFile);
        } else if (isImageFile) {
          setIsOCRProcessing(true);
          setOcrProgress(0);
          try {
            // Use client-side 'tesseract' for Images
            text = await extractTextFromImage(uploadedFile, setOcrProgress);
          } finally {
            setIsOCRProcessing(false);
            setOcrProgress(0);
          }
        }

        if (!text.trim()) {
          throw new Error("No text content found in the file");
        }

        const structure = analyzeTextStructure(text);
        const processed = processBionicText(
          text,
          boldIntensity[0],
          readingSettings,
        );
        setProcessedText({ original: text, processed, structure });
        setUploadProgress(100);

        if (user) {
          addFileToHistory({
            file_name: uploadedFile.name,
            original_text: text,
            processed_text: processed,
            bold_intensity: boldIntensity[0],
            file_size: uploadedFile.size,
            file_type: isImageFile
              ? "image/processed"
              : uploadedFile.type || "unknown",
          });
        }

        toast({
          title: "File processed successfully",
          description: isImageFile
            ? `Text extracted from ${uploadedFile.name} and converted.`
            : `${uploadedFile.name} has been converted.`,
        });
      } catch (error) {
        toast({
          title: "Processing failed",
          description:
            error instanceof Error
              ? error.message
              : "There was an error processing your file.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setIsOCRProcessing(false);
        setOcrProgress(0);
        clearInterval(progressInterval);
      }
    },
    [
      boldIntensity,
      readingSettings,
      toast,
      user,
      addFileToHistory,
      setFile,
      setProcessedText,
      setIsOCRProcessing,
      setOcrProgress,
    ],
  );

  return {
    isProcessing,
    uploadProgress,
    handleFileUpload,
  };
};