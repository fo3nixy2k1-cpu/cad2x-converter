' ZWCAD Automation - DWG to PNG Export
Set zwcad = CreateObject("ZWCAD.Application")
zwcad.Visible = True

' Open DWG file
dwgPath = "C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.dwg"
outputPath = "C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.png"

Set doc = zwcad.Documents.Open(dwgPath)

' Execute plot command
doc.SendCommand "PLOT" & vbCr
WScript.Sleep 1000
doc.SendCommand "Y" & vbCr  ' Yes to plot
WScript.Sleep 500
doc.SendCommand "" & vbCr   ' Model space
WScript.Sleep 500
doc.SendCommand "PNG" & vbCr  ' Plot to PNG
WScript.Sleep 500
doc.SendCommand outputPath & vbCr
WScript.Sleep 500
doc.SendCommand "Y" & vbCr   ' Yes to proceed

WScript.Sleep 3000

' Close document
doc.Close False

' Quit
zwcad.Quit

WScript.Echo "Done"
