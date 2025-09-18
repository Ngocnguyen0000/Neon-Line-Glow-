
import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
        />
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-7 bg-transparent border-none cursor-pointer appearance-none"
          style={{ 'WebkitAppearance': 'none', 'MozAppearance': 'none' }}
        />
      </div>
    </div>
  );
};
