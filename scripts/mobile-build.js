const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'www');

const WEB_DIRS = ['src', 'assets', 'vendor'];
const WEB_FILES = ['index.html'];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);

for (const file of WEB_FILES) {
  fs.copyFileSync(path.join(ROOT, file), path.join(OUT, file));
}

for (const dir of WEB_DIRS) {
  copyRecursive(path.join(ROOT, dir), path.join(OUT, dir));
}

console.log('www/ ready for cap sync');
