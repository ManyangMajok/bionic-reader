import axios from "axios";

// --- Existing Functions ---

export const extractTextFromPDFPython = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/extract-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
    });

    if (!response.data.text || !response.data.text.trim()) {
      throw new Error("No text content found in PDF");
    }

    return response.data.text.trim();
  } catch (error) {
    console.error("Error extracting PDF text with Python backend:", error);
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          "Python backend is not running. Please start the backend server.",
        );
      } else if (error.response?.status === 413) {
        throw new Error("File is too large. Please try a smaller PDF file.");
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data?.error || "Invalid PDF file format.",
        );
      }
    }
    throw new Error(
      `Failed to extract text from PDF file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

export const generatePdfPython = async (
  text: string,
  filename: string,
  boldIntensity: number,
) => {
  try {
    const response = await axios.post(
      "/api/generate-pdf",
      {
        text: text,
        filename: filename,
        boldIntensity: boldIntensity,
      },
      {
        responseType: "blob",
        timeout: 30000,
      },
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bionic-${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF with Python backend:", error);
    if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
      throw new Error(
        "Python backend is not running. Falling back to DOCX download.",
      );
    }
    throw new Error(
      `There was an error generating the PDF file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

// --- NEW AI FUNCTIONS ---

export const summarizeText = async (text: string) => {
  try {
    const response = await axios.post("/api/summarize", { text });
    return response.data; // Returns { summary: "..." }
  } catch (error) {
    console.error("Summarization failed", error);
    throw new Error("Failed to summarize text.");
  }
};

export const generateSpeech = async (text: string) => {
  try {
    const response = await axios.post(
      "/api/generate-speech",
      { text },
      { responseType: "blob" } // Important for audio
    );
    return response.data; // Returns a Blob (audio file)
  } catch (error) {
    console.error("Speech generation failed", error);
    throw new Error("Failed to generate speech.");
  }
};

export const chatWithDocument = async (context: string, question: string) => {
  try {
    const response = await axios.post("/api/chat", { context, question });
    return response.data; // Returns { answer: "..." }
  } catch (error) {
    console.error("Chat failed", error);
    throw new Error("Failed to get answer.");
  }
};

export const generateMindMap = async (text: string) => {
  try {
    const response = await axios.post("/api/generate-mindmap", { text });
    return response.data; // Returns { mermaidCode: "graph TD..." }
  } catch (error) {
    console.error("Mind map generation failed", error);
    throw new Error("Failed to generate mind map.");
  }
};