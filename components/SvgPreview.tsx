
import React from 'react';

interface SvgPreviewProps {
  svgContent: string | null;
  isLoading: boolean;
  backgroundColor: string;
  backgroundImageUrl: string | null;
}

export const SvgPreview: React.FC<SvgPreviewProps> = ({ svgContent, isLoading, backgroundColor, backgroundImageUrl }) => {
  const previewStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center rounded-md p-4 transition-colors" style={previewStyle}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 rounded-md">
          <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <div
        className="max-w-full max-h-full"
        dangerouslySetInnerHTML={{ __html: svgContent || '' }}
      />
    </div>
  );
};
