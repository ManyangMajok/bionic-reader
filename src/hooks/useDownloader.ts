import { useCallback } from "react";
import { useToast } from "../components/ui/use-toast";
import { ProcessedText } from "../types";
import { generateDocx } from "../lib/fileDownloaders";
// We only import generatePdfPython (no cancelPdfOperations or PdfGenerationOptions)
import { generatePdfPython } from "../services/api";

interface DownloaderProps {
  processedText: ProcessedText | null;
  file: File | null;
  boldIntensity: number[];
}

export const useDownloader = (props: DownloaderProps) => {
  const { processedText, file, boldIntensity } = props;
  const { toast } = useToast();

  const handleDownloadDocx = useCallback(async () => {
    if (!processedText) return;
    try {
      await generateDocx(processedText, file);
      toast({
        title: "Download started",
        description: "Your processed DOCX file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description:
          error instanceof Error
            ? error.message
            : "Unknown DOCX generation error",
        variant: "destructive",
      });
    }
  }, [processedText, file, toast]);

  const handleDownloadPDF = useCallback(async () => {
    if (!processedText) return;

    try {
      const fileName = file?.name
        ? file.name.replace(/\.[^/.]+$/, "")
        : "processed";

      // --- FIX IS HERE ---
      // We are now calling generatePdfPython with the correct 3 arguments
      await generatePdfPython(
        processedText.processed,
        fileName,
        boldIntensity[0],
      );
      // --- END OF FIX ---

      toast({
        title: "Download started",
        description: "Your processed PDF file is being downloaded.",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
        toast({
          title: "Backend unavailable",
          description: "Falling back to DOCX download.",
          variant: "destructive",
        });
        handleDownloadDocx(); // Fallback
      } else {
        toast({
          title: "Download failed",
          description:
            error instanceof Error
              ? error.message
              : "Unknown PDF generation error",
          variant: "destructive",
        });
      }
    }
  }, [processedText, file, boldIntensity, toast, handleDownloadDocx]);

  return {
    handleDownloadPDF,
    handleDownloadDocx,
  };
};