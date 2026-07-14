import fs from 'fs';
import path from 'path';

const distPath = path.join(process.cwd(), 'dist');
const swPath = path.join(distPath, 'sw.js');

if (!fs.existsSync(swPath)) {
  console.error('Service worker (sw.js) not found in dist/ folder!');
  process.exit(1);
}

// Read assets from dist/assets
const assetsDir = path.join(distPath, 'assets');
let assetFiles = [];
if (fs.existsSync(assetsDir)) {
  assetFiles = fs.readdirSync(assetsDir)
    .filter(file => file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
    .map(file => `./assets/${file}`);
}

console.log('Detected generated assets for precaching:', assetFiles);

// Read dist/sw.js content
let swContent = fs.readFileSync(swPath, 'utf8');

// Construct replacement array containing baseline files and exact bundle names
const precacheList = [
  './',
  './index.html',
  './manifest.json',
  ...assetFiles
];

const precacheReplacement = `const PRECACHE_ASSETS = ${JSON.stringify(precacheList, null, 2)};`;

// Replace the placeholder PRECACHE_ASSETS declaration
swContent = swContent.replace(/const PRECACHE_ASSETS\s*=\s*\[[^\]]*\];/g, precacheReplacement);

// Secondary check pattern in case of format differences
if (!swContent.includes(precacheReplacement)) {
  swContent = swContent.replace(/const PRECACHE_ASSETS\s*=\s*\[[\s\S]*?\];/g, precacheReplacement);
}

fs.writeFileSync(swPath, swContent, 'utf8');
console.log(`Successfully injected ${precacheList.length} assets into the Service Worker (dist/sw.js) precache!`);
