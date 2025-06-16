const path = require('path');
const fs = require('fs');
const { generateSquareImage } = require('./deep-image-ai');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

/**
 * Generate multiple images in parallel with different prompts
 * @param {Object} options - Configuration options
 * @param {string} options.srcPath - Path to source image file
 * @param {Array} options.outputs - Array of {dstPath, prompt} objects
 * @param {number} [options.size=1024] - Square size for output
 * @param {number} [options.concurrency=3] - Maximum concurrent requests
 * @returns {Promise<Array>} - Array of generated image paths
 */
async function deepImageGenerateBatch(options) {
  const { srcPath, outputs, size = 1024, concurrency = 10 } = options;
  const startTime = Date.now();
  
  console.log(`🚀 Starting batch generation of ${outputs.length} images`);
  console.log(`   Source: ${srcPath}`);
  console.log(`   Concurrency: ${concurrency}`);
  console.log(`   Size: ${size}x${size}`);
  console.log(`⏱️  Batch started at: ${new Date().toLocaleTimeString()}`);
  console.log('');

  // Function to process a single batch item
  const processImage = async (output, index) => {
    try {
      console.log(`📸 [${index + 1}/${outputs.length}] Starting: ${output.dstPath}`);
      console.log(`   Prompt: ${output.prompt.substring(0, 80)}...`);
      
      const result = await generateSquareImage({
        srcPath,
        dstPath: output.dstPath,
        prompt: output.prompt,
        size
      });
      
      console.log(`✅ [${index + 1}/${outputs.length}] Completed: ${output.dstPath}`);
      return { success: true, path: result, index, prompt: output.prompt };
    } catch (error) {
      console.error(`❌ [${index + 1}/${outputs.length}] Failed: ${output.dstPath}`);
      console.error(`   Error: ${error.message}`);
      return { success: false, error: error.message, index, prompt: output.prompt };
    }
  };

  // Process images with concurrency limit
  const results = [];
  const inProgress = [];
  
  for (let i = 0; i < outputs.length; i++) {
    // Start the promise but don't await yet
    const promise = processImage(outputs[i], i);
    inProgress.push(promise);
    
    // If we've reached the concurrency limit or this is the last item
    if (inProgress.length >= concurrency || i === outputs.length - 1) {
      // Wait for all current batch to complete
      const batchResults = await Promise.all(inProgress);
      results.push(...batchResults);
      
      // Clear the in-progress array for next batch
      inProgress.length = 0;
    }
  }

  // Calculate final statistics
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('');
  console.log('📊 Batch Generation Summary:');
  console.log(`   Total: ${outputs.length} images`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${failed}`);
  console.log(`⏱️  Total time: ${duration} seconds`);
  console.log(`   Average: ${(duration / outputs.length).toFixed(2)} seconds per image`);
  
  if (failed > 0) {
    console.log('');
    console.log('❌ Failed images:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   [${r.index + 1}] ${r.error}`);
    });
  }

  return results;
}

/**
 * Main function for CLI usage
 */
async function main() {
  const args = process.argv.slice(2);
  
  let srcPath, outputs, size;

  if (args.length === 0) {
    // Use default parameters when no arguments provided
    srcPath = 'test-deep-face.jpg';
    size = 1024;
    
    // Load prompts from prompts.json
    const promptsPath = path.join(__dirname, 'prompts.json');
    if (!fs.existsSync(promptsPath)) {
      console.error('❌ prompts.json file not found!');
      console.log('Create a prompts.json file with an array of prompt strings.');
      process.exit(1);
    }
    
    const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    
    // Generate outputs array with automatic numbering
    outputs = prompts.map((prompt, index) => ({
      dstPath: `output-${index + 1}.png`,
      prompt: prompt.description // Extract description from the new format
    }));
    
    console.log('🎯 Running with default parameters:');
    console.log(`   Source: ${srcPath}`);
    console.log(`   Outputs: ${outputs.length} images (from prompts.json)`);
    console.log(`   Size: ${size}x${size}`);
    outputs.forEach((output, i) => {
      console.log(`   [${i + 1}] ${output.dstPath}: ${output.prompt.substring(0, 60)}...`);
    });
    console.log('');
  } else {
    console.log('Usage: node deep-image-batch.js');
    console.log('');
    console.log('This tool runs with predefined parameters for batch processing.');
    console.log('It automatically loads prompts from prompts.json file.');
    console.log('Modify prompts.json to customize the prompts.');
    process.exit(1);
  }

  // Get API key from environment variable
  const apiKey = process.env.DEEP_IMAGE_AI_API_KEY;
  if (!apiKey) {
    console.error('Error: DEEP_IMAGE_AI_API_KEY environment variable is required');
    console.log('Set it with: export DEEP_IMAGE_AI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  try {
    // Run batch generation
    const results = await deepImageGenerateBatch({ srcPath, outputs, size });
    
    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
      console.log('');
      console.log('✅ Successfully generated images:');
      successful.forEach(r => {
        console.log(`   ${r.path}`);
      });
    }

  } catch (error) {
    console.error('❌ Batch Error:', error.message);
    process.exit(1);
  }
}

// Export for module usage
module.exports = {
  deepImageGenerateBatch
};

// Run main function if called directly
if (require.main === module) {
  main();
}
