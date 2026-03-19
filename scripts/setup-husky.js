#!/usr/bin/env node

/**
 * 设置 Husky Git Hooks
 * 用于自动同步版本号
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 设置 Husky Git Hooks...\n');

try {
  // 检查是否已安装 husky
  try {
    execSync('npx husky --version', { stdio: 'ignore' });
    console.log('✅ Husky 已安装');
  } catch {
    console.log('📦 安装 Husky...');
    execSync('pnpm add -D husky', { cwd: rootDir, stdio: 'inherit' });
  }

  // 初始化 husky
  console.log('\n🔨 初始化 Husky...');
  execSync('npx husky install', { cwd: rootDir, stdio: 'inherit' });

  // 创建 pre-commit hook
  console.log('\n📝 创建 pre-commit hook...');
  const hookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 同步版本号到 web.config.js
node scripts/sync-version.js
`;

  const hookPath = join(rootDir, '.husky', 'pre-commit');
  writeFileSync(hookPath, hookContent, 'utf8');

  // 使 hook 可执行（Unix 系统）
  try {
    execSync(`chmod +x "${hookPath}"`);
    console.log('✅ 已设置 hook 执行权限');
  } catch {
    console.log('ℹ️  Windows 系统，跳过权限设置');
  }

  console.log('\n✅ Husky 设置完成！');
  console.log('\n现在每次 commit 前都会自动同步版本号到 web.config.js');
  console.log('如需禁用，运行：npx husky uninstall\n');

} catch (error) {
  console.error('❌ 设置失败:', error.message);
  process.exit(1);
}
