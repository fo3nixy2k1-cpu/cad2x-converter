# ZWCAD DWG to PNG - Method: Open and use PublishToWebJPG
import win32com.client
import os
import sys
import pythoncom
import time

def dwg_to_jpg(dwg_path, output_path):
    try:
        pythoncom.CoInitialize()
        
        zwcad = win32com.client.Dispatch("ZWCAD.Application")
        zwcad.Visible = True
        
        # Open the DWG file
        doc = zwcad.Documents.Open(os.path.abspath(dwg_path))
        print(f"Opened: {doc.Name}")
        
        # Zoom to extents
        doc.SendCommand("_ZOOM _E ")
        time.sleep(1)
        
        # Try PublishToWebJPG - exports to JPG
        # Format: PUBLISHTOWEB
        doc.SendCommand("PUBLISHTOWEBJPG ")
        time.sleep(0.5)
        
        # Input output path
        doc.SendCommand(os.path.abspath(output_path))
        time.sleep(0.5)
        doc.SendCommand(" ")
        
        time.sleep(3)
        
        # Check if file created
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"Success! File: {output_path}, Size: {size}")
            doc.Close(False)
            return True
        
        doc.Close(False)
        return False
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python zwcad_publish.py <input.dwg> <output.jpg>")
        sys.exit(1)
    
    success = dwg_to_jpg(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
