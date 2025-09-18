import React from 'react';
import type { NeonOptions, ExportOptions } from '../types';
import { Slider } from './Slider';
import { ColorPicker } from './ColorPicker';
import { Toggle } from './Toggle';
import { NEON_PRESETS } from '../constants';

interface ControlsPanelProps {
  options: NeonOptions;
  setOptions: React.Dispatch<React.SetStateAction<NeonOptions>>;
  exportOptions: ExportOptions;
  setExportOptions: React.Dispatch<React.SetStateAction<ExportOptions>>;
  onBackgroundImageChange: (file: File | null) => void;
  backgroundImageFile: File | null;
  onDownload: () => void;
  onClear: () => void;
  hasContent: boolean;
}

const NumberInput: React.FC<{label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={onChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">px</span>
        </div>
    </div>
);


export const ControlsPanel: React.FC<ControlsPanelProps> = ({ options, setOptions, exportOptions, setExportOptions, onBackgroundImageChange, backgroundImageFile, onDownload, onClear, hasContent }) => {
  const handleOptionChange = <K extends keyof NeonOptions,>(key: K, value: NeonOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  const handleExportOptionChange = <K extends keyof ExportOptions,>(key: K, value: ExportOptions[K]) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedColor = e.target.value;
    if (selectedColor) {
      handleOptionChange('color', selectedColor);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-5 overflow-y-auto pr-2">
        
        {/* Glow Settings */}
        <h3 className="text-lg font-semibold text-cyan-200 tracking-wide">Glow Settings</h3>
        <div>
          <label htmlFor="presets" className="block text-sm font-medium text-gray-300 mb-2">Color Presets</label>
          <select 
            id="presets"
            value={options.color}
            onChange={handlePresetChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          >
            {NEON_PRESETS.map(preset => (
              <option key={preset.name} value={preset.color}>{preset.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                    label={options.multiColor ? "Outer Glow" : "Glow Color"}
                    value={options.color}
                    onChange={(e) => handleOptionChange('color', e.target.value)}
                />
                <ColorPicker
                    label="Inner Core"
                    value={options.inner}
                    onChange={(e) => handleOptionChange('inner', e.target.value)}
                />
            </div>
            {options.multiColor && (
                <div className="mt-4">
                    <ColorPicker
                        label="Mid Glow"
                        value={options.midColor}
                        onChange={(e) => handleOptionChange('midColor', e.target.value)}
                    />
                </div>
            )}
        </div>
        <div className="space-y-4">
            <Slider
              label="Intensity" min={1} max={30} step={1} value={options.intensity}
              onChange={(e) => handleOptionChange('intensity', Number(e.target.value))} displayValue={`${options.intensity}`}
            />
            <Slider
              label="Glow Width" min={1} max={30} step={1} value={options.width}
              onChange={(e) => handleOptionChange('width', Number(e.target.value))} displayValue={`${options.width}px`}
            />
            <Slider
              label="Opacity" min={0.1} max={1} step={0.05} value={options.opacity}
              onChange={(e) => handleOptionChange('opacity', Number(e.target.value))} displayValue={`${Math.round(options.opacity * 100)}%`}
            />
        </div>
        <div className="space-y-3">
            <Toggle label="Multi-Color Glow" checked={options.multiColor} onChange={(e) => handleOptionChange('multiColor', e.target.checked)} />
            <Toggle label="Preserve Original Fill" checked={options.preserveFill} onChange={(e) => handleOptionChange('preserveFill', e.target.checked)} />
            <Toggle label="Scale-Aware Intensity" checked={options.scaleAware} onChange={(e) => handleOptionChange('scaleAware', e.target.checked)} />
        </div>
        
        {/* Export Settings */}
        <div className="space-y-4 pt-5 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-cyan-200 tracking-wide">Export Settings</h3>
            <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Width" value={exportOptions.width} onChange={e => handleExportOptionChange('width', Number(e.target.value))} />
                <NumberInput label="Height" value={exportOptions.height} onChange={e => handleExportOptionChange('height', Number(e.target.value))} />
            </div>
             <ColorPicker label="Background Color" value={exportOptions.backgroundColor} onChange={e => handleExportOptionChange('backgroundColor', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Background Image</label>
              <div className="flex items-center space-x-2">
                <label className="flex-grow w-full truncate cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-md transition-colors text-center">
                  <span className="truncate block">{backgroundImageFile ? backgroundImageFile.name : 'Choose file...'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => onBackgroundImageChange(e.target.files ? e.target.files[0] : null)} />
                </label>
                {backgroundImageFile && (
                  <button onClick={() => onBackgroundImageChange(null)} className="flex-shrink-0 p-2 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors" aria-label="Remove background image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
        </div>
      </div>

      <div className="flex-shrink-0 pt-6 border-t border-gray-700 space-y-3">
        <button
          onClick={onDownload}
          disabled={!hasContent}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          Download SVG
        </button>
        <button
          onClick={onClear}
          disabled={!hasContent}
          className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
