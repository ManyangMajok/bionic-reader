import { useBionicReader } from "../../context/BionicReaderContext";
import { BionicReaderHeader } from "./BionicReaderHeader";
import { UploadCard } from "./UploadCard";
import { ControlsCard } from "./ControlsCard";
import { AnalysisCard } from "./AnalysisCard";
import { PreviewCard } from "./PreviewCard";
import { SettingsModal } from "./Modals/SettingsModal";
import { CameraModal } from "./Modals/CameraModal";
import { FileHistoryModal } from "./Modals/FileHistoryModal";
import { FilePreviewModal } from "./Modals/FilePreviewModal";
import { SummaryModal } from "./Modals/SummaryModal"; // <-- NEW IMPORT
import { Zap } from "lucide-react";
import { ChatWidget } from "./ChatWidget"; // <-- 1. IMPORT THIS
import { MindMapModal } from "./Modals/MindMapModal";
import { FocusModal } from "./Modals/FocusModal";

export const BionicReaderLayout = () => {
  const { processedText } = useBionicReader();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <BionicReaderHeader />

      {/* Main Content */}
      <div className="responsive-container py-4 sm:py-6 space-y-4 sm:space-y-6 safe-area-inset-bottom">
        {/* Page Title */}
        <div className="text-center py-4 sm:py-6 lg:py-8">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-3 sm:mb-4">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3 sm:mb-4 px-4">
            <span className="hidden sm:inline">Bionic Text Processor</span>
            <span className="sm:hidden">Bionic Processor</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Transform your documents into bionic reading format for enhanced
            reading speed and comprehension
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <UploadCard />
          <ControlsCard />
          {processedText && <AnalysisCard />}
        </div>

        {processedText && <PreviewCard />}
      </div>

      {/* Modals are rendered here, outside the main layout flow */}
      <SettingsModal />
      <CameraModal />
      <FileHistoryModal />
      <FilePreviewModal />
      <SummaryModal /> {/* <-- NEW MODAL ADDED HERE */}
      <ChatWidget /> {/* <-- 2. ADD THIS HERE */}
      <MindMapModal />
      <FocusModal />
    </div>
  );
};