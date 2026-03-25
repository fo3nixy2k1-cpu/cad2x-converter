# ZWCAD DWG to PNG converter using COM automation
import win32com.client
import os
import sys
import pythoncom

def dwg_to_png(dwg_path, output_path):
    try:
        # Initialize COM
        pythoncom.CoInitialize()
        
        # Connect to ZWCAD
        try:
            zwcad = win32com.client.Dispatch("ZWCAD.Application")
            zwcad.Visible = True
        except:
            print("Cannot start ZWCAD")
            return False
        
        # Open the DWG file
        doc = zwcad.Documents.Open(os.path.abspath(dwg_path))
        print(f"Opened: {doc.Name}")
        
        # Zoom to extents
        doc.SendCommand("_ZOOM _E ")
        
        # Set FILEDIA to 0 to suppress dialogs
        doc.SendCommand("FILEDIA 0 ")
        
        # Export to PNG using -EXPORT command
        # Format: -EXPORT PNG [output_path] [width] [height]
        output_abs = os.path.abspath(output_path)
        cmd = f'-EXPORT PNG "{output_abs}" 2000 2000 '
        doc.SendCommand(cmd)
        
        print(f"Exported to: {output_abs}")
        
        # Wait a bit for export to complete
        import time
        time.sleep(2)
        
        # Check if file exists
        if os.path.exists(output_abs):
            print(f"File created: {os.path.getsize(output_abs)} bytes")
        else:
            print("Warning: Output file not found")
        
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
        print("Usage: python zwcad_com.py <input.dwg> <output.png>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)
    
    success = dwg_to_png(input_file, output_file)
    sys.exit(0 if success else 1)
