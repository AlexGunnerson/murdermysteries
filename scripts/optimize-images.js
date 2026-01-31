#!/usr/bin/env node
/**
 * Image Optimization Script
 * Optimizes the 22MB corkboard and large portrait images
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { width, height, quality = 85 } = options;
  
  console.log(`\n📸 Optimizing: ${path.basename(inputPath)}`);
  
  const inputStats = fs.statSync(inputPath);
  console.log(`   Before: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);
  
  try {
    let pipeline = sharp(inputPath);
    
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    await pipeline
      .jpeg({ quality, mozjpeg: true })
      .toFile(outputPath);
    
    const outputStats = fs.statSync(outputPath);
    console.log(`   After:  ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
    
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    console.log(`   ✅ Reduced by ${reduction}%`);
    
    return { before: inputStats.size, after: outputStats.size };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🎨 Starting Image Optimization...\n');
  console.log('=' .repeat(50));
  
  const rootDir = path.join(__dirname, '..');
  const imagesDir = path.join(rootDir, 'public/cases/case01/images');
  
  let totalBefore = 0;
  let totalAfter = 0;
  
  // 1. CRITICAL: Optimize 22MB corkboard (tile should be 512x512)
  console.log('\n🔴 CRITICAL: Optimizing corkboard background...');
  const corkboardInput = path.join(imagesDir, 'ui/corkboard.jpg');
  const corkboardOutput = path.join(imagesDir, 'ui/corkboard-optimized.jpg');
  
  const corkboardStats = await optimizeImage(corkboardInput, corkboardOutput, {
    width: 512,
    height: 512,
    quality: 85
  });
  totalBefore += corkboardStats.before;
  totalAfter += corkboardStats.after;
  
  // 2. Optimize large portrait images (keep aspect ratio, max 800px width)
  console.log('\n📷 Optimizing portrait images...');
  const portraitsDir = path.join(imagesDir, 'portraits');
  const portraits = [
    { name: 'martin.jpg', maxWidth: 800 },
    { name: 'lydia.jpg', maxWidth: 800 },
    { name: 'veronica_avi.png', maxWidth: 800 },
    { name: 'colin.jpg', maxWidth: 800 },
  ];
  
  for (const portrait of portraits) {
    const inputPath = path.join(portraitsDir, portrait.name);
    
    // Skip if file doesn't exist
    if (!fs.existsSync(inputPath)) {
      console.log(`\n⚠️  Skipping ${portrait.name} (not found)`);
      continue;
    }
    
    const ext = path.extname(portrait.name);
    const baseName = path.basename(portrait.name, ext);
    const outputPath = path.join(portraitsDir, `${baseName}-optimized.jpg`);
    
    try {
      const stats = await optimizeImage(inputPath, outputPath, {
        width: portrait.maxWidth,
        quality: 85
      });
      totalBefore += stats.before;
      totalAfter += stats.after;
    } catch (error) {
      console.log(`   ⚠️  Skipping ${portrait.name} due to error`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 OPTIMIZATION SUMMARY:');
  console.log(`   Total Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Total After:  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Total Saved:  ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Reduction:    ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
  console.log('\n✅ Optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update DetectiveNotebook.tsx to use corkboard-optimized.jpg');
  console.log('   2. Update image imports to use -optimized versions');
  console.log('   3. Test the page load performance');
  console.log('   4. Delete original large files once verified');
}

main().catch(error => {
  console.error('\n❌ Optimization failed:', error);
  process.exit(1);
});
