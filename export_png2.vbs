Option Explicit

Dim zwcadApp
Dim doc
Dim outputPath

' 尝试连接已运行的中望CAD
On Error Resume Next
Set zwcadApp = GetObject(, "ZWCAD.Application")
If Err.Number <> 0 Then
    ' 如果没有运行，创建新实例
    Set zwcadApp = CreateObject("ZWCAD.Application")
    zwcadApp.Visible = True
End If
On Error GoTo 0

zwcadApp.WindowState = 1 ' 正常窗口

' 打开DWG文件
Set doc = zwcadApp.Documents.Open("C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.dwg")

' 缩放到适合范围
doc.SendCommand "zoom e "

' 导出PNG
outputPath = "C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.png"

' 使用Plot命令
doc.SendCommand "plot y model " & outputPath & " "

' 等待导出完成
WScript.Sleep 5000

' 关闭文档（不保存）
doc.Close False

' 退出
' zwcadApp.Quit

MsgBox "完成! 文件已保存到: " & outputPath
