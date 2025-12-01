import { useState, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  User,
  Upload,
  Download,
  FileText,
  Eye,
  EyeOff,
  Zap,
  BookOpen,
  Sparkles,
  MessageCircle, // New Icon
  Network,       // New Icon
  Headphones,    // New Icon
  Brain          // New Icon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "../ui/use-toast";

interface ProcessedText {
  original: string;
  processed: string;
}

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo functionality states
  const [file, setFile] = useState<File | null>(null);
  const [processedText, setProcessedText] = useState<ProcessedText | null>(
    null,
  );
  const [boldIntensity, setBoldIntensity] = useState([50]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Animation State for Example Section
  const [animationIndex, setAnimationIndex] = useState(0);
  const exampleText = "The quick brown fox jumps over the lazy dog. This sentence demonstrates the bionic reading transformation in real-time.";
  const exampleWords = exampleText.split(" ");

  // Scanning Animation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationIndex((prev) => {
        if (prev >= exampleWords.length + 5) {
            return 0; // Reset after a small pause
        }
        return prev + 1;
      });
    }, 200); // Speed of scanning
    return () => clearInterval(interval);
  }, [exampleWords.length]);

  // Restore demo state on component mount
  useEffect(() => {
    const savedDemoState = localStorage.getItem("demoState");
    if (savedDemoState && user) {
      try {
        const demoState = JSON.parse(savedDemoState);
        const isStateValid =
          demoState.timestamp &&
          Date.now() - demoState.timestamp < 2 * 60 * 60 * 1000; // 2 hours

        if (isStateValid && demoState.processedText) {
          if (demoState.fileData) {
            const restoredFile = new File(
              [demoState.fileData.content],
              demoState.fileData.name,
              { type: demoState.fileData.type },
            );
            setFile(restoredFile);
          }
          setProcessedText(demoState.processedText);
          setBoldIntensity([demoState.boldIntensity]);
          setShowOriginal(demoState.showOriginal);

          toast({
            title: "Work restored",
            description: "Your previous demo work has been restored.",
          });

          // Clear the demo state after restoration
          localStorage.removeItem("demoState");
        }
      } catch (error) {
        console.error("Error restoring demo state:", error);
        localStorage.removeItem("demoState");
      }
    }
  }, [user, toast]);

  const extractTextFromPDF = useCallback(
    async (file: File): Promise<string> => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\n";
        }

        if (!fullText.trim()) {
          throw new Error("No text content found in PDF");
        }

        return fullText.trim();
      } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error(
          `Failed to extract text from PDF file: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
    [],
  );

  const extractTextFromDOCX = useCallback(
    async (file: File): Promise<string> => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (error) {
        console.error("Error extracting DOCX text:", error);
        throw new Error("Failed to extract text from DOCX file");
      }
    },
    [],
  );

  const processBionicText = useCallback((text: string, intensity: number) => {
    // Split by lines first to preserve paragraph structure
    const lines = text.split("\n");

    const processedLines = lines.map((line) => {
      if (line.trim().length === 0) return line; // Preserve empty lines

      const words = line.split(/\s+/);
      const processedWords = words.map((word) => {
        if (word.length === 0) return word;

        const charsToBold = Math.max(
          1,
          Math.ceil((word.length * intensity) / 100),
        );
        const boldPart = word.slice(0, charsToBold);
        const normalPart = word.slice(charsToBold);

        return `<strong>${boldPart}</strong>${normalPart}`;
      });

      return processedWords.join(" ");
    });

    return processedLines.join("\n");
  }, []);

  const handleFileUpload = useCallback(
    async (uploadedFile: File) => {
      if (!uploadedFile) return;

      const validTypes = [
        "text/plain",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (
        !validTypes.includes(uploadedFile.type) &&
        !uploadedFile.name.endsWith(".txt")
      ) {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF, DOCX, or TXT file.",
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
          text = await extractTextFromPDF(uploadedFile);
        } else if (
          uploadedFile.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          uploadedFile.name.endsWith(".docx")
        ) {
          text = await extractTextFromDOCX(uploadedFile);
        }

        if (!text.trim()) {
          throw new Error("No text content found in the file");
        }

        const processed = processBionicText(text, boldIntensity[0]);
        setProcessedText({ original: text, processed });
        setUploadProgress(100);

        toast({
          title: "File processed successfully",
          description: `${uploadedFile.name} has been converted to bionic reading format.`,
        });
      } catch (error) {
        toast({
          title: "Processing failed",
          description: "There was an error processing your file.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        clearInterval(progressInterval);
      }
    },
    [
      boldIntensity,
      processBionicText,
      toast,
      extractTextFromPDF,
      extractTextFromDOCX,
    ],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileUpload(droppedFile);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleIntensityChange = useCallback(
    (value: number[]) => {
      setBoldIntensity(value);
      if (processedText) {
        const newProcessed = processBionicText(
          processedText.original,
          value[0],
        );
        setProcessedText((prev) =>
          prev ? { ...prev, processed: newProcessed } : null,
        );
      }
    },
    [processedText, processBionicText],
  );

  const handleDownload = useCallback(() => {
    if (!processedText) return;

    if (!user) {
      // Save current demo state before redirecting
      const demoState = {
        fileData: file
          ? {
              name: file.name,
              type: file.type,
              size: file.size,
              content: processedText.original,
            }
          : null,
        processedText,
        boldIntensity: boldIntensity[0],
        showOriginal,
        timestamp: Date.now(),
      };
      localStorage.setItem("demoState", JSON.stringify(demoState));

      toast({
        title: "Sign up to continue",
        description:
          "Your work will be saved. Please sign up to download your file.",
        variant: "default",
      });
      navigate("/signup");
      return;
    }

    const blob = new Blob(
      [processedText.processed.replace(/<\/?strong>/g, "")],
      {
        type: "text/plain",
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bionic-${file?.name || "processed"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your processed file is being downloaded.",
    });
  }, [processedText, file, toast, user, navigate, boldIntensity, showOriginal]);

  // Helper to render a single animated word
  const renderAnimatedWord = (word: string, index: number) => {
    const isProcessed = index < animationIndex;
    
    if (!isProcessed) return <span className="transition-all duration-300">{word} </span>;

    const intensity = 50; // Fixed for demo
    const charsToBold = Math.max(1, Math.ceil((word.length * intensity) / 100));
    const boldPart = word.slice(0, charsToBold);
    const normalPart = word.slice(charsToBold);

    return (
      <span className="transition-all duration-300">
        <strong className="font-extrabold text-gray-900">{boldPart}</strong>{normalPart}{" "}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Zap className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Bionic Reader
              </span>
            </Link>
            {user && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link to="/bionic-reader">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Processor
                  </Button>
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/bionic-reader" className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Full App
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 hover:cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link to="/bionic-reader" className="cursor-pointer">
                        <Zap className="mr-2 h-4 w-4" />
                        Processor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onSelect={() => signOut()}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Sign Up</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-12">
        {/* Hero Section */}
        <section className="py-16 sm:py-20 lg:py-24 text-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                AI-Powered <br className="hidden sm:block"/> Bionic Reader
              </h1>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform any document into enhanced text. 
              <span className="block mt-2">
                  Upload, summarize, chat, and read at <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">superhuman speeds</span>.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              {user ? (
                <Link to="/bionic-reader">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 w-full sm:w-auto"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Open Full App
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 sm:px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                    onClick={() => {
                      const navHistory = JSON.parse(
                        localStorage.getItem("navigationHistory") || "[]",
                      );
                      navHistory.push("/");
                      localStorage.setItem(
                        "navigationHistory",
                        JSON.stringify(navHistory.slice(-10)),
                      );
                      navigate("/signup");
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                    onClick={() =>
                      document
                        .getElementById("demo-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Try Demo
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* AI Superpowers Section (NEW) */}
        <section className="py-16 sm:py-20 bg-white">
             <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Beyond Just Reading</h2>
                    <p className="text-xl text-gray-600">Four powerful AI tools to help you master any document in minutes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card 1: Summarization */}
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Summarization</h3>
                        <p className="text-gray-600">Turn 50-page PDFs into concise bullet points instantly using Gemini 1.5 AI.</p>
                    </div>

                    {/* Card 2: Chat with Doc */}
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Context-Aware Chat</h3>
                        <p className="text-gray-600">Ask questions and get answers strictly based on your document's content.</p>
                    </div>

                    {/* Card 3: Mind Maps */}
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                            <Network className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Mind Maps</h3>
                        <p className="text-gray-600">Automatically generate flowcharts and concept maps to visualize complex topics.</p>
                    </div>

                    {/* Card 4: Focus Mode */}
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                            <Brain className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Focus Flow (RSVP)</h3>
                        <p className="text-gray-600">Read 500+ WPM with our Rapid Serial Visual Presentation mode + Audio Ambience.</p>
                    </div>
                </div>
             </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo-section" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
                Try the Core Processor
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Experience bionic reading with our interactive demo
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
              {/* Upload Section */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-0 ring-1 ring-gray-200/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Upload Document
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Drag and drop your PDF, DOCX, or TXT file here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 lg:p-12 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50/30 group relative overflow-hidden"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() =>
                      document.getElementById("demo-file-input")?.click()
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 group-hover:text-blue-500 mx-auto mb-4 sm:mb-6 transition-all duration-300 group-hover:scale-110" />
                      <p className="text-gray-700 mb-2 text-base sm:text-lg font-semibold">
                        {file
                          ? file.name
                          : "Drop your file here or click to browse"}
                      </p>
                      <p className="text-sm sm:text-base text-gray-500">
                        Supports PDF, DOCX, and TXT files (Max 10MB)
                      </p>
                    </div>
                    <input
                      id="demo-file-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) handleFileUpload(selectedFile);
                      }}
                    />
                  </div>

                  {isProcessing && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Processing...
                        </span>
                        <span className="text-sm text-gray-600">
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Controls Section */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-0 ring-1 ring-gray-200/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Processing Controls
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Adjust the bold intensity and preview options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm sm:text-base font-medium text-gray-700">
                        Bold Intensity
                      </label>
                      <span className="text-sm sm:text-base font-bold text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-full border border-blue-200/50">
                        {boldIntensity[0]}%
                      </span>
                    </div>
                    <Slider
                      value={boldIntensity}
                      onValueChange={handleIntensityChange}
                      min={25}
                      max={75}
                      step={5}
                      className="w-full"
                      disabled={!processedText}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Light</span>
                      <span>Medium</span>
                      <span>Strong</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowOriginal(!showOriginal)}
                      disabled={!processedText}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto hover:bg-gray-50"
                    >
                      {showOriginal ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {showOriginal ? "Show Processed" : "Show Original"}
                      </span>
                      <span className="sm:hidden">
                        {showOriginal ? "Processed" : "Original"}
                      </span>
                    </Button>

                    <Button
                      onClick={handleDownload}
                      disabled={!processedText}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Section */}
            {processedText && (
              <Card className="mt-8 lg:mt-10 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 xl:col-span-2 border-0 ring-1 ring-gray-200/50">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Preview
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base mt-1">
                        {showOriginal
                          ? "Original text"
                          : "Bionic reading format"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      {showOriginal ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {showOriginal ? "Show Processed" : "Show Original"}
                      </span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/50 shadow-inner">
                    <div
                      className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-medium"
                      dangerouslySetInnerHTML={{
                        __html: showOriginal
                          ? processedText.original.replace(/\n/g, "<br>")
                          : processedText.processed.replace(/\n/g, "<br>"),
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* ANIMATED EXAMPLE SECTION (UPDATED) */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                 <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    See it in Action
                 </h3>
                 <p className="text-gray-500">Watch the bionic transformation happen live</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-inner border border-gray-200">
                <div className="text-lg sm:text-xl lg:text-2xl leading-relaxed font-mono text-gray-800">
                    {exampleWords.map((word, i) => (
                        renderAnimatedWord(word, i)
                    ))}
                    {/* Blinking Cursor */}
                    <span className="inline-block w-2 h-6 bg-blue-500 ml-1 animate-pulse align-middle"></span>
                </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Ready to Read Faster?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who have enhanced their reading experience
              and productivity with Bionic Reader
            </p>
            {user ? (
              <Link to="/bionic-reader">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Open Full Application
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 w-full sm:w-auto"
                  onClick={() => {
                    const navHistory = JSON.parse(
                      localStorage.getItem("navigationHistory") || "[]",
                    );
                    navHistory.push("/");
                    localStorage.setItem(
                      "navigationHistory",
                      JSON.stringify(navHistory.slice(-10)),
                    );
                    navigate("/signup");
                  }}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 w-full sm:w-auto"
                  onClick={() => {
                    const navHistory = JSON.parse(
                      localStorage.getItem("navigationHistory") || "[]",
                    );
                    navHistory.push("/");
                    localStorage.setItem(
                      "navigationHistory",
                      JSON.stringify(navHistory.slice(-10)),
                    );
                    navigate("/login");
                  }}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-white text-lg">
                  Bionic Reader
                </h4>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                Enhance your reading speed and comprehension with our advanced
                text processing technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4">
                Features
              </h4>
              <ul className="space-y-2 text-sm sm:text-base">
                <li className="hover:text-white transition-colors cursor-pointer">
                  PDF & DOCX Support
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  AI Summarization
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Context Chat
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Mind Maps
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm sm:text-base">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                {user ? (
                  <>
                    <li>
                      <Link
                        to="/dashboard"
                        className="hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/bionic-reader"
                        className="hover:text-white transition-colors"
                      >
                        Processor
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/account"
                        className="hover:text-white transition-colors"
                      >
                        Account
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="hover:text-white transition-colors"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/signup"
                        className="hover:text-white transition-colors"
                      >
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-2 text-sm sm:text-base">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 sm:pt-8 text-center">
            <p className="text-sm sm:text-base">
              &copy; 2025 Bionic Reader. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}