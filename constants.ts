import type { NeonOptions } from './types';

export const DEFAULT_OPTIONS: NeonOptions = {
  color: '#00ffd5',
  intensity: 8,
  width: 6,
  inner: '#ffffff',
  opacity: 0.85,
  preserveFill: true,
  scaleAware: true,
  multiColor: false,
  midColor: '#ff00d0',
};

export const NEON_PRESETS = [
  { name: 'Cyan', color: '#00ffd5' },
  { name: 'Magenta', color: '#ff00d0' },
  { name: 'Amber', color: '#ffbf00' },
  { name: 'Lime', color: '#a6ff00' },
  { name: 'Electric Blue', color: '#00aeff' },
];

export const SVG_ELEMENTS_SELECTOR = 'path, line, polyline, polygon, rect, circle, ellipse';
