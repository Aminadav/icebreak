#!/usr/bin/env node

/**
 * @fileoverview Quick summary script to show what sample results were generated
 */

const fs = require('fs');
const path = require('path');

function showSampleResults() {
  const baseDir = path.join(__dirname, 'sample-results');
  
  if (!fs.existsSync(baseDir)) {
    console.log('❌ No sample-results directory found');
    return;
  }
  
  const maleDir = path.join(baseDir, 'male');
  const femaleDir = path.join(baseDir, 'female');
  
  console.log('📊 Sample Results Summary');
  console.log('========================');
  
  if (fs.existsSync(maleDir)) {
    const maleFiles = fs.readdirSync(maleDir).filter(f => f.endsWith('.png'));
    console.log(`👨 Male samples: ${maleFiles.length} images`);
    maleFiles.slice(0, 5).forEach(file => {
      console.log(`   • ${file}`);
    });
    if (maleFiles.length > 5) {
      console.log(`   ... and ${maleFiles.length - 5} more`);
    }
  }
  
  console.log('');
  
  if (fs.existsSync(femaleDir)) {
    const femaleFiles = fs.readdirSync(femaleDir).filter(f => f.endsWith('.png'));
    console.log(`👩 Female samples: ${femaleFiles.length} images`);
    femaleFiles.slice(0, 5).forEach(file => {
      console.log(`   • ${file}`);
    });
    if (femaleFiles.length > 5) {
      console.log(`   ... and ${femaleFiles.length - 5} more`);
    }
  }
  
  const totalFiles = (fs.existsSync(maleDir) ? fs.readdirSync(maleDir).filter(f => f.endsWith('.png')).length : 0) +
                    (fs.existsSync(femaleDir) ? fs.readdirSync(femaleDir).filter(f => f.endsWith('.png')).length : 0);
  
  console.log('');
  console.log(`🎉 Total: ${totalFiles} sample images generated`);
  console.log(`📁 Location: ${baseDir}`);
}

if (require.main === module) {
  showSampleResults();
}

module.exports = { showSampleResults };
