import React, { useRef, useState, useEffect } from 'react';
import { useBionicReader } from '../../../context/BionicReaderContext';
import { X, Network, Download, Loader2, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { MermaidDiagram } from '../MermaidDiagram';
import { Button } from '../../ui/button';

export const MindMapModal = () => {
  const { mindMapCode, showMindMapModal, setShowMindMapModal, file } = useBionicReader();
  const [isExporting, setIsExporting] = useState(false);
  
  // Pan & Zoom State
  // Default scale increased to 3 (300%) as requested
  const [scale, setScale] = useState(3);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset view when modal opens
  useEffect(() => {
    if (showMindMapModal) {
      // Start at 300% scale
      setScale(3);
      setPosition({ x: 0, y: 0 });
    }
  }, [showMindMapModal, mindMapCode]);

  if (!showMindMapModal || !mindMapCode) return null;

  // --- Zoom Handlers ---
  const handleZoom = (delta: number) => {
    // Proportional button zoom
    setScale(prev => Math.min(Math.max(0.1, prev * (1 + delta)), 15)); // Increased max zoom limit
  };

  const resetView = () => {
    setScale(3); // Reset to new default of 3
    setPosition({ x: 0, y: 0 });
  };

  // --- Drag/Pan Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- Wheel Zoom Handler (Standardized) ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Standardize zoom sensitivity
    const zoomSensitivity = 0.001;
    
    // Calculate new scale using multiplicative logic for natural feel
    const delta = -e.deltaY * zoomSensitivity;
    
    // Scale factor: 1.1 for zoom in, 0.9 for zoom out approx
    const newScale = Math.min(Math.max(0.1, scale * (1 + delta)), 15);
    
    setScale(newScale);
  };

  // --- Export Logic (Fixed for Full Diagram) ---
  const handleDownloadImage = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);

    try {
      const svgElement = contentRef.current.querySelector('svg');
      if (!svgElement) throw new Error("Diagram not found");

      // 1. Get Natural Dimensions from viewBox to ensure full export
      const viewBox = svgElement.getAttribute('viewBox');
      let width = 800; 
      let height = 600;

      if (viewBox) {
        const parts = viewBox.split(' ').map(parseFloat);
        if (parts.length === 4) {
            width = parts[2];
            height = parts[3];
        }
      } else {
        // Fallback if viewBox isn't set, get bounding box
        const bbox = svgElement.getBoundingClientRect();
        // Adjust for current scale to get "real" unscaled dimensions
        width = bbox.width / scale; 
        height = bbox.height / scale;
      }

      // 2. Clone SVG to manipulate for export (remove zoom transforms, set fixed size)
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute('width', width.toString());
      clonedSvg.setAttribute('height', height.toString());
      clonedSvg.style.maxWidth = 'none'; // Critical: Remove mermaid's constraints
      clonedSvg.style.width = `${width}px`;
      clonedSvg.style.height = `${height}px`;
      
      // Serialize
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
      const imageSrc = `data:image/svg+xml;base64,${svgBase64}`;

      const img = new Image();
      
      img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            const exportScale = 3; // Even Higher resolution export
            canvas.width = width * exportScale;
            canvas.height = height * exportScale;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Canvas context failed");
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.scale(exportScale, exportScale);
            ctx.drawImage(img, 0, 0, width, height);

            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `mindmap-${file?.name || 'export'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (e) {
            console.warn("PNG export failed, falling back to SVG.", e);
            // SVG Fallback
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `mindmap-${file?.name || 'export'}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
      };
      
      img.onerror = () => {
          console.error("Failed to load SVG for export");
          setIsExporting(false);
      };

      img.src = imageSrc;

    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header with Controls */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
                <Network className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="hidden sm:block">
                <h2 className="text-xl font-bold text-gray-800">Concept Map</h2>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <Button variant="ghost" size="icon" onClick={() => handleZoom(-0.2)} title="Zoom Out" className="h-8 w-8">
                <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-mono w-12 text-center text-gray-600">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => handleZoom(0.2)} title="Zoom In" className="h-8 w-8">
                <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <Button variant="ghost" size="icon" onClick={resetView} title="Reset View" className="h-8 w-8">
                <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <button 
            onClick={() => setShowMindMapModal(false)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagram Area - Scrollable / Pannable */}
        <div 
            ref={containerRef}
            className={`flex-1 overflow-hidden bg-slate-50 relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Visual Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', 
                    backgroundSize: `${20 * scale}px ${20 * scale}px`, // Scale grid with content
                    transform: `translate(${position.x}px, ${position.y}px)`, // Move grid but don't scale via transform to keep dots sharp
                    transformOrigin: '0 0'
                }} 
            />

            <div 
                ref={contentRef}
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    willChange: 'transform',
                    // Using 'zoom' instead of transform sometimes helps with sharpness in non-Firefox browsers,
                    // but standard vector scaling should be handled by the browser correctly if it's an SVG.
                    // Ensuring backface-visibility is hidden often helps antialiasing.
                    backfaceVisibility: 'hidden',
                }}
                className="w-full h-full flex items-center justify-center p-10"
            >
                <div className="pointer-events-none select-none"> {/* Prevent text selection while panning */}
                    <MermaidDiagram code={mindMapCode} />
                </div>
            </div>
            
            {/* Helper Text */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded pointer-events-none flex items-center gap-1 shadow-sm">
                <Move className="w-3 h-3" /> Drag to pan • Scroll to zoom
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl flex justify-end items-center z-10">
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => setShowMindMapModal(false)}
                >
                    Close
                </Button>
                <Button
                    onClick={handleDownloadImage}
                    disabled={isExporting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Image
                        </>
                    )}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};