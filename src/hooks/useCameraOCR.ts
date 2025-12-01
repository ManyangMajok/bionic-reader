import { useState, useRef, useCallback } from "react";
import { useToast } from "../components/ui/use-toast";
import {
  ProcessedText,
  ReadingSettings,
  User,
  FileHistoryItem,
} from "../types";
import { extractTextFromImage } from "../lib/fileExtractors";
import { analyzeTextStructure, processBionicText } from "../lib/bionicProcessor";

interface CameraOCRProps {
  boldIntensity: number[];
  readingSettings: ReadingSettings;
  user: User | null;
  addFileToHistory: (
    item: Omit<FileHistoryItem, "id" | "created_at" | "updated_at">,
  ) => void;
  setFile: (file: File | null) => void;
  setProcessedText: (text: ProcessedText | null) => void;
}

export const useCameraOCR = (props: CameraOCRProps) => {
  const {
    boldIntensity,
    readingSettings,
    user,
    addFileToHistory,
    setFile,
    setProcessedText,
  } = props;
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to capture images.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCapturedImage(null);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);
  }, []);

  const processImageOCR = useCallback(
    async (imageDataUrl: string) => {
      setIsOCRProcessing(true);
      setOcrProgress(0);

      try {
        const extractedText = await extractTextFromImage(
          imageDataUrl,
          setOcrProgress,
        );

        const processed = processBionicText(
          extractedText,
          boldIntensity[0],
          readingSettings,
        );
        const structure = analyzeTextStructure(extractedText);
        setProcessedText({ original: extractedText, processed, structure });

        const mockFile = new File([extractedText], "camera-capture.txt", {
          type: "text/plain",
        });
        setFile(mockFile);

        if (user) {
          addFileToHistory({
            file_name: "Camera Capture",
            original_text: extractedText,
            processed_text: processed,
            bold_intensity: boldIntensity[0],
            file_size: extractedText.length,
            file_type: "image/camera",
          });
        }

        stopCamera();
        toast({
          title: "Text extracted successfully",
          description:
            "Image has been processed and converted to bionic reading format.",
        });
      } catch (error) {
        console.error("OCR processing error:", error);
        toast({
          title: "Text extraction failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not extract text from the image.",
          variant: "destructive",
        });
      } finally {
        setIsOCRProcessing(false);
        setOcrProgress(0);
      }
    },
    [
      boldIntensity,
      readingSettings,
      user,
      addFileToHistory,
      setFile,
      setProcessedText,
      stopCamera,
      toast,
    ],
  );

  return {
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
  };
};