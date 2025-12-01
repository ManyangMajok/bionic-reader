import { useCallback } from "react";
import { useBionicReader } from "../../context/BionicReaderContext";
import { useToast } from "../ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Upload, FileText, Camera, Image } from "lucide-react";

export const UploadCard = () => {
  const {
    file,
    handleFileUpload,
    startCamera,
    isProcessing,
    isOCRProcessing,
  } = useBionicReader();
  const { toast } = useToast();

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

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-0 ring-1 ring-gray-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Upload className="h-5 w-5 text-blue-600" />
          Upload or Capture
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Upload files or capture text from images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 lg:p-12 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group relative overflow-hidden mobile-tap-target"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gray-400 group-hover:text-blue-500 mx-auto mb-3 sm:mb-4 lg:mb-6 transition-all duration-300 group-hover:scale-110" />
            <p className="text-gray-700 mb-2 text-sm sm:text-base lg:text-lg font-semibold">
              {file && !file.name.includes("camera-capture")
                ? file.name
                : "Drop your file here or click to browse"}
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-gray-500">
              Supports PDF, DOCX, TXT, and image files (Max 10MB)
            </p>
          </div>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileUpload(selectedFile);
            }}
          />
        </div>

        {/* Camera and Image Upload Options */}
        <div className="flex items-center justify-center">
          <span className="text-sm text-gray-500 px-3">OR</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={startCamera}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 mobile-tap-target"
            disabled={isProcessing || isOCRProcessing}
          >
            <Camera className="h-4 w-4" />
            <span className="hidden xs:inline">Capture Text from Camera</span>
            <span className="xs:hidden">Capture Text</span>
          </Button>

          <Button
            onClick={() => document.getElementById("image-input")?.click()}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-gray-50 mobile-tap-target"
            disabled={isProcessing || isOCRProcessing}
          >
            <Image className="h-4 w-4" />
            <span className="hidden xs:inline">Upload Image for OCR</span>
            <span className="xs:hidden">Upload Image</span>
          </Button>

          <input
            id="image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile && selectedFile.type.startsWith("image/")) {
                handleFileUpload(selectedFile);
              } else {
                toast({
                  title: "Invalid file type",
                  description: "Please select an image file.",
                  variant: "destructive",
                });
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};