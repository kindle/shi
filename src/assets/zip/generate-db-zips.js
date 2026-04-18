#!/usr/bin/env node

// 生成 db0.zip ~ db5.zip
// db0.zip: 打包 src/assets/db 下除了 "全唐诗1"~"全唐诗5" 目录外的所有内容，顶层目录名为 db
// db1.zip: 只打包 src/assets/db/全唐诗1，顶层目录名为 db
// ...
// db5.zip: 只打包 src/assets/db/全唐诗5，顶层目录名为 db

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

// 项目根目录推断: 当前脚本在 src/assets/zip 下
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const dbRoot = path.join(projectRoot, 'src', 'assets', 'db');
const baseOutputDir = path.join(projectRoot, 'src', 'assets', 'zip');

// 本次运行专用的输出目录: assets/zip/YYYYMMDD-HHmmss
function getRunOutputDir() {
  const now = new Date();
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const datePart =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate());
  const timePart = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
  const dirName = `${datePart}-${timePart}`;
  const fullPath = path.join(baseOutputDir, dirName);
  fs.mkdirSync(fullPath, { recursive: true });
  return {
    dirName,
    fullPath,
  };
}

const qtDirs = [
  '全唐诗1',
  '全唐诗2',
  '全唐诗3',
  '全唐诗4',
  '全唐诗5',
];

/**
 * 创建 zip 文件
 * @param {string} zipPath 生成的 zip 完整路径
 * @param {(archive: import('archiver')) => void|Promise<void>} fillArchiveFn 往 archive 里塞内容的回调
 */
function createZip(zipPath, fillArchiveFn) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(zipPath), { recursive: true });

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`${path.basename(zipPath)} 已生成，总大小 ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('警告:', err.message);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    Promise.resolve()
      .then(() => fillArchiveFn(archive))
      .then(() => archive.finalize())
      .catch(reject);
  });
}

(async () => {
  try {
    if (!fs.existsSync(dbRoot)) {
      console.error('未找到 db 目录:', dbRoot);
      process.exit(1);
    }

    // 每次运行创建一个单独的输出目录
    const { dirName, fullPath: outputDir } = getRunOutputDir();

    fs.writeFileSync(
      path.join(outputDir, 'db-version.json'),
      JSON.stringify({ version: dirName }, null, 2) + '\n'
    );

    // db0.zip: 除了 全唐诗1-5 以外的所有内容
    const db0Path = path.join(outputDir, 'db0.zip');
    await createZip(db0Path, (archive) => {
      const entries = fs.readdirSync(dbRoot, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dbRoot, entry.name);

        // 排除 全唐诗1~5 目录
        if (entry.isDirectory() && qtDirs.includes(entry.name)) {
          continue;
        }

        const destName = path.join('db', entry.name);
        if (entry.isDirectory()) {
          archive.directory(fullPath, destName);
        } else {
          archive.file(fullPath, { name: destName });
        }
      }
    });

    // db1.zip ~ db5.zip: 只打包对应的 全唐诗X 目录，顶层目录名统一为 db
    for (let i = 1; i <= 5; i++) {
      const dirName = `全唐诗${i}`;
      const srcDir = path.join(dbRoot, dirName);
      if (!fs.existsSync(srcDir)) {
        console.warn(`警告: 未找到目录 ${srcDir}，跳过生成 db${i}.zip`);
        continue;
      }

      const zipPath = path.join(outputDir, `db${i}.zip`);
      await createZip(zipPath, (archive) => {
        // 把 db/全唐诗X 目录整体放到 zip 中的 db/ 下
        archive.directory(srcDir, path.join('db', dirName));
      });
    }

    console.log('所有 zip 文件生成完成。');
  } catch (err) {
    console.error('生成 zip 时出错:', err);
    process.exit(1);
  }
})();
