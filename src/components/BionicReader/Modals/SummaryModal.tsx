import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useBionicReader } from '../../../context/BionicReaderContext';
import { X, Sparkles } from 'lucide-react';

export const SummaryModal = () => {
  const { summary, showSummaryModal, setShowSummaryModal } = useBionicReader();

  if (!showSummaryModal || !summary) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">AI Summary</h2>
          </div>
          <button 
            onClick={() => setShowSummaryModal(false)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto prose prose-purple max-w-none">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
            <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};