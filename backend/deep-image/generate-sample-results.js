#!/usr/bin/env node

/**
 * @fileoverview Script to generate sample results for all prompts using male and female sample images
 * 
 * This script takes male and female sample files and generates images for all prompts,
 * organizing them into separate directories with descriptive filenames.
 */

const path = require('path');
const fs = require('fs');
const { deepImageGenerateBatch } = require('./deep-image-batch');

/**
 * Sanitizes a string to be safe for use as a filename
 * @param {string} str - The string to sanitize
 * @param {number} maxLength - Maximum length for the filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(str, maxLength = 30) {
  return str
    .substring(0, maxLength)
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')          // Remove leading/trailing hyphens
    .toLowerCase();
}

/**
 * Filters prompts by gender and returns relevant prompts for the specified gender
 * @param {Array} allPrompts - Array of prompt objects with gender and description
 * @param {string} targetGender - The gender to filter for ('male' or 'female')
 * @returns {Array} Filtered array of prompts
 */
function filterPromptsByGender(allPrompts, targetGender) {
  return allPrompts.filter(prompt => 
    prompt.gender === 'both' || prompt.gender === targetGender
  );
}

/**
 * Generates sample results for a specific gender
 * @param {string} sampleImagePath - Path to the sample image
 * @param {string} outputDir - Directory to save the results
 * @param {string} gender - Gender for filtering prompts ('male' or 'female')
 * @returns {Promise<void>}
 */
async function generateSampleForGender(sampleImagePath, outputDir, gender) {
  // Load all prompts
  const allPrompts = require('./prompts');
  
  // Filter prompts for this gender
  const relevantPrompts = filterPromptsByGender(allPrompts, gender);
  
  console.log(`\n🎯 Generating ${relevantPrompts.length} images for ${gender} using ${sampleImagePath}`);
  console.log(`📁 Output directory: ${outputDir}`);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create outputs array with descriptive filenames
  const outputs = relevantPrompts.map((prompt, index) => {
    const promptPrefix = sanitizeFilename(prompt.description, 60);
    const filename = `${String(index + 1).padStart(2, '0')}-${promptPrefix}.png`;
    return {
      dstPath: path.join(outputDir, filename),
      prompt: prompt.description
    };
  });
  
  // Generate batch
  try {
    const results = await deepImageGenerateBatch({
      srcPath: sampleImagePath,
      outputs: outputs,
      size: 1024,
      concurrency: 3 // Limit concurrency to avoid overwhelming the API
    });
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n✅ ${gender.toUpperCase()} generation completed:`);
    console.log(`   Successful: ${successful}/${relevantPrompts.length}`);
    console.log(`   Failed: ${failed}/${relevantPrompts.length}`);
    
    return results;
  } catch (error) {
    console.error(`❌ Error generating ${gender} samples:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now();
  
  console.log('🚀 Starting sample results generation');
  console.log('=====================================');
  
  // Define paths
  const baseDir = __dirname;
  const maleSamplePath = path.join(baseDir, 'man-sample.png');
  const femaleSamplePath = path.join(baseDir, 'female-sample.jpeg');
  const outputBaseDir = path.join(baseDir, 'sample-results');
  const maleOutputDir = path.join(outputBaseDir, 'male');
  const femaleOutputDir = path.join(outputBaseDir, 'female');
  
  // Verify sample files exist
  if (!fs.existsSync(maleSamplePath)) {
    console.error(`❌ Male sample file not found: ${maleSamplePath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(femaleSamplePath)) {
    console.error(`❌ Female sample file not found: ${femaleSamplePath}`);
    process.exit(1);
  }
  
  try {
    // Generate for both genders
    const maleResults = await generateSampleForGender(maleSamplePath, maleOutputDir, 'male');
    const femaleResults = await generateSampleForGender(femaleSamplePath, femaleOutputDir, 'female');
    
    // Calculate final statistics
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    const maleSuccessful = maleResults.filter(r => r.success).length;
    const femaleSuccessful = femaleResults.filter(r => r.success).length;
    const totalSuccessful = maleSuccessful + femaleSuccessful;
    const totalImages = maleResults.length + femaleResults.length;
    
    console.log('\n🎉 BATCH GENERATION COMPLETED');
    console.log('============================');
    console.log(`📊 Total images generated: ${totalSuccessful}/${totalImages}`);
    console.log(`👨 Male images: ${maleSuccessful}/${maleResults.length}`);
    console.log(`👩 Female images: ${femaleSuccessful}/${femaleResults.length}`);
    console.log(`⏱️  Total time: ${totalDuration} seconds`);
    console.log(`📁 Results saved in: ${outputBaseDir}`);
    
    if (totalSuccessful < totalImages) {
      const totalFailed = totalImages - totalSuccessful;
      console.log(`\n⚠️  ${totalFailed} images failed to generate`);
    }
    
  } catch (error) {
    console.error('❌ Batch generation failed:', error.message);
    process.exit(1);
  }
}

// Export for module usage
module.exports = {
  generateSampleForGender,
  filterPromptsByGender,
  sanitizeFilename
};

// Run main function if called directly
if (require.main === module) {
  main();
}
