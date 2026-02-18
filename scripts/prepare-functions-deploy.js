const fs = require('fs');
const path = require('path');

const coreSrcDir = path.join(__dirname, '..', 'packages', 'core', 'src');
const targetDir = path.join(__dirname, '..', 'functions', 'src', 'core');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.name === 'node_modules') {
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Copying @viora/core source to functions...');
copyDir(coreSrcDir, targetDir);
console.log('✅ Done!');
