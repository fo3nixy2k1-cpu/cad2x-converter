# ZWCAD DWG to PNG converter using Plot
import win32com.client
import os
import sys
import pythoncom
import time

def dwg_to_png(dwg_path, output_path):
    try:
        # Initialize COM
        pythoncom.CoInitialize()
        
        # Connect to ZWCAD
        zwcad = win32com.client.Dispatch("ZWCAD.Application")
        zwcad.Visible = True
        
        # Open the DWG file
        doc = zwcad.Documents.Open(os.path.abspath(dwg_path))
        print(f"Opened: {doc.Name}")
        
        # Zoom to extents
        doc.SendCommand("_ZOOM _E ")
        time.sleep(0.5)
        
        # Method 1: Try using Plot to PNG
        # Set plotter to PNG
        doc.SendCommand("-PLOT ")
        time.sleep(0.3)
        
        # Enter for default
        doc.SendCommand(" ")
        time.sleep(0.3)
        
        # Model space
        doc.SendCommand("Model ")
        time.sleep(0.3)
        
        # Enter to accept
        doc.SendCommand(" ")
        time.sleep(0.3)
        
        # Try to find PNG plotter - use PublishToWeb
        # Alternative: use screenshot approach
        
        print("Plot command sent")
        
        # Close without saving
        doc.Close(False)
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python zwcad_plot.py <input.dwg> <output.png>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)
    
    success = dwg_to_png(input_file, output_file)
    sys.exit(0 if success else 1)
