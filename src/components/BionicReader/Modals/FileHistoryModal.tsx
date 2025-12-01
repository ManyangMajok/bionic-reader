import { useBionicReader } from "../../../context/BionicReaderContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { History, Search, FileText, Calendar, Trash2, Download } from "lucide-react";

export const FileHistoryModal = () => {
  const {
    showFileHistory,
    setShowFileHistory,
    fileHistory,
    historySearchTerm,
    setHistorySearchTerm,
    setSelectedHistoryFile,
    deleteFileFromHistory,
  } = useBionicReader();

  return (
    <Dialog open={showFileHistory} onOpenChange={setShowFileHistory}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            File History
          </DialogTitle>
          <DialogDescription>
            View and preview your previously processed files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* File List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {fileHistory
              .filter((file) =>
                file.file_name
                  .toLowerCase()
                  .includes(historySearchTerm.toLowerCase()),
              )
              .map((file) => (
                <div
                  key={file.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedHistoryFile(file)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {file.file_name}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {file.bold_intensity}% intensity
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(file.created_at).toLocaleDateString()}
                        </div>
                        {file.file_size && (
                          <span>{Math.round(file.file_size / 1024)} KB</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Simple text download
                          const blob = new Blob(
                            [
                              file.processed_text.replace(
                                /<\/?strong>/g,
                                "",
                              ),
                            ],
                            { type: "text/plain" },
                          );
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `bionic-${file.file_name}`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFileFromHistory(file.id, file.file_name);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            {fileHistory.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files processed yet</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};