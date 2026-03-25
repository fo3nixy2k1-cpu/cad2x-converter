@echo off
REM 激活微信窗口
powershell -Command "Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class Win32 {[DllImport(\"user32.dll\")]public static extern bool SetForegroundWindow(IntPtr hWnd);[DllImport(\"user32.dll\")]public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);}' ; $w = [Win32]::FindWindow('mmui::MainWindow', '微信'); if($w -ne [IntPtr]::Zero){[Win32]::SetForegroundWindow($w); Start-Sleep -Seconds 1 }"
