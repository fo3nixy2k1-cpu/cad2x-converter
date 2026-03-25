#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
PNG 图片 OCR 识别 - 使用本地 Tesseract
"""

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

def ocr_tesseract(image_path: Path, output_txt: Path = None):
    """使用 Tesseract 识别图片"""
    if output_txt is None:
        output_txt = image_path.parent / f"{image_path.stem}_ocr.txt"
    
    # tesseract 命令
    # -l chi_sim+eng 使用简体中文+英文
    cmd = [
        "tesseract",
        str(image_path),
        str(output_txt.with_suffix('')),  # tesseract 会自动加 .txt
        "-l", "chi_sim+eng",
        "--psm", "3"  # 自动页面分割
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
        if result.returncode == 0:
            # tesseract 输出到 output_txt（不带.txt后缀的文件名.txt）
            actual_txt = output_txt.with_suffix('.txt')
            if actual_txt.exists():
                content = actual_txt.read_text(encoding='utf-8', errors='ignore')
                return content
            return "[OK] 识别完成，但未找到输出文件"
        else:
            return f"[ERROR] Tesseract 失败: {result.stderr}"
    except Exception as e:
        return f"[ERROR] {e}"

def main():
    if len(sys.argv) < 2:
        print("用法: python ocr_tesseract.py <png文件或文件夹> [输出文件夹]")
        print("示例: python ocr_tesseract.py C:\\dwg_files\\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.png")
        sys.exit(1)
    
    input_path = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else input_path.parent / "ocr_results"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if not input_path.exists():
        print(f"路径不存在: {input_path}")
        sys.exit(1)
    
    # 收集 PNG 文件
    png_files = []
    if input_path.is_file():
        if input_path.suffix.lower() == '.png':
            png_files.append(input_path)
    else:
        png_files = list(input_path.glob("*.png")) + list(input_path.glob("*.PNG"))
    
    if not png_files:
        print(f"未找到 PNG 文件: {input_path}")
        sys.exit(1)
    
    print(f"找到 {len(png_files)} 个 PNG 文件，开始识别...")
    
    # 识别
    all_results = []
    success = 0
    for png in png_files:
        print(f"\n识别: {png.name}")
        result = ocr_tesseract(png, output_dir / f"{png.stem}.txt")
        if result and not result.startswith('[ERROR]'):
            success += 1
            # 记录结果
            all_results.append(f"="*60 + f"\n文件: {png.name}\n时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n" + "="*60 + f"\n{result}\n")
            print(f"  [OK] 识别完成")
        else:
            print(f"  [FAIL] {result}")
    
    # 汇总
    summary_file = output_dir / "ocr_summary.txt"
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(all_results))
    
    print(f"\n[OK] 完成: {success}/{len(png_files)} 成功")
    print(f"[OK] 汇总文件: {summary_file}")

if __name__ == "__main__":
    main()
