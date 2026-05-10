const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, 'public', '.htaccess');
const outputDir = path.join(projectRoot, 'out');
const targetPath = path.join(outputDir, '.htaccess');

if (!fs.existsSync(outputDir)) {
  console.error('Missing out directory. Run next build before copying .htaccess.');
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error('Missing public/.htaccess file.');
  process.exit(1);
}

fs.copyFileSync(sourcePath, targetPath);
console.log('Copied .htaccess to out/.htaccess');
