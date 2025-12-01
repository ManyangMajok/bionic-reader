import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid settings
mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#eff6ff', // blue-50
    primaryTextColor: '#1e40af', // blue-800
    primaryBorderColor: '#3b82f6', // blue-500
    lineColor: '#64748b', // slate-500
    secondaryColor: '#f3e8ff', // purple-50
    tertiaryColor: '#fff',
  }
});

export const MermaidDiagram = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    if (code && ref.current) {
      const renderDiagram = async () => {
        try {
          // Generate unique ID to prevent DOM collision
          const id = `mermaid-${Date.now()}`;
          // Render the SVG
          const { svg } = await mermaid.render(id, code);
          setSvg(svg);
        } catch (error) {
          console.error("Mermaid render failed:", error);
          // Fallback error message in UI
          setSvg('<div class="text-red-500 p-4 text-sm border border-red-200 bg-red-50 rounded">Failed to render diagram. The AI code might be invalid.</div>');
        }
      };
      renderDiagram();
    }
  }, [code]);

  return (
    <div 
      ref={ref}
      className="w-full overflow-x-auto flex justify-center p-4 min-h-[300px]" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};