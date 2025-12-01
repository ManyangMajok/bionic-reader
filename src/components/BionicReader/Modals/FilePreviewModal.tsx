import { useBionicReader } from "../../../context/BionicReaderContext";
import { analyzeTextStructure } from "../../../lib/bionicProcessor";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { FileText, Download } from "lucide-react";

export const FilePreviewModal = () => {
  const {
    selectedHistoryFile,
    setSelectedHistoryFile,
    setProcessedText,
    setBoldIntensity,
    setFile,
    setShowFileHistory,
  } = useBionicReader();
  const { toast } = useToast();

  return (
    <Dialog
      open={!!selectedHistoryFile}
      onOpenChange={() => setSelectedHistoryFile(null)}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {selectedHistoryFile?.file_name}
          </DialogTitle>
          <DialogDescription>
            Preview of processed file with{" "}
            {selectedHistoryFile?.bold_intensity}% intensity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!selectedHistoryFile) return;
                  const structure = analyzeTextStructure(
                    selectedHistoryFile.original_text,
                  );
                  setProcessedText({
                    original: selectedHistoryFile.original_text,
                    processed: selectedHistoryFile.processed_text,
                    structure,
                  });
                  setBoldIntensity([selectedHistoryFile.bold_intensity]);

                  const mockFile = new File(
                    [selectedHistoryFile.original_text],
                    selectedHistoryFile.file_name,
                    { type: "text/plain" },
                  );
                  setFile(mockFile);

                  setSelectedHistoryFile(null);
                  setShowFileHistory(false);

                  toast({
                    title: "File loaded",
                    description: "File has been loaded back into the editor.",
                  });
                }}
              >
                Load into Editor
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!selectedHistoryFile) return;
                  // Simple text download
                  const blob = new Blob(
                    [
                      selectedHistoryFile.processed_text.replace(
                        /<\/?strong>/g,
                        "",
                      ),
                    ],
                    { type: "text/plain" },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `bionic-${selectedHistoryFile.file_name}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download TXT
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/50 shadow-inner">
            <div
              className="whitespace-pre-wrap font-medium text-gray-700"
              style={{
                fontSize: "16px",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.5,
              }}
              dangerouslySetInnerHTML={{
                __html:
                  selectedHistoryFile?.processed_text?.replace(
                    /\n/g,
                    "<br>",
                  ) || "",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};