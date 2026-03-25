import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

/**
 * DWG to PNG Converter using QCAD's dwg2bmp tool
 *
 * Prerequisites:
 * - QCAD must be installed
 * - On Windows: dwg2bmp.bat in PATH or QCAD install dir
 * - On Linux/macOS: dwg2bmp in PATH
 */

export async function dwg_convert(params: {
  input_path: string;
  output_path?: string;
  background?: string;
  antialiasing?: boolean;
  dpi?: number;
}): Promise<{ success: boolean; output_path?: string; error?: string }> {
  const {
    input_path,
    output_path,
    background = 'white',
    antialiasing = true,
    dpi = 150,
  } = params;

  // Validate input file exists
  if (!fs.existsSync(input_path)) {
    return { success: false, error: `Input file not found: ${input_path}` };
  }

  // Determine output path
  const outPath = output_path || path.join(
    path.dirname(input_path),
    path.basename(input_path, path.extname(input_path)) + '.png'
  );

  // Build command arguments
  const args: string[] = [];

  // Antialiasing
  if (antialiasing) {
    args.push('-a');
  }

  // Background color
  if (background) {
    args.push('-b', background);
  }

  // DPI/Size
  if (dpi) {
    args.push('-r', dpi.toString());
  }

  // Add input and output
  args.push(input_path, outPath);

  // Build command
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'dwg2bmp.bat' : 'dwg2bmp';
  const command = `${cmd} ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large drawings
    });

    // Check if output file was created
    if (fs.existsSync(outPath)) {
      return { success: true, output_path: outPath };
    } else {
      return { success: false, error: `Conversion completed but output not found: ${outPath}. Stderr: ${stderr}` };
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Conversion failed: ${err.message || err}. Stderr: ${err.stderr || ''}`,
    };
  }
}

export async function dwg_convert_batch(params: {
  input_pattern: string;
  output_dir: string;
  background?: string;
  antialiasing?: boolean;
  dpi?: number;
}): Promise<{ success: boolean; converted: string[]; errors: { input: string; error: string }[] }> {
  const {
    input_pattern,
    output_dir,
    background = 'white',
    antialiasing = true,
    dpi = 150,
  } = params;

  // Ensure output directory exists
  if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir, { recursive: true });
  }

  // Find matching files
  // Simple glob implementation using minimatch would be better but keeping it simple
  const files = globSync(input_pattern);
  const converted: string[] = [];
  const errors: { input: string; error: string }[] = [];

  for (const file of files) {
    const outPath = path.join(
      output_dir,
      path.basename(file, path.extname(file)) + '.png'
    );

    const result = await dwg_convert({
      input_path: file,
      output_path: outPath,
      background,
      antialiasing,
      dpi,
    });

    if (result.success) {
      converted.push(outPath);
    } else {
      errors.push({ input: file, error: result.error || 'Unknown error' });
    }
  }

  return { success: errors.length === 0, converted, errors };
}

// Simple glob implementation for common patterns
function globSync(pattern: string): string[] {
  const glob = require('glob');
  return glob.sync(pattern);
}
