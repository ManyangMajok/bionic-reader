import * as mammoth from "mammoth";
import * as Tesseract from "tesseract.js";

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX file");
  }
};

export const extractTextFromImage = async (
  file: File | string,
  onProgress: (progress: number) => void,
): Promise<string> => {
  try {
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const extractedText = result.data.text.trim();

    if (!extractedText) {
      throw new Error("No text found in the image");
    }
    return extractedText;
  } catch (ocrError) {
    console.error("OCR processing error:", ocrError);
    throw new Error(
      "Could not extract text from the image. Please try again with a clearer image.",
    );
  }
};