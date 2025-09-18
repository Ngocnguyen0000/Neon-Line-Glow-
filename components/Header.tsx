
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 text-center border-b border-gray-700/50 shadow-lg">
      <h1 className="text-3xl font-bold tracking-wider text-cyan-300 uppercase">
        Neonify SVG
      </h1>
      <p className="text-sm text-gray-400 mt-1">
        Add a brilliant neon glow to your vector graphics instantly.
      </p>
    </header>
  );
};
