# ZWCAD DWG to PNG using COM Plot API
import win32com.client
import os
import sys
import pythoncom
import time

def dwg_to_png(dwg_path, output_path):
    try:
        pythoncom.CoInitialize()
        
        # Connect to ZWCAD
        zwcad = win32com.client.Dispatch("ZWCAD.Application")
        zwcad.Visible = True
        
        # Open the DWG file
        doc = zwcad.Documents.Open(os.path.abspath(dwg_path))
        print(f"Opened: {doc.Name}")
        
        # Get plot config
        plot = doc.Plot
        
        # Set plot configuration
        plot.PlotToFile(os.path.abspath(output_path), "ZWP LOT-PNG.pc3")
        print(f"Plotted to: {output_path}")
        
        time.sleep(2)
        
        # Check if file exists
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"Success! File size: {size} bytes")
            doc.Close(False)
            return True
        else:
            print("File not created")
        
        doc.Close(False)
        return False
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python zwcad_plot_api.py <input.dwg> <output.png>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)
    
    success = dwg_to_png(input_file, output_file)
    sys.exit(0 if success else 1)
