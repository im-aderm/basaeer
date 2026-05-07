const fs = require('fs');
const path = require('path');

const basePath = '/home/im-adam/Desktop/basaeer';

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', '.netlify'].includes(file)) continue;
      filelist = walkSync(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const frontendFiles = walkSync(path.join(basePath, 'frontend/src'));
const backendFiles = walkSync(path.join(basePath, 'backend/src'));

let todoCount = 0;
let fixmeCount = 0;
let mockDataCount = 0;
const todos = [];

function analyzeFiles(files, prefix) {
  let anyTypes = 0;
  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('TODO')) { todoCount++; todos.push(`${prefix}:${file.split(basePath)[1]}:${idx+1} - ${line.trim()}`); }
      if (line.includes('FIXME')) fixmeCount++;
      // Count basic any occurrences (this is a rough heuristic)
      if (line.includes(': any ') || line.includes(': any') || line.includes('<any>')) anyTypes++;
      if (line.toLowerCase().includes('mock') || line.includes('dummy')) mockDataCount++;
    });
  }
  return { anyTypes };
}

const feStats = analyzeFiles(frontendFiles, 'FE');
const beStats = analyzeFiles(backendFiles, 'BE');

console.log('--- AUDIT REPORT STATS ---');
console.log(`Frontend Files: ${frontendFiles.length}`);
console.log(`Backend Files: ${backendFiles.length}`);
console.log(`TODOs: ${todoCount}`);
console.log(`FIXMEs: ${fixmeCount}`);
console.log(`Mock/Dummy lines: ${mockDataCount}`);
console.log(`FE 'any' usages: ${feStats.anyTypes}`);
console.log(`BE 'any' usages: ${beStats.anyTypes}`);
console.log('Sample TODOs:');
console.log(todos.slice(0, 15).join('\n'));

// Find UI pages without backend logic
const pages = frontendFiles.filter(f => f.endsWith('page.tsx'));
console.log(`\nPages count: ${pages.length}`);

// Find Controllers
const controllers = backendFiles.filter(f => f.endsWith('.controller.ts'));
console.log(`Controllers count: ${controllers.length}`);
