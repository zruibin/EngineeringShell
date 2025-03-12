#! /usr/bin/env python3
# -*- coding: utf-8 -*- 
#
# build.py
#
# Created by Ruibin.Chow on 2025/03/12.
# Copyright (c) 2025年 Ruibin.Chow All rights reserved.
# 

"""

"""

import os, re, json, sys, platform, fnmatch, stat
import subprocess, shutil

def get_current_version():
    content = ''
    with open('VERSION', "r", encoding='utf-8') as fileHandle:
        content = fileHandle.read()
    return content.strip()

def get_current_git_branch():
    try:
        # 执行 git branch --show-current 命令获取当前分支名
        result = subprocess.run(['git', 'branch', '--show-current'], capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        print("获取当前分支名时出错，请确保当前目录是 Git 仓库。")
        return ''

def get_current_git_commit():
    try:
        # 执行 git rev-parse --short HEAD 命令获取短格式的当前提交哈希值
        result = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        print("获取当前提交哈希值时出错，请确保当前目录是 Git 仓库。")
        return ''


if __name__ == "__main__":
    version = get_current_version()
    branch = get_current_git_branch()
    commit = get_current_git_commit()
    print(f"当前版本: {version}")
    print(f"当前分支: {branch}")
    print(f"当前短提交哈希值: {commit}")

