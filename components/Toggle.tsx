
import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className="block bg-gray-600 w-12 h-6 rounded-full"></div>
        <div className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'transform translate-x-6 bg-cyan-400' : ''}`}></div>
      </div>
    </label>
  );
};
