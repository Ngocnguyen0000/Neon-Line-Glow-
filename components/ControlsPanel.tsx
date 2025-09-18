import React from 'react';
import type { NeonOptions } from '../types';
import { Slider } from './Slider';
import { ColorPicker } from './ColorPicker';
import { Toggle } from './Toggle';
import { NEON_PRESETS, DEFAULT_OPTIONS } from '../constants';

interface ControlsPanelProps {
  options: NeonOptions;
  setOptions: React.Dispatch<React.SetStateAction<NeonOptions>>;
  onDownload: () => void;
  onClear: () => void;
  hasContent: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ options, setOptions, onDownload, onClear, hasContent }) => {
  const handleOptionChange = <K extends keyof NeonOptions,>(key: K, value: NeonOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
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
        <div>
          <label htmlFor="presets" className="block text-sm font-medium text-cyan-300 mb-2">Color Presets</label>
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
        
        <div className="space-y-4 pt-4 border-t border-gray-700">
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
        
        <div className="space-y-4 pt-4 border-t border-gray-700">
            <Slider
              label="Intensity"
              min={1}
              max={30}
              step={1}
              value={options.intensity}
              onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
              displayValue={`${options.intensity}`}
            />
            <Slider
              label="Glow Width"
              min={1}
              max={30}
              step={1}
              value={options.width}
              onChange={(e) => handleOptionChange('width', Number(e.target.value))}
              displayValue={`${options.width}px`}
            />
            <Slider
              label="Opacity"
              min={0.1}
              max={1}
              step={0.05}
              value={options.opacity}
              onChange={(e) => handleOptionChange('opacity', Number(e.target.value))}
              displayValue={`${Math.round(options.opacity * 100)}%`}
            />
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-700">
            <Toggle
                label="Multi-Color Glow"
                checked={options.multiColor}
                onChange={(e) => handleOptionChange('multiColor', e.target.checked)}
            />
            <Toggle
                label="Preserve Original Fill"
                checked={options.preserveFill}
                onChange={(e) => handleOptionChange('preserveFill', e.target.checked)}
            />
            <Toggle
                label="Scale-Aware Intensity"
                checked={options.scaleAware}
                onChange={(e) => handleOptionChange('scaleAware', e.target.checked)}
            />
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
