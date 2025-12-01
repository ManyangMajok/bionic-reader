import React from 'react';
import { useBionicReader } from '../../../context/BionicReaderContext';
import { X, Zap } from 'lucide-react';
import { RSVPReader } from '../RSVPReader';

export const FocusModal = () => {
  const { showFocusModal, setShowFocusModal, processedText } = useBionicReader();

  if (!showFocusModal || !processedText) return null;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in fade-in duration-200">
      
      {/* Minimal Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-black rounded-lg">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <div>
              <h2 className="text-lg font-bold text-gray-900 leading-none">Focus Flow</h2>
              <p className="text-xs text-gray-500">Speed Reading + Brown Noise</p>
          </div>
        </div>
        <button 
          onClick={() => setShowFocusModal(false)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 bg-gray-50 flex items-center justify-center">
         <div className="w-full max-w-4xl h-[70vh] bg-white rounded-2xl shadow-xl overflow-hidden">
            <RSVPReader 
                text={processedText.original} 
                onClose={() => setShowFocusModal(false)} 
            />
         </div>
      </div>
    </div>
  );
};