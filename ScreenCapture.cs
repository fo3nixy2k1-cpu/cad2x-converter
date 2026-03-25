using System;
using System.Drawing;
using System.Runtime.InteropServices;

class ScreenCapture {
    [DllImport("user32.dll")]
    static extern IntPtr GetDesktopWindow();
    
    [DllImport("user32.dll")]
    static extern IntPtr GetWindowDC(IntPtr hWnd);
    
    [DllImport("user32.dll")]
    static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);
    
    [DllImport("gdi32.dll")]
    static extern IntPtr CreateCompatibleDC(IntPtr hDC);
    
    [DllImport("gdi32.dll")]
    static extern IntPtr CreateCompatibleBitmap(IntPtr hDC, int nWidth, int nHeight);
    
    [DllImport("gdi32.dll")]
    static extern IntPtr SelectObject(IntPtr hDC, IntPtr hObject);
    
    [DllImport("gdi32.dll")]
    static extern bool BitBlt(IntPtr hDestDC, int x, int y, int nWidth, int nHeight, IntPtr hSrcDC, int xSrc, int ySrc, int dwRop);
    
    [DllImport("gdi32.dll")]
    static extern bool DeleteDC(IntPtr hDC);
    
    [DllImport("gdi32.dll")]
    static extern bool DeleteObject(IntPtr hObject);
    
    const int SRCCOPY = 0x00CC0020;
    
    static void Main() {
        IntPtr hDesk = GetDesktopWindow();
        IntPtr hSrce = GetWindowDC(hDesk);
        IntPtr hDest = CreateCompatibleDC(hSrce);
        IntPtr hBmp = CreateCompatibleBitmap(hSrce, 1244, 600);
        IntPtr hOldBmp = SelectObject(hDest, hBmp);
        BitBlt(hDest, 0, 0, 1244, 600, hSrce, 0, 0, SRCCOPY);
        SelectObject(hDest, hOldBmp);
        
        Bitmap bmp = Image.FromHbitmap(hBmp);
        bmp.Save(@"C:\Users\y2k1\.openclaw\workspace\screen2.png");
        
        DeleteObject(hBmp);
        DeleteDC(hDest);
        ReleaseDC(hDesk, hSrce);
        
        Console.WriteLine("OK");
    }
}
