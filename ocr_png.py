#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
PNG 图片 OCR 识别
使用百度 OCR API
"""

import os
import sys
import base64
import json
from pathlib import Path
from datetime import datetime

# 百度 OCR 配置 (从环境变量或配置文件读取)
APP_ID = os.getenv('BAIDU_OCR_APP_ID') or '你的APP_ID'
API_KEY = os.getenv('BAIDU_OCR_API_KEY') or '你的API_KEY'
SECRET_KEY = os.getenv('BAIDU_OCR_SECRET_KEY') or '你的SECRET_KEY'

def get_access_token():
    """获取百度 OCR access token"""
    try:
        import requests
        auth_url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={API_KEY}&client_secret={SECRET_KEY}"
        response = requests.post(auth_url)
        if response.status_code == 200:
            result = response.json()
            return result.get('access_token')
        else:
            print(f"[ERROR] 获取access_token失败: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

def ocr_image(image_path: Path, access_token: str):
    """识别单张图片"""
    try:
        import requests
        
        # 读取图片并base64编码
        with open(image_path, 'rb') as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # 通用文字识别（高精度版）
        url = f"https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token={access_token}"
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            'image': image_base64,
            'language_type': 'CHN_ENG'  # 中英文混合
        }
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"[ERROR] OCR请求失败: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

def parse_ocr_result(result: dict, image_name: str):
    """解析OCR结果"""
    if not result or 'words_result' not in result:
        return f"图片: {image_name}\n状态: 识别失败\n"
    
    words_list = result['words_result']
    texts = [item['words'] for item in words_list]
    
    output = f"图片: {image_name}\n"
    output += f"识别时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    output += f"文字数量: {len(texts)}\n"
    output += "-" * 50 + "\n"
    
    for i, text in enumerate(texts, 1):
        output += f"{i}. {text}\n"
    
    return output

def main():
    if len(sys.argv) < 2:
        print("用法: python ocr_png.py <png文件或文件夹> [输出txt文件]")
        print("示例: python ocr_png.py C:\\dwg_files\\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.png")
        sys.exit(1)
    
    input_path = Path(sys.argv[1]).resolve()
    output_file = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else None
    
    if not input_path.exists():
        print(f"路径不存在: {input_path}")
        sys.exit(1)
    
    # 获取 access token
    print("正在获取百度 OCR access token...")
    token = get_access_token()
    if not token:
        print("无法获取 access token，请检查配置")
        sys.exit(1)
    print(f"[OK] access token 已获取")
    
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
    
    print(f"找到 {len(png_files)} 个 PNG 文件")
    
    # 识别
    all_results = []
    for png in png_files:
        print(f"\n识别: {png.name}")
        result = ocr_image(png, token)
        if result:
            parsed = parse_ocr_result(result, png.name)
            all_results.append(parsed)
            print(f"  [OK] 识别完成，文字数: {len(result.get('words_result', []))}")
        else:
            print(f"  [FAIL] 识别失败")
    
    # 输出
    if output_file is None:
        output_file = input_path.parent / f"ocr_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(all_results))
    
    print(f"\n[OK] 结果已保存: {output_file}")
    print(f"总计处理: {len(all_results)}/{len(png_files)} 成功")

if __name__ == "__main__":
    main()
