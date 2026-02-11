#!/usr/bin/env node

/**
 * Generate favicon PNG files from SVG
 * Converts favicon.svg to favicon-16x16.png and favicon-32x32.png
 * 
 * Usage: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgContent = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="24" fill="#2563eb"/>
  <circle cx="24" cy="24" r="6" fill="#ffffff"/>
</svg>`;

const outputDir = path.join(__dirname, '../frontend/public/favicons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateFavicons() {
  try {
    // 16x16 favicon
    await sharp(Buffer.from(svgContent))
      .resize(16, 16, { fit: 'fill' })
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));

    // 32x32 favicon
    await sharp(Buffer.from(svgContent))
      .resize(32, 32, { fit: 'fill' })
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));

  } catch (error) {
    console.error('Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
