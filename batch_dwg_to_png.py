#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
批量 DWG 转 PNG - 带中文字体支持
使用 ODA File Converter + ezdxf + matplotlib
"""

import os
import sys
from pathlib import Path

try:
    import ezdxf
    import matplotlib.pyplot as plt
    from ezdxf.addons import odafc
    import matplotlib.font_manager as fm
except ImportError as e:
    print(f"缺少依赖: {e}")
    print("请运行: uv pip install --system ezdxf matplotlib")
    sys.exit(1)

# 配置 ODA File Converter 路径
odafc.win_exec_path = r"C:\Program Files\ODA\ODAFileConverter 27.1.0\ODAFileConverter.exe"

# 配置中文字体
def set_chinese_font():
    """设置matplotlib中文字体"""
    font_candidates = [
        r"C:\Windows\Fonts\simhei.ttf",  # 黑体
        r"C:\Windows\Fonts\msyh.ttc",    # 微软雅黑
        r"C:\Windows\Fonts\simsun.ttc",  # 宋体
        r"C:\Windows\Fonts\simkai.ttf",  # 楷体
    ]
    
    for font_path in font_candidates:
        if os.path.exists(font_path):
            try:
                font_prop = fm.FontProperties(fname=font_path)
                plt.rcParams['font.family'] = font_prop.get_name()
                print(f"[OK] 使用中文字体: {font_prop.get_name()}")
                return font_prop
            except Exception as e:
                print(f"[WARN] 加载字体失败 {font_path}: {e}")
    
    print("[WARN] 未找到中文字体，中文将显示为方框")
    return None

def render_dxf_to_png(doc, png_path: Path, dpi: int = 150):
    """将 ezdxf 文档渲染为 PNG"""
    msp = doc.modelspace()
    
    # 计算边界框
    min_x = min_y = float('inf')
    max_x = max_y = float('-inf')
    for entity in msp:
        et = entity.dxftype()
        try:
            if et == 'LINE':
                for p in [entity.dxf.start, entity.dxf.end]:
                    min_x = min(min_x, p[0]); max_x = max(max_x, p[0])
                    min_y = min(min_y, p[1]); max_y = max(max_y, p[1])
            elif et == 'LWPOLYLINE':
                for p in entity.get_points():
                    min_x = min(min_x, p[0]); max_x = max(max_x, p[0])
                    min_y = min(min_y, p[1]); max_y = max(max_y, p[1])
            elif et in ('CIRCLE', 'ARC'):
                c = entity.dxf.center
                r = entity.dxf.radius
                min_x = min(min_x, c[0]-r); max_x = max(max_x, c[0]+r)
                min_y = min(min_y, c[1]-r); max_y = max(max_y, c[1]+r)
            elif et in ('TEXT', 'MTEXT'):
                p = entity.dxf.insert
                min_x = min(min_x, p[0]); max_x = max(max_x, p[0])
                min_y = min(min_y, p[1]); max_y = max(max_y, p[1])
        except:
            continue
    
    if min_x == float('inf'):
        print("[WARN] 未找到任何可渲染的实体")
        return False
    
    width = max_x - min_x
    height = max_y - min_y
    padding = max(width, height) * 0.05
    
    # 创建图形
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_aspect('equal')
    ax.set_facecolor('white')
    ax.set_xlim(min_x - padding, max_x + padding)
    ax.set_ylim(min_y - padding, max_y + padding)
    ax.invert_yaxis()
    ax.set_xticks([])
    ax.set_yticks([])
    
    # 设置中文字体
    font_prop = set_chinese_font()
    
    # 绘制实体
    for entity in msp:
        et = entity.dxftype()
        try:
            if et == 'LINE':
                s, e = entity.dxf.start, entity.dxf.end
                ax.plot([s[0], e[0]], [s[1], e[1]], 'k-', linewidth=0.5)
            elif et == 'LWPOLYLINE':
                pts = entity.get_points()
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                if entity.closed and len(xs) > 0:
                    xs.append(xs[0]); ys.append(ys[0])
                ax.plot(xs, ys, 'k-', linewidth=0.5)
            elif et == 'CIRCLE':
                c = entity.dxf.center; r = entity.dxf.radius
                circle = plt.Circle((c[0], c[1]), r, fill=False, color='black', linewidth=0.5)
                ax.add_patch(circle)
            elif et == 'ARC':
                c = entity.dxf.center; r = entity.dxf.radius
                import numpy as np
                angles = np.linspace(np.radians(entity.dxf.start_angle), np.radians(entity.dxf.end_angle), 50)
                xs = c[0] + r * np.cos(angles)
                ys = c[1] + r * np.sin(angles)
                ax.plot(xs, ys, 'k-', linewidth=0.5)
            elif et in ('TEXT', 'MTEXT'):
                pos = entity.dxf.insert
                txt = entity.dxf.text if hasattr(entity.dxf, 'text') else str(entity)
                ax.text(pos[0], pos[1], txt, fontsize=6, color='black', fontproperties=font_prop)
        except:
            continue
    
    # 保存
    plt.tight_layout()
    plt.savefig(png_path, dpi=dpi, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    return True

def convert_dwg_file(dwg_path: Path, output_dir: Path):
    """转换单个DWG文件"""
    try:
        print(f"\n处理: {dwg_path.name}")
        
        # 用 odafc 读取 DWG
        doc = odafc.readfile(str(dwg_path), audit=True)
        print(f"  DXF版本: {doc.dxfversion}")
        
        # 渲染 PNG
        png_path = output_dir / f"{dwg_path.stem}.png"
        if render_dxf_to_png(doc, png_path):
            print(f"  [OK] 生成: {png_path.name}")
            return True
        else:
            print(f"  [FAIL] 渲染失败")
            return False
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def batch_convert(input_dir: Path, output_dir: Path = None):
    """批量转换"""
    if output_dir is None:
        output_dir = input_dir / "png_output"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    dwg_files = list(input_dir.glob("*.dwg")) + list(input_dir.glob("*.DWG"))
    if not dwg_files:
        print(f"在 {input_dir} 中未找到DWG文件")
        return
    
    print(f"找到 {len(dwg_files)} 个DWG文件")
    success = 0
    for dwg in dwg_files:
        if convert_dwg_file(dwg, output_dir):
            success += 1
    
    print(f"\n完成: {success}/{len(dwg_files)} 成功")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python batch_dwg_to_png.py <输入文件夹> [输出文件夹]")
        print("示例: python batch_dwg_to_png.py C:\\dwg_files C:\\output")
        sys.exit(1)
    
    input_dir = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else None
    
    batch_convert(input_dir, output_dir)
