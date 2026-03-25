// Type definitions for the skill (optional, but helpful)
export interface DwgConvertParams {
  input_path: string;
  output_path?: string;
  background?: string;
  antialiasing?: boolean;
  dpi?: number;
}

export interface DwgConvertResult {
  success: boolean;
  output_path?: string;
  error?: string;
}

export interface DwgConvertBatchParams {
  input_pattern: string;
  output_dir: string;
  background?: string;
  antialiasing?: boolean;
  dpi?: number;
}

export interface DwgConvertBatchResult {
  success: boolean;
  converted: string[];
  errors: { input: string; error: string }[];
}
