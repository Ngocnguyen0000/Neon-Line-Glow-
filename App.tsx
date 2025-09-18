
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { SvgPreview } from './components/SvgPreview';
import { FileUpload } from './components/FileUpload';
import type { NeonOptions } from './types';
import { DEFAULT_OPTIONS } from './constants';
import { processSvg } from './services/svgProcessor';

export default function App() {
  const [options, setOptions] = useState<NeonOptions>(DEFAULT_OPTIONS);
  const [originalSvg, setOriginalSvg] = useState<string | null>(null);
  const [processedSvg, setProcessedSvg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setOriginalSvg(text);
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      }
      reader.readAsText(file);
    } else {
        setOriginalSvg(null);
        setProcessedSvg(null);
        setWarnings([]);
        setError(null);
    }
  };

  const processAndSetSvg = useCallback(async () => {
    if (!originalSvg) return;

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    // Give browser a moment to update isLoading state before heavy processing
    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      const result = processSvg(originalSvg, options);
      setProcessedSvg(result.svg);
      setWarnings(result.warnings);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during SVG processing.';
      setError(`Processing Error: ${errorMessage}`);
      setProcessedSvg(originalSvg); // Show original on error
    } finally {
      setIsLoading(false);
    }
  }, [originalSvg, options]);

  useEffect(() => {
    processAndSetSvg();
  }, [processAndSetSvg]);

  const handleDownload = () => {
    if (!processedSvg) return;
    const blob = new Blob([processedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neonified.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleClear = () => {
    setOriginalSvg(null);
    setProcessedSvg(null);
    setWarnings([]);
    setError(null);
    setOptions(DEFAULT_OPTIONS);
    // This is a bit of a hack to reset the file input visually
    const fileInput = document.getElementById('svg-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-900 font-sans">
      <Header />
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        <div className="lg:col-span-1 xl:col-span-1 bg-gray-800/50 rounded-lg shadow-2xl p-4 overflow-y-auto">
          <ControlsPanel 
            options={options} 
            setOptions={setOptions} 
            onDownload={handleDownload} 
            onClear={handleClear}
            hasContent={!!originalSvg} 
          />
        </div>
        <div className="lg:col-span-2 xl:col-span-3 bg-gray-800/50 rounded-lg shadow-2xl flex flex-col items-center justify-center p-4 min-h-[60vh] lg:min-h-0">
          {originalSvg ? (
            <SvgPreview svgContent={processedSvg} isLoading={isLoading} />
          ) : (
            <FileUpload onFileChange={handleFileChange} />
          )}
          
          {(warnings.length > 0 || error) && (
            <div className="w-full mt-4 p-3 rounded-lg text-sm bg-gray-900/70 max-h-32 overflow-y-auto">
              {error && <p className="text-red-400 font-semibold mb-2">{error}</p>}
              {warnings.map((warning, index) => (
                <p key={index} className="text-yellow-400">&#9888; {warning}</p>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
