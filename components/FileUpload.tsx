
import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if(e.dataTransfer.files[0].type === "image/svg+xml"){
        onFileChange(e.dataTransfer.files[0]);
      } else {
        alert("Please upload a valid SVG file.");
      }
    }
  }, [onFileChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`w-full max-w-lg h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600'}`}
    >
      <input
        type="file"
        id="svg-upload"
        accept="image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />
      <label htmlFor="svg-upload" className="cursor-pointer text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p className="mt-4 text-lg font-semibold text-cyan-300">
          Upload an SVG file
        </p>
        <p className="mt-1 text-sm text-gray-400">
          or drag and drop
        </p>
      </label>
    </div>
  );
};
