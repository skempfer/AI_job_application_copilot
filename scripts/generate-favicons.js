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

// SVG content - Viora favicon (circle with clarity point)
const svgContent = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="24" fill="#2563eb"/>
  <circle cx="24" cy="24" r="6" fill="#ffffff"/>
</svg>`;

// Output directory
const outputDir = path.join(__dirname, '../frontend/public/favicons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate favicons
async function generateFavicons() {
  try {
    console.log('Generating favicons...\n');

    // 16x16 favicon
    await sharp(Buffer.from(svgContent))
      .resize(16, 16, { fit: 'fill' })
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('✓ Created favicon-16x16.png');

    // 32x32 favicon
    await sharp(Buffer.from(svgContent))
      .resize(32, 32, { fit: 'fill' })
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('✓ Created favicon-32x32.png');

    console.log('\n✓ Favicons generated successfully!');
    console.log(`Output directory: ${outputDir}`);
  } catch (error) {
    console.error('Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
