import { useNavigate } from "react-router-dom";
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
import { Slider } from "../ui/slider";
import { Separator } from "../ui/separator";
import { Download, Eye, EyeOff, History } from "lucide-react";

export const ControlsCard = () => {
  const {
    processedText,
    boldIntensity,
    handleIntensityChange,
    showOriginal,
    setShowOriginal,
    user,
    loadFileHistory,
    setShowFileHistory,
    saveSessionState,
    handleDownloadPDF,
  } = useBionicReader();
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-0 ring-1 ring-gray-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">
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

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => setShowOriginal(!showOriginal)}
            disabled={!processedText}
            className="flex items-center justify-center gap-2 w-full hover:bg-gray-50 mobile-tap-target"
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

          <Button
            variant="outline"
            onClick={() => {
              if (!user) {
                toast({
                  title: "Sign in required",
                  description: "Please sign in to view your file history.",
                });
                navigate("/login");
              } else {
                loadFileHistory();
                setShowFileHistory(true);
              }
            }}
            className="flex items-center justify-center gap-2 w-full hover:bg-gray-50 mobile-tap-target"
          >
            <History className="h-4 w-4" />
            <span className="text-sm sm:text-base">File History</span>
          </Button>

          <Button
            onClick={() => {
              if (!user) {
                saveSessionState();
                toast({
                  title: "Sign in required",
                  description:
                    "Please sign in to download. Your work will be saved.",
                });
                navigate("/login");
              } else {
                handleDownloadPDF();
              }
            }}
            disabled={!processedText}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mobile-tap-target"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm sm:text-base">
              {!user ? (
                <>
                  <span className="hidden sm:inline">Sign in to Download</span>
                  <span className="sm:hidden">Sign in to Download</span>
                </>
              ) : (
                "Download PDF"
              )}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};