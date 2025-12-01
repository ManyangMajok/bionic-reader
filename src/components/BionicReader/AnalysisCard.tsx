import { useBionicReader } from "../../context/BionicReaderContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { FileText } from "lucide-react";

export const AnalysisCard = () => {
  const { processedText } = useBionicReader();

  if (!processedText) return null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 md:col-span-2 xl:col-span-1 border-0 ring-1 ring-gray-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg xl:text-xl flex items-center gap-2">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          <span className="hidden sm:inline">Document Analysis</span>
          <span className="sm:hidden">Analysis</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm lg:text-base">
          Structure and reading insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200/50">
            <div className="text-2xl font-bold text-blue-600">
              {processedText.structure.totalWords}
            </div>
            <div className="text-xs text-blue-700">Total Words</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200/50">
            <div className="text-2xl font-bold text-green-600">
              {processedText.structure.readingTime}m
            </div>
            <div className="text-xs text-green-700">Reading Time</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Headings</span>
            <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {processedText.structure.headings.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Paragraphs
            </span>
            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {processedText.structure.paragraphs.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Lists</span>
            <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
              {processedText.structure.lists.length}
            </span>
          </div>
        </div>

        {processedText.structure.headings.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Document Outline
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {processedText.structure.headings
                  .slice(0, 5)
                  .map((heading, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 truncate"
                      style={{
                        paddingLeft: `${(heading.level - 1) * 8}px`,
                      }}
                    >
                      {heading.text}
                    </div>
                  ))}
                {processedText.structure.headings.length > 5 && (
                  <div className="text-xs text-gray-400 italic">
                    ...and {processedText.structure.headings.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};