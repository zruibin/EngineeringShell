/*
 * eslint.config.js
 *
 * Created by Ruibin.Chow on 2025/02/26.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import * as espree from 'espree';
import globals from 'globals';

const noRestrictedImports = [
  'error',
  {
    // 支持通配符拦截子模块（如@tauri-apps/api/*）
    'patterns': [{
      'group': ['@tauri-apps/api/*'],
      'message': ' 🚫 禁止直接导入Tauri API，请使用封装后的安全模块(bridge.ts), 白名单路径除外.',
      // 'caseSensitive': true
    }]
  }
];

const whiteCheckConfig = {
  files: ['src/bridge.ts'],
  rules: {
    'no-restricted-imports': 'off' // 关闭白名单路径的拦截
  }
};

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // ----------------------------------
  // 基础全局配置
  // ----------------------------------
  {
    ignores: ['dist/**', 'node_modules/**', 'src-tauri/**', '.cache/**'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser, // 替换原 env.browser
        ...globals.node, // 替换原 env.node
        ...globals.es2021, // 替换原 env.es2021
      },
    },
  },

  // ----------------------------------
  // 公共规则（同时作用于 JS/TS）
  // ----------------------------------
  js.configs.recommended, // 替换原 extends: 'eslint:recommended'
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
    },
    rules: {
      // 全局通用规则
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node 内置模块（如 fs, path）
            'external', // 通过 npm 安装的第三方依赖（如 react, lodash）
            'internal', // 项目内部的模块（如 src/utils 或通过别名定义的路径 @/utils）
            // "parent"	父级目录中的模块（如 ../utils）, "sibling"	同级目录中的模块（如 ./config）
            ['sibling', 'parent'],
            'index', // 目录的索引文件（如 ./index.js）
            'object', // TypeScript 的类型导入（如 import type { Foo } from 'bar';）
            'type', // 同上（不同 ESLint 版本可能有差异）
          ],
          pathGroups: [
            { 
              pattern: '@:/**', // 匹配所有以 @/ 开头的导入
              group: 'internal', // 归为 internal 分组
              position: 'before', // 在 internal 分组内靠前排序
            },
            // { pattern: 'react', group: 'external', position: 'before' },
            // { pattern: '@/**', group: 'internal', position: 'before' },
            // { pattern: './**', group: 'sibling', position: 'after' },
            // { pattern: '@/hooks/**', group: 'internal', position: 'before' },
            // { pattern: '@/icons/**', group: 'internal', position: 'before' },
            // { pattern: '@/images/**', group: 'internal', position: 'before' },
          ],
          // 'newlines-between': 'always',
          // 一定要手动修改下方的值，因为pathGroupsExcludedImportTypes
          // 的默认值是["builtin", "external", "object"]，
          // 因此，假如我们不重新赋值，那么我们在pathGroups中
          // 定义的有关react的配置，就会被排除（因为它属于external），设置的position: before
          // 并不会生效，我们会发现eslint还是提示我们应该将antd在react之前import
          // 所以再强调一遍，一定要修改pathGroupsExcludedImportTypes的值
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // ----------------------------------
  // 针对 TypeScript 的覆盖配置
  // ----------------------------------
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json', // 保留原 TS 解析配置
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules, // 替换原 extends: 'plugin:@typescript-eslint/recommended'
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-imports': noRestrictedImports,
    },
  },

  // ----------------------------------
  // 针对 JavaScript 的覆盖配置
  // ----------------------------------
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: espree, // 显式指定 JS 解析器
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // 如果项目包含 JSX 需要开启
        },
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      // 'react/jsx-uses-react': 'error',
      // 'react-hooks/rules-of-hooks': 'error',
      'no-restricted-imports': noRestrictedImports,
    },
  },

  whiteCheckConfig,
];
