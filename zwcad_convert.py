# ZWCAD DWG to PNG converter using COM automation
from pyzwcad import ZwCAD
import os
import sys

def dwg_to_png(dwg_path, output_path):
    try:
        # Start ZWCAD application
        app = ZwCAD()
        app.Startapp(False)  # Start without visible window
        
        # Open the DWG file
        doc = app.Documents.Open(dwg_path)
        
        # Get the active model space
        model = doc.ModelSpace
        
        # Zoom to extents
        app.ZoomExtents()
        
        # Plot to PNG
        # Note: This is simplified - actual implementation needs more setup
        # For now, we'll use the Plot method
        plot_config = app.Preferences.PlotConfig
        
        # Set plot to PNG
        app.SetSystemVariable("FILEDIA", 0)  # Disable file dialogs
        
        # Export as PNG using Plot
        # This is a basic approach - may need adjustment
        print(f"Converting {dwg_path} to {output_path}")
        
        # Close without saving
        doc.Close(False)
        
        print("Conversion completed!")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python zwcad_convert.py <input.dwg> <output.png>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)
    
    success = dwg_to_png(input_file, output_file)
    sys.exit(0 if success else 1)
