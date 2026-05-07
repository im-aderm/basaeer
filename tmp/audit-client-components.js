const fs = require('fs');
const path = require('path');
const basePath = '/home/im-adam/Desktop/basaeer';

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (['node_modules', '.git', '.next'].includes(file)) continue;
      filelist = walkSync(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const frontendFiles = walkSync(path.join(basePath, 'frontend/src'));
let clientComponents = 0;
let serverComponents = 0;

for (const file of frontendFiles) {
  if (!file.endsWith('.tsx')) continue;
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('"use client"') || content.includes("'use client'")) {
    clientComponents++;
  } else {
    serverComponents++;
  }
}
console.log(`Client Components: ${clientComponents}`);
console.log(`Server Components: ${serverComponents}`);
