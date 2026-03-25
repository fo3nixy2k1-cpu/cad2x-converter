# DWG Converter Skill

Automatically convert DWG/DXF files to PNG using QCAD command-line tools.

## Installation

1. **Install QCAD** (free edition works):
   - Download from https://www.qcad.org/en/
   - Install to default location (e.g., `C:\Program Files\QCAD`)

2. **Add QCAD to PATH** (optional but recommended):
   - Add `C:\Program Files\QCAD` to system PATH
   - Or set environment variable `QCAD_HOME` to QCAD install dir

3. **Install this skill**:
   ```bash
   claw skill install dwg-converter
   ```

4. **Test the skill**:
   ```bash
   claw skill test dwg-converter --input "test.dwg" --output "test.png"
   ```

## Usage

### Automatic conversion
Just send a DWG file to the assistant—it will auto-convert and return the PNG.

### Manual conversion
```bash
claw skill run dwg-converter dwg_convert '{"input_path": "drawing.dwg", "dpi": 300}'
```

### Batch conversion
```bash
claw skill run dwg-converter dwg_convert_batch '{"input_pattern": "*.dwg", "output_dir": "pngs/"}'
```

## Notes

- Supports DWG up to AutoCAD 2018 (per QCAD docs)
- For large/complex drawings, use higher DPI for quality
- The skill runs non-interactively—perfect for automation

## Troubleshooting

**"Command not found"**: Ensure QCAD's install directory is in PATH or set `QCAD_HOME`.

**Conversion fails**: Check that the DWG file is valid and not corrupted. Try opening it in QCAD GUI first.

**Poor quality**: Increase DPI (e.g., 300 or 600).
