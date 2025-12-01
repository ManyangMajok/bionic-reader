import { useBionicReader } from "../../../context/BionicReaderContext";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { X, AlertCircle, Camera, CheckCircle } from "lucide-react";

export const CameraModal = () => {
  const {
    showCamera,
    stopCamera,
    capturedImage,
    videoRef,
    captureImage,
    setCapturedImage,
    processImageOCR,
    isOCRProcessing,
    ocrProgress,
    canvasRef,
  } = useBionicReader();

  if (!showCamera) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Capture Text</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={stopCamera}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          {!capturedImage ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Tips for Best Results
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure good lighting - avoid shadows and glare</li>
                  <li>• Hold the camera steady and parallel to the text</li>
                  <li>• Keep text clearly visible and in focus</li>
                </ul>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-96 object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 rounded-lg pointer-events-none" />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={captureImage}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Capture Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCapturedImage(null)}
                  disabled={isOCRProcessing}
                >
                  Retake
                </Button>
                <Button
                  onClick={() => processImageOCR(capturedImage)}
                  disabled={isOCRProcessing}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isOCRProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Extract Text
                    </>
                  )}
                </Button>
              </div>

              {isOCRProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Extracting text...
                    </span>
                    <span className="text-sm text-gray-600">
                      {ocrProgress}%
                    </span>
                  </div>
                  <Progress value={ocrProgress} className="w-full" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};