const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const baseURL = 'https://deep-image.ai';

/**
 * Improve face details with upscaling and enhancement
 * @param {Object} options - Configuration options
 * @param {string} options.srcPath - Path to source image file
 * @param {string} options.dstPath - Path where to save the result
 * @param {number} [options.size] - Target size for output (defaults to 1024x1024)
 * @returns {Promise<string>} - Path to the enhanced image
 */
async function improveFace(options) {
  const { srcPath, dstPath, size = 1024 } = options;
  const startTime = Date.now();
  
  try {
    // Check if source file exists
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source file not found: ${srcPath}`);
    }

    // Ensure destination directory exists
    const destDir = path.dirname(dstPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    console.log(`Processing face image: ${srcPath}`);
    console.log(`Output size: ${size}x${size}`);
    console.log(`⏱️  Face enhancement started at: ${new Date().toLocaleTimeString()}`);

    // Check if mock mode is enabled
    if (process.env.MOCK_GENERATE === 'true') {
      console.log('🎭 Mock mode enabled - simulating face enhancement...');
      
      // Wait 3-8 seconds to simulate processing time
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 3000));
      
      // Copy mock output file to destination
      const mockOutputPath = path.join(__dirname, 'mock-output.png');
      
      if (!fs.existsSync(mockOutputPath)) {
        throw new Error(`Mock output file not found: ${mockOutputPath}`);
      }
      
      // Copy mock file to destination
      fs.copyFileSync(mockOutputPath, dstPath);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`🎭 Mock enhanced face image copied to: ${dstPath}`);
      console.log(`⏱️  Mock enhancement completed in: ${duration} seconds`);
      return dstPath;
    }

    // Prepare form data
    const formData = new FormData();

    // Add the image file
    formData.append('fileName', fs.createReadStream(srcPath));

    // Prepare parameters for face enhancement
    const parameters = {
      width: size,
      height: size,
      fit: "canvas", // Fit image into canvas, maintain aspect ratio
      enhancements: [
        "face_enhance",
        "denoise", 
        "deblur",
        "light",
        "color"
      ],
      face_enhance: {
        type: "beautify_real",
        level: 1.0, // 100%
        smoothing_level: 0.0 // 0% smoothing
      },
      denoise: {
        model: "v2"
      },
      deblur: {
        model: "v2"
      },
      light: {
        type: "v2",
        intensity: 1.0 // 100%
      },
      color: {
        saturation: 0.5, // 50%
        white_balance: 0.5 // 50%
      },
      output_format: "jpg",
      quality: 95
    };

    formData.append('parameters', JSON.stringify(parameters));

    // Make request to Deep Image AI
    const response = await axios.post(
      `${baseURL}/rest_api/process_result`,
      formData,
      {
        headers: {
          'X-API-KEY': process.env.DEEP_IMAGE_AI_API_KEY,
          ...formData.getHeaders()
        },
        timeout: 120000 // 2 minute timeout for face enhancement
      }
    );

    console.log('API Response:', response.data);

    if (response.data.status === 'complete' && response.data.result_url) {
      // Download the result image
      console.log('Downloading enhanced face from:', response.data.result_url);
      const imageResponse = await axios.get(response.data.result_url, {
        responseType: 'stream'
      });

      // Save to destination
      const writer = fs.createWriteStream(dstPath);
      imageResponse.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`Enhanced face image saved to: ${dstPath}`);
          console.log(`⏱️  Face enhancement completed in: ${duration} seconds`);
          resolve(dstPath);
        });
        writer.on('error', reject);
      });
    } else if (response.data.job) {
      // Job is processing, need to poll for result
      console.log(`Job created: ${response.data.job}. Polling for result...`);
      return await pollForResult(response.data.job, dstPath, 60, startTime); // Longer polling for face enhancement
    } else {
      throw new Error('Unexpected response from Deep Image AI');
    }

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ Face enhancement failed after ${duration} seconds`);
    console.error('Error enhancing face:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Poll for job result
 */
async function pollForResult(jobHash, dstPath, maxAttempts = 60, startTime = Date.now()) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Polling attempt ${attempt}/${maxAttempts}...`);

      const response = await axios.get(
        `${baseURL}/rest_api/result/${jobHash}`,
        {
          headers: {
            'X-API-KEY': process.env.DEEP_IMAGE_AI_API_KEY,
            'X-Application-Name': 'IcebreakApp'
          }
        }
      );

      if (response.data.status === 'complete' && response.data.result_url) {
        // Download the result image
        console.log('Downloading enhanced face from:', response.data.result_url);
        const imageResponse = await axios.get(response.data.result_url, {
          responseType: 'stream'
        });

        // Save to destination
        const writer = fs.createWriteStream(dstPath);
        imageResponse.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`Enhanced face image saved to: ${dstPath}`);
            console.log(`⏱️  Face enhancement completed in: ${duration} seconds`);
            resolve(dstPath);
          });
          writer.on('error', reject);
        });
      } else if (response.data.status === 'failed') {
        throw new Error(`Job failed: ${response.data.message || 'Unknown error'}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second intervals

    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`Polling timeout after ${maxAttempts} attempts`);
      }
      console.log(`Polling attempt ${attempt} failed, retrying...`);
    }
  }
}

/**
 * Get account information
 */
async function getAccountInfo() {
  try {
    const response = await axios.get(
      `${baseURL}/rest_api/me`,
      {
        headers: {
          'X-API-KEY': process.env.DEEP_IMAGE_AI_API_KEY,
          'X-Application-Name': 'IcebreakApp'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting account info:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main function for CLI usage
 */
async function main() {
  const args = process.argv.slice(2);

  // Default parameters
  let srcPath, dstPath, size;

  if (args.length === 0) {
    // Use default parameters when no arguments provided
    // process.env.MOCK_GENERATE = 'true'; 
    srcPath = 'test-deep-face.jpg';
    dstPath = 'output-enhanced-face.jpg';
    size = 1024;
    console.log('🎯 Running face enhancement with default parameters:');
    console.log(`   Source: ${srcPath}`);
    console.log(`   Destination: ${dstPath}`);
    console.log(`   Size: ${size}x${size}`);
    console.log('   Enhancement: Face beautify real, denoise v2, deblur v2, light v2, color enhancement');
    console.log('');
  } else if (args.length < 2) {
    console.log('Usage: node deep-image-improve-face.js [src_image] [dst_image] [size]');
    console.log('');
    console.log('Run without parameters to use defaults:');
    console.log('  node deep-image-improve-face.js');
    console.log('');
    console.log('Or provide custom parameters:');
    console.log('  node deep-image-improve-face.js test-deep-face.jpg enhanced-face.jpg 1024');
    process.exit(1);
  } else {
    // Use provided parameters
    [srcPath, dstPath] = args;
    const sizeStr = args[2];
    size = sizeStr ? parseInt(sizeStr) : 1024;
  }

  // Get API key from environment variable
  const apiKey = process.env.DEEP_IMAGE_AI_API_KEY;
  if (!apiKey) {
    console.error('Error: DEEP_IMAGE_AI_API_KEY environment variable is required');
    console.log('Set it with: export DEEP_IMAGE_AI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  try {
    // Check account info first
    console.log('Checking account info...');
    const accountInfo = await getAccountInfo();
    console.log(`Account: ${accountInfo.username}, Credits: ${accountInfo.credits}`);

    // Enhance the face
    const resultPath = await improveFace({ srcPath, dstPath, size });
    console.log(`\n✅ Success! Enhanced face image saved to: ${resultPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for module usage
module.exports = {
  improveFace,
  pollForResult,
  getAccountInfo
};

// Run main function if called directly
if (!module.parent) {
  main();
}
