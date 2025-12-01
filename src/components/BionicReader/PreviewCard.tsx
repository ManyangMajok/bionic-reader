import { useBionicReader } from "@/context/BionicReaderContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Settings, 
  EyeOff, 
  Image, 
  Sparkles, 
  Volume2, 
  Loader2,
  Network, 
  Zap,
  Maximize2, // New Icon for Expand
  Minimize2  // New Icon for Collapse
} from "lucide-react"; 

// Helper styles for Themes
const themeStyles: Record<string, string> = {
  light: "bg-white text-gray-800",
  sepia: "bg-[#f4ecd8] text-[#5b4636]",
  slate: "bg-slate-100 text-slate-800",
  dark: "bg-gray-900 text-gray-200"
};

// Helper styles for Column Widths
const widthStyles: Record<string, string> = {
  narrow: "max-w-[600px]",
  medium: "max-w-[800px]",
  wide: "max-w-[1000px]",
  full: "max-w-none"
};

export const PreviewCard = () => {
  const {
    processedText,
    file,
    showOriginal,
    setShowOriginal,
    setShowSettings,
    readingSettings,
    // --- AI & Features ---
    getSummary,
    isSummarizing,
    getSpeech,
    isGeneratingSpeech,
    audioURL,
    getMindMap,
    isGeneratingMindMap,
    setShowFocusModal,
    // --- Full Mode ---
    isFullMode,     
    setIsFullMode   
  } = useBionicReader();

  if (!processedText) return null;

  // Default to light/medium if settings are undefined (safety check)
  const currentTheme = readingSettings.theme && themeStyles[readingSettings.theme] 
    ? themeStyles[readingSettings.theme] 
    : themeStyles.light;
    
  const currentWidth = readingSettings.columnWidth && widthStyles[readingSettings.columnWidth]
    ? widthStyles[readingSettings.columnWidth]
    : widthStyles.medium;

  return (
    <Card 
      className={`
        transition-all duration-300 border-0 shadow-xl
        ${isFullMode 
            ? "fixed inset-0 z-50 h-screen w-screen rounded-none ring-0 flex flex-col" 
            : "bg-white/80 backdrop-blur-sm hover:shadow-2xl md:col-span-2 xl:col-span-3 ring-1 ring-gray-200/50"
        }
        ${isFullMode ? currentTheme : ""} 
      `}
    >
      <CardHeader className={`pb-4 ${isFullMode ? "border-b border-gray-200/10 shrink-0" : ""}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg xl:text-xl flex items-center gap-2">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Enhanced Preview</span>
              {file?.name.includes("camera-capture") && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1 flex-shrink-0">
                  <Image className="h-3 w-3" />
                  <span className="hidden xs:inline">From Image</span>
                  <span className="xs:hidden">IMG</span>
                </span>
              )}
            </CardTitle>
            <CardDescription className={`text-xs sm:text-sm lg:text-base mt-1 ${isFullMode ? "opacity-80" : ""}`}>
              {showOriginal
                ? "Original text with structure detection"
                : "Bionic reading format with enhanced formatting"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Full Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullMode(!isFullMode)}
              className={`flex items-center gap-2 mobile-tap-target ${isFullMode ? "bg-transparent border-current hover:bg-white/10" : ""}`}
              title={isFullMode ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline text-xs sm:text-sm">
                {isFullMode ? "Minimize" : "Maximize"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
              className={`flex items-center gap-2 mobile-tap-target ${isFullMode ? "bg-transparent border-current hover:bg-white/10" : ""}`}
            >
              {showOriginal ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="hidden sm:inline text-xs sm:text-sm">
                {showOriginal ? "Show Processed" : "Show Original"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className={`flex items-center gap-2 mobile-tap-target ${isFullMode ? "bg-transparent border-current hover:bg-white/10" : ""}`}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">
                Settings
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={isFullMode ? "flex-1 overflow-hidden p-0 flex flex-col" : ""}>
        {/* Feature Toolbar */}
        <div className={`mb-4 flex flex-wrap items-center gap-3 ${isFullMode ? "p-4 border-b border-gray-200/10 shrink-0" : ""}`}>
            <Button
                onClick={() => getSummary(processedText.original)}
                disabled={isSummarizing}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-sm"
                size="sm"
            >
                {isSummarizing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                Summarize
            </Button>

            <Button
                onClick={() => getSpeech(processedText.original)}
                disabled={isGeneratingSpeech}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm"
                size="sm"
            >
                {isGeneratingSpeech ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Volume2 className="w-4 h-4 mr-2"/>}
                Listen
            </Button>

            <Button
                onClick={() => getMindMap(processedText.original)}
                disabled={isGeneratingMindMap}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm"
                size="sm"
            >
                {isGeneratingMindMap ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Network className="w-4 h-4 mr-2"/>}
                Mind Map
            </Button>

            <Button
                onClick={() => setShowFocusModal(true)}
                className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm border border-gray-900"
                size="sm"
            >
                <Zap className="w-4 h-4 mr-2" fill="currentColor" />
                Focus Mode
            </Button>

            {audioURL && (
                <div className="flex-1 min-w-[200px] animate-in fade-in slide-in-from-left-2 duration-300">
                    <audio controls src={audioURL} className="w-full h-8 rounded-full bg-gray-50" />
                </div>
            )}
        </div>

        {/* Text Content Container */}
        <div className={`
            overflow-y-auto custom-scrollbar transition-colors duration-300
            ${isFullMode 
                ? `flex-1 w-full p-8 sm:p-12 lg:p-16 ${currentTheme}` 
                : `max-h-48 sm:max-h-64 md:max-h-80 lg:max-h-96 xl:max-h-[32rem] p-4 sm:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border border-gray-200/50 shadow-inner ${currentTheme}`
            }
        `}>
          <div
            className={`
                whitespace-pre-wrap font-medium mx-auto transition-all duration-300
                ${currentWidth}
            `}
            style={{
              fontSize: `${Math.max(14, readingSettings.textSize - 2)}px`,
              fontFamily: readingSettings.fontFamily,
              lineHeight: readingSettings.lineSpacing,
              letterSpacing: `${readingSettings.letterSpacing}px`,
              // Color is handled by classNames based on theme
            }}
            dangerouslySetInnerHTML={{
              __html: showOriginal
                ? processedText.original.replace(/\n/g, "<br>")
                : processedText.processed.replace(/\n/g, "<br>"),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};