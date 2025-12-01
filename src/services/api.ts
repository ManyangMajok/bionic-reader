import axios from "axios";

// CONFIGURATION
// Development: Use localhost
// Production: Use relative path (Vercel will proxy to Render via vercel.json)
const API_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

// Create an axios instance for cleaner calls
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // INCREASED TIMEOUT: Render free tier takes ~50-60s to wake up.
  timeout: 120000, 
});

export const extractTextFromPDFPython = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/api/extract-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.text || !response.data.text.trim()) {
      throw new Error("No text content found in PDF");
    }

    return response.data.text.trim();
  } catch (error) {
    console.error("Error extracting PDF text with Python backend:", error);
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        throw new Error(
          "Backend server is unreachable. If you are on the live site, the free server might be waking up (wait 30s). If local, ensure python app.py is running.",
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
      `Failed to extract text: ${
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
    const response = await apiClient.post(
      "/api/generate-pdf",
      {
        text: text,
        filename: filename,
        boldIntensity: boldIntensity,
      },
      {
        responseType: "blob",
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
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF.");
  }
};

export const summarizeText = async (text: string) => {
  try {
    const response = await apiClient.post("/api/summarize", { text });
    return response.data; // Returns { summary: "..." }
  } catch (error) {
    console.error("Summarization failed", error);
    throw new Error("Failed to summarize text.");
  }
};

export const generateSpeech = async (text: string) => {
  try {
    const response = await apiClient.post(
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
    const response = await apiClient.post("/api/chat", { context, question });
    return response.data; // Returns { answer: "..." }
  } catch (error) {
    console.error("Chat failed", error);
    throw new Error("Failed to get answer.");
  }
};

export const generateMindMap = async (text: string) => {
  try {
    const response = await apiClient.post("/api/generate-mindmap", { text });
    return response.data; // Returns { mermaidCode: "graph TD..." }
  } catch (error) {
    console.error("Mind map generation failed", error);
    throw new Error("Failed to generate mind map.");
  }
};