---
name: dwg-converter
description: |
  Automatically convert DWG/DXF files to PNG images in a non-interactive, local environment.
  Triggers when user mentions DWG files or requests conversion to PNG.
---

# DWG to PNG Converter

Converts AutoCAD DWG/DXF files to PNG using QCAD command-line tools.

## Prerequisites

- **QCAD** installed on the system (includes `dwg2bmp` command-line tool)
  - Download: https://www.qcad.org/en/
  - On Windows: `dwg2bmp.bat` in QCAD installation directory
  - On Linux/macOS: `dwg2bmp` shell script

## Tool: `dwg_convert`

### Parameters
- `input_path` (required): Path to the source DWG/DXF file
- `output_path` (optional, default: same as input with .png extension): Destination PNG file path
- `background` (optional, default: "white"): Background color (e.g., "white", "black", "transparent")
- `antialiasing` (optional, default: true): Enable antialiasing for smoother edges
- `dpi` (optional, default: 150): Resolution in DPI

### Example
```json
{
  "action": "dwg_convert",
  "input_path": "C:/drawings/design.dwg",
  "output_path": "C:/output/design.png",
  "background": "white",
  "antialiasing": true,
  "dpi": 300
}
```

## Automatic Workflow

When a user sends a DWG file:
1. Skill detects the file attachment or path
2. Automatically runs conversion with default settings
3. Returns the PNG file path for download/use

## Batch Conversion

For multiple files, loop over them:
```json
{
  "action": "dwg_convert_batch",
  "input_pattern": "C:/drawings/*.dwg",
  "output_dir": "C:/output/",
  "background": "white"
}
```

## Notes

- QCAD's `dwg2bmp` supports DWG versions up to AutoCAD 2018 (check QCAD docs for exact support)
- For large/complex drawings, increase DPI for better quality (takes longer)
- The tool runs non-interactively—suitable for automation
