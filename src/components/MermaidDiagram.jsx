import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { downloadAsPNG, downloadAsPDF, downloadMermaidCode } from '../services/downloadService';

const MermaidDiagram = ({ code, filename = 'diagram' }) => {
  const containerRef = useRef(null);
  const diagramRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mermaid diagram render karna
  useEffect(() => {
    if (!code) return;
    
    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Mermaid script load karna agar nahi hai to
        if (!window.mermaid) {
          await loadMermaidScript();
        }
        
        // Diagram render karna
        const { svg } = await window.mermaid.render('mermaid-diagram', code);
        diagramRef.current.innerHTML = svg;
        
        // Zoom apply karna
        const svgElement = diagramRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    renderDiagram();
  }, [code]);

  // Mermaid script load karna
  const loadMermaidScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      script.onload = () => {
        window.mermaid.initialize({
          startOnLoad: true,
          theme: 'dark',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true }
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Fullscreen change listen karna
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Zoom apply karna
  useEffect(() => {
    const svg = diagramRef.current?.querySelector('svg');
    if (svg) {
      svg.style.transform = `scale(${zoom})`;
      svg.style.transformOrigin = 'center';
      svg.style.transition = 'transform 0.3s';
    }
  }, [zoom]);

  return (
    <div 
      ref={containerRef}
      className="relative bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden"
      style={{ height: isFullscreen ? '100vh' : '600px' }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
          title="Reset Zoom"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        
        {/* Download dropdown */}
        <div className="relative group">
          <button className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white">
            <Download className="w-4 h-4" />
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button
              onClick={() => downloadAsPNG('diagram-container', filename)}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
            >
              Download as PNG
            </button>
            <button
              onClick={() => downloadAsPDF('diagram-container', filename)}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
            >
              Download as PDF
            </button>
            <button
              onClick={() => downloadMermaidCode(code, filename)}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
            >
              Download Mermaid Code
            </button>
          </div>
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-slate-700/80 rounded-lg text-white text-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* Diagram container */}
      <div 
        id="diagram-container"
        className="w-full h-full overflow-auto p-4 flex items-center justify-center"
        style={{ backgroundColor: '#1e293b' }}
      >
        {isLoading && (
          <div className="text-cyan-400 animate-pulse">Loading diagram...</div>
        )}
        
        {error && (
          <div className="text-red-400">Error: {error}</div>
        )}
        
        <div ref={diagramRef} className="transition-transform" />
      </div>
    </div>
  );
};

export default MermaidDiagram;