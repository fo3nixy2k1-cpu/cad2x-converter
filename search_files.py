# -*- coding: utf-8 -*-
import os
import sys

drives = ['C:', 'D:', 'E:', 'F:']
keyword = '考核'

for drive in drives:
    try:
        for root, _, files in os.walk(drive):
            for f in files:
                if keyword in f:
                    print(os.path.join(root, f))
    except Exception as e:
        pass
