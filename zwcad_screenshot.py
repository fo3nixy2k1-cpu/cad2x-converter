# ZWCAD to PNG - Method: Screenshot
import win32com.client
import os
import sys
import pythoncom
import time
from PIL import ImageGrab, Image

def dwg_to_png_screenshot(dwg_path, output_path):
    try:
        pythoncom.CoInitialize()
        
        zwcad = win32com.client.Dispatch("ZWCAD.Application")
        zwcad.Visible = True
        
        # Open the DWG file
        doc = zwcad.Documents.Open(os.path.abspath(dwg_path))
        print(f"Opened: {doc.Name}")
        
        # Zoom to extents
        doc.SendCommand("_ZOOM _E ")
        time.sleep(2)
        
        # Get the main window
        hw = zwcad.MainWindow.hWnd
        print(f"Window handle: {hw}")
        
        # Take screenshot
        img = ImageGrab.grab()
        img.save(output_path)
        
        print(f"Saved screenshot to: {output_path}")
        
        doc.Close(False)
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python zwcad_screenshot.py <input.dwg> <output.png>")
        sys.exit(1)
    
    success = dwg_to_png_screenshot(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
