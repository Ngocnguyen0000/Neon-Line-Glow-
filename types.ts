export interface NeonOptions {
  color: string;
  intensity: number;
  width: number;
  inner: string;
  opacity: number;
  preserveFill: boolean;
  scaleAware: boolean;
  multiColor: boolean;
  midColor: string;
}

export interface ExportOptions {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface ProcessResult {
  svg: string;
  warnings: string[];
}
