
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { SvgPreview } from './components/SvgPreview';
import { FileUpload } from './components/FileUpload';
import type { NeonOptions, ExportOptions } from './types';
import { DEFAULT_OPTIONS, DEFAULT_EXPORT_OPTIONS } from './constants';
import { processSvg } from './services/svgProcessor';

export default function App() {
  const [options, setOptions] = useState<NeonOptions>(DEFAULT_OPTIONS);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

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

  const handleBackgroundImageChange = (file: File | null) => {
    if (backgroundImageUrl) {
      URL.revokeObjectURL(backgroundImageUrl);
    }

    if (file) {
      setBackgroundImageFile(file);
      setBackgroundImageUrl(URL.createObjectURL(file));
    } else {
      setBackgroundImageFile(null);
      setBackgroundImageUrl(null);
    }
  };


  const processAndSetSvg = useCallback(async () => {
    if (!originalSvg) return;

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      const result = processSvg(originalSvg, options);
      setProcessedSvg(result.svg);
      setWarnings(result.warnings);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during SVG processing.';
      setError(`Processing Error: ${errorMessage}`);
      setProcessedSvg(originalSvg);
    } finally {
      setIsLoading(false);
    }
  }, [originalSvg, options]);

  useEffect(() => {
    processAndSetSvg();
  }, [processAndSetSvg]);

  const handleDownload = async () => {
    if (!processedSvg) return;

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    let bgImageElement = '';
    if (backgroundImageFile) {
        try {
            const base64 = await toBase64(backgroundImageFile);
            bgImageElement = `<image href="${base64}" x="0" y="0" height="100%" width="100%" preserveAspectRatio="xMidYMid slice" />`;
        } catch (err) {
            console.error("Error converting background image to base64", err);
            setError("Could not process the background image for download.");
            return;
        }
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(processedSvg, "image/svg+xml");
    const originalSvgNode = doc.querySelector('svg');

    if (!originalSvgNode) {
        setError("Could not parse the generated SVG for download.");
        return;
    }

    const innerSvgContent = originalSvgNode.innerHTML;
    const originalViewBox = originalSvgNode.getAttribute('viewBox') || `0 0 ${exportOptions.width} ${exportOptions.height}`;

    const finalSvgString = `<svg width="${exportOptions.width}" height="${exportOptions.height}" viewBox="0 0 ${exportOptions.width} ${exportOptions.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="100%" height="100%" fill="${exportOptions.backgroundColor}" />
  ${bgImageElement}
  <svg x="0" y="0" width="100%" height="100%" viewBox="${originalViewBox}" preserveAspectRatio="xMidYMid meet">
    ${innerSvgContent}
  </svg>
</svg>`;

    const blob = new Blob([finalSvgString.trim()], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neonified-export.svg';
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
    setExportOptions(DEFAULT_EXPORT_OPTIONS);
    handleBackgroundImageChange(null);
    
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
            exportOptions={exportOptions}
            setExportOptions={setExportOptions}
            onBackgroundImageChange={handleBackgroundImageChange}
            backgroundImageFile={backgroundImageFile}
            onDownload={handleDownload} 
            onClear={handleClear}
            hasContent={!!originalSvg} 
          />
        </div>
        <div className="lg:col-span-2 xl:col-span-3 bg-gray-800/50 rounded-lg shadow-2xl flex flex-col items-center justify-center p-4 min-h-[60vh] lg:min-h-0">
          {originalSvg ? (
            <SvgPreview 
              svgContent={processedSvg} 
              isLoading={isLoading} 
              backgroundColor={exportOptions.backgroundColor}
              backgroundImageUrl={backgroundImageUrl}
            />
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
