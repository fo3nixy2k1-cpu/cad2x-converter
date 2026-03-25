#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
DWG 转 PNG - 简化版
使用 ezdxf + odafc 插件读取 DWG，matplotlib 渲染 PNG
"""

import os
import sys
from pathlib import Path

try:
    import ezdxf
    import matplotlib.pyplot as plt
    from ezdxf.addons import odafc
except ImportError as e:
    print(f"缺少依赖: {e}")
    print("请运行: uv pip install --system ezdxf matplotlib")
    sys.exit(1)

# 配置 ODA File Converter 路径 (因安装路径包含版本号，需显式设置)
odafc.win_exec_path = r"C:\Program Files\ODA\ODAFileConverter 27.1.0\ODAFileConverter.exe"

def dwg_to_png(dwg_path: Path, png_output_path: Path = None, dpi: int = 150):
    """直接读取 DWG 并渲染为 PNG"""
    if not dwg_path.exists():
        print(f"文件不存在: {dwg_path}")
        return None

    if png_output_path is None:
        png_output_path = dwg_path.parent / f"{dwg_path.stem}.png"

    print(f"正在转换: {dwg_path} -> {png_output_path}")

    # 1. 用 odafc 读取 DWG (自动转为 DXF)
    try:
        print("使用 ODA File Converter 转换...")
        doc = odafc.readfile(str(dwg_path), audit=True)
        print(f"[OK] DWG 读取成功，DXF 版本: {doc.dxfversion}")
    except odafc.ODAFCNotInstalledError:
        print("错误: ODA File Converter 未安装或路径不对")
        return None
    except Exception as e:
        print(f"读取 DWG 失败: {e}")
        import traceback
        traceback.print_exc()
        return None

    # 2. 用 matplotlib 渲染
    try:
        msp = doc.modelspace()

        # 计算边界框
        min_x = min_y = float('inf')
        max_x = max_y = float('-inf')
        for entity in msp:
            if entity.dxftype() == 'LINE':
                for p in [entity.dxf.start, entity.dxf.end]:
                    min_x = min(min_x, p[0]); max_x = max(max_x, p[0])
                    min_y = min(min_y, p[1]); max_y = max(max_y, p[1])
            elif entity.dxftype() == 'LWPOLYLINE':
                for p in entity.get_points():
                    min_x = min(min_x, p[0]); max_x = max(max_x, p[0])
                    min_y = min(min_y, p[1]); max_y = max(max_y, p[1])
            elif entity.dxftype() in ('CIRCLE', 'ARC'):
                c = entity.dxf.center
                r = entity.dxf.radius
                min_x = min(min_x, c[0]-r); max_x = max(max_x, c[0]+r)
                min_y = min(min_y, c[1]-r); max_y = max(max_y, c[1]+r)
            elif entity.dxftype() in ('TEXT', 'MTEXT'):
                p = entity.dxf.insert
                min_x = min(min_x, p[0]); max_x = max(max_x, p[0])
                min_y = min(min_y, p[1]); max_y = max(max_y, p[1])

        if min_x == float('inf'):
            print("警告: 未找到任何可渲染的实体")
            return None

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
                    ax.text(pos[0], pos[1], txt, fontsize=6, color='black')
            except Exception as e:
                # 单实体错误不中断
                continue

        # 保存
        plt.tight_layout()
        plt.savefig(png_output_path, dpi=dpi, bbox_inches='tight', facecolor='white')
        plt.close(fig)

        print(f"[OK] PNG 保存成功: {png_output_path}")
        return png_output_path

    except Exception as e:
        print(f"渲染失败: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python dwg_to_png_simple.py <dwg文件路径> [输出png路径]")
        print("示例: python dwg_to_png_simple.py C:\\path\\to\\file.dwg")
        sys.exit(1)

    dwg_file = Path(sys.argv[1]).resolve()
    png_out = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else None

    result = dwg_to_png(dwg_file, png_out)
    sys.exit(0 if result else 1)
