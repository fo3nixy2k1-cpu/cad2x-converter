#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
DWG 转 PNG 自动化脚本
工作流程：
1. DWG → DXF (使用 ODA File Converter)
2. DXF → PNG (使用 ezdxf + matplotlib)
"""

import os
import subprocess
import sys
from pathlib import Path

try:
    import ezdxf
    import matplotlib.pyplot as plt
except ImportError as e:
    print(f"缺少依赖: {e}")
    print("请运行: uv pip install --system ezdxf matplotlib")
    sys.exit(1)

# ODA File Converter 路径
ODA_CONVERTER = r"C:\Program Files\ODA\ODAFileConverter 27.1.0\ODAFileConverter.exe"

def dwg_to_dxf_oda(dwg_path: Path, dxf_output_dir: Path, version: str = "R2018") -> Path:
    """使用 ODA File Converter 将 DWG 转换为 DXF"""
    dxf_output_dir.mkdir(parents=True, exist_ok=True)

    # ODA File Converter 参数说明：
    # /i: 输入文件/目录
    # /s: 输出目录
    # /r: 递归处理子目录（如果输入是目录）
    # /v: 输出版本 (如 R2018)
    cmd = [
        ODA_CONVERTER,
        f"/i{dwg_path}",
        f"/s{dxf_output_dir}",
        "/r",
        f"/v{version}"
    ]

    print(f"正在转换: {dwg_path} -> {dxf_output_dir}")
    print(f"命令: {' '.join(cmd)}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
        if result.returncode != 0:
            print(f"ODA 转换失败: {result.stderr}")
            return None
        print(f"ODA 转换完成")
    except Exception as e:
        print(f"执行 ODA 命令出错: {e}")
        return None

    # 查找生成的 DXF 文件
    dxf_files = list(dxf_output_dir.glob("*.dxf"))
    if not dxf_files:
        print("未找到生成的 DXF 文件")
        return None

    return dxf_files[0]

def dxf_to_png(dxf_path: Path, png_output_path: Path, dpi: int = 150):
    """使用 ezdxf + matplotlib 将 DXF 渲染为 PNG"""
    print(f"正在渲染: {dxf_path} -> {png_output_path}")

    try:
        # 读取 DXF
        doc = ezdxf.readfile(dxf_path)
        msp = doc.modelspace()

        # 创建图形
        fig, ax = plt.subplots(figsize=(10, 10))
        ax.set_aspect('equal')
        ax.set_facecolor('white')

        # 遍历实体并绘制
        for entity in msp:
            entity_type = entity.dxftype()

            if entity_type == 'LINE':
                start = entity.dxf.start
                end = entity.dxf.end
                ax.plot([start[0], end[0]], [start[1], end[1]], 'k-', linewidth=0.5)

            elif entity_type == 'LWPOLYLINE':
                points = entity.get_points()
                xs = [p[0] for p in points]
                ys = [p[1] for p in points]
                if entity.closed:
                    xs.append(xs[0])
                    ys.append(ys[0])
                ax.plot(xs, ys, 'k-', linewidth=0.5)

            elif entity_type == 'CIRCLE':
                center = entity.dxf.center
                radius = entity.dxf.radius
                circle = plt.Circle((center[0], center[1]), radius, fill=False, color='black', linewidth=0.5)
                ax.add_patch(circle)

            elif entity_type == 'ARC':
                center = entity.dxf.center
                radius = entity.dxf.radius
                start_angle = entity.dxf.start_angle
                end_angle = entity.dxf.end_angle
                import numpy as np
                angles = np.linspace(np.radians(start_angle), np.radians(end_angle), 50)
                xs = center[0] + radius * np.cos(angles)
                ys = center[1] + radius * np.sin(angles)
                ax.plot(xs, ys, 'k-', linewidth=0.5)

            elif entity_type == 'TEXT' or entity_type == 'MTEXT':
                # 文本实体
                if hasattr(entity.dxf, 'text'):
                    text = entity.dxf.text
                    pos = entity.dxf.insert
                    ax.text(pos[0], pos[1], text, fontsize=6, color='black')

        # 设置坐标轴
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_xlim(ax.get_xlim())
        ax.set_ylim(ax.get_ylim())
        ax.invert_yaxis()  # CAD 坐标系通常 Y 轴向上

        # 保存 PNG
        plt.tight_layout()
        plt.savefig(png_output_path, dpi=dpi, bbox_inches='tight', facecolor='white')
        plt.close(fig)

        print(f"PNG 保存成功: {png_output_path}")
        return png_output_path

    except Exception as e:
        print(f"渲染 DXF 失败: {e}")
        import traceback
        traceback.print_exc()
        return None

def convert_dwg_to_png(dwg_path: str, output_dir: str = None):
    """主转换函数"""
    dwg_path = Path(dwg_path).resolve()
    if not dwg_path.exists():
        print(f"文件不存在: {dwg_path}")
        return None

    if output_dir is None:
        output_dir = dwg_path.parent / "output"
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"开始转换 DWG 到 PNG")
    print(f"输入: {dwg_path}")
    print(f"输出目录: {output_dir}")

    # 步骤1: DWG → DXF
    dxf_dir = output_dir / "dxf"
    dxf_file = dwg_to_dxf_oda(dwg_path, dxf_dir)
    if not dxf_file:
        print("DWG 转 DXF 失败")
        return None

    # 步骤2: DXF → PNG
    png_file = output_dir / f"{dwg_path.stem}.png"
    png_result = dxf_to_png(dxf_file, png_file)
    if not png_result:
        print("DXF 转 PNG 失败")
        return None

    print(f"✅ 转换完成: {png_result}")
    return png_result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python dwg_to_png.py <dwg文件路径> [输出目录]")
        print("示例: python dwg_to_png.py C:\\path\\to\\file.dwg")
        sys.exit(1)

    dwg_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    result = convert_dwg_to_png(dwg_file, output_dir)
    sys.exit(0 if result else 1)
