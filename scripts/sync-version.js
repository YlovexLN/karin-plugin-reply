#!/usr/bin/env node

/**
 * 同步 package.json 版本号到 web.config.js
 * 在 Git commit 前自动执行
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  // 读取 package.json
  const packagePath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const newVersion = packageJson.version;

  // 读取 web.config.js
  const webConfigPath = join(rootDir, 'lib', 'web.config.js');
  let webConfigContent = readFileSync(webConfigPath, 'utf8');

  // 支持两种格式：
  // 1. version: '0.0.6'
  // 2. version: getVersion()
  const versionRegexHardcoded = /version:\s*'[\d.]+'/;
  const versionRegexFunction = /version:\s*getVersion\(\)/;
  const newVersionLine = `version: '${newVersion}'`;

  if (versionRegexHardcoded.test(webConfigContent)) {
    // 硬编码版本号
    webConfigContent = webConfigContent.replace(versionRegexHardcoded, newVersionLine);
    console.log(`✅ 版本号已同步（硬编码）: ${newVersion}`);
  } else if (versionRegexFunction.test(webConfigContent)) {
    // 使用 getVersion() 函数
    webConfigContent = webConfigContent.replace(versionRegexFunction, newVersionLine);
    console.log(`✅ 版本号已同步（替换 getVersion）: ${newVersion}`);
  } else {
    console.error('❌ 未在 web.config.js 中找到 version 字段');
    process.exit(1);
  }
  
  // 写回文件
  writeFileSync(webConfigPath, webConfigContent, 'utf8');
  console.log(`📄 文件：lib/web.config.js`);
} catch (error) {
  console.error('❌ 同步版本号失败:', error.message);
  process.exit(1);
}
