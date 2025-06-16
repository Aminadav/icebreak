const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
console.log(process.env.DEEP_IMAGE_AI_API_KEY);
class DeepImageAI {
  constructor() {
    this.baseURL = 'https://deep-image.ai';
  }

  /**
   * Generate an image with background generation and make it square
   * @param {string} srcPath - Path to source image file
   * @param {string} dstPath - Path where to save the result
   * @param {string} prompt - Description for background generation
   * @param {number} size - Square size for output (default: 1024)
   * @returns {Promise<string>} - Path to the generated image
   */
  async generateSquareImage(srcPath, dstPath, prompt, size = 1024) {
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

      console.log(`Processing image: ${srcPath}`);
      console.log(`Prompt: ${prompt}`);
      console.log(`Output size: ${size}x${size}`);

      // Prepare form data
      const formData = new FormData();

      // Add the image file
      formData.append('fileName', fs.createReadStream(srcPath));

      // Prepare parameters for square output with background generation
      const parameters = {
        width: size,
        height: size,
        fit: "canvas", // Fit image into canvas, fill missing space
        enhancements: [
          "denoise",
          "deblur",
          "clean",
          "face_enhance",
          "light",
          "color",
          "white_balance",
          "exposure_correction"
        ],
        background: {
          generate: {
            description: prompt,
            item_area_percentage: 0.7,
            "adapter_type": "face",
            "face_id": true
          }
        },
        output_format: "png",
        quality: 90
      };

      formData.append('parameters', JSON.stringify(parameters));

      // Make request to Deep Image AI
      const response = await axios.post(
        `${this.baseURL}/rest_api/process_result`,
        formData,
        {
          headers: {
            'X-API-KEY': process.env.DEEP_IMAGE_AI_API_KEY,
            'X-Application-Name': 'IcebreakApp',
            ...formData.getHeaders()
          },
          timeout: 60000 // 60 second timeout
        }
      );

      console.log('API Response:', response.data);

      if (response.data.status === 'complete' && response.data.result_url) {
        // Download the result image
        console.log('Downloading result from:', response.data.result_url);
        const imageResponse = await axios.get(response.data.result_url, {
          responseType: 'stream'
        });

        // Save to destination
        const writer = fs.createWriteStream(dstPath);
        imageResponse.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            console.log(`Image saved to: ${dstPath}`);
            resolve(dstPath);
          });
          writer.on('error', reject);
        });
      } else if (response.data.job) {
        // Job is processing, need to poll for result
        console.log(`Job created: ${response.data.job}. Polling for result...`);
        return await this.pollForResult(response.data.job, dstPath);
      } else {
        throw new Error('Unexpected response from Deep Image AI');
      }

    } catch (error) {
      console.error('Error generating image:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Poll for job result
   */
  async pollForResult(jobHash, dstPath, maxAttempts = 30) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Polling attempt ${attempt}/${maxAttempts}...`);

        const response = await axios.get(
          `${this.baseURL}/rest_api/result/${jobHash}`,
          {
            headers: {
              'X-API-KEY': process.env.DEEP_IMAGE_AI_API_KEY,
              'X-Application-Name': 'IcebreakApp'
            }
          }
        );

        if (response.data.status === 'complete' && response.data.result_url) {
          // Download the result image
          console.log('Downloading result from:', response.data.result_url);
          const imageResponse = await axios.get(response.data.result_url, {
            responseType: 'stream'
          });

          // Save to destination
          const writer = fs.createWriteStream(dstPath);
          imageResponse.data.pipe(writer);

          return new Promise((resolve, reject) => {
            writer.on('finish', () => {
              console.log(`Image saved to: ${dstPath}`);
              resolve(dstPath);
            });
            writer.on('error', reject);
          });
        } else if (response.data.status === 'failed') {
          throw new Error(`Job failed: ${response.data.message || 'Unknown error'}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));

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
  async getAccountInfo() {
    try {
      const response = await axios.get(
        `${this.baseURL}/rest_api/me`,
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
}

/**
 * Main function for CLI usage
 */
async function main() {
  const args = process.argv.slice(2);

  // Default parameters
  let srcPath, dstPath, prompt, size;

  if (args.length === 0) {
    // Use default parameters when no arguments provided
    srcPath = 'test-deep-face.jpg';
    dstPath = 'output-professional-portrait.png';
    prompt = 'Generate a professional portrait of a man wearing a business suit, in an office background. The face should be centered so that if the image is later cropped into a circle, the face remains properly aligned. Position the eyes slightly above the horizontal center of the image.';
    size = 1024;
    console.log('🎯 Running with default parameters:');
    console.log(`   Source: ${srcPath}`);
    console.log(`   Destination: ${dstPath}`);
    console.log(`   Size: ${size}x${size}`);
    console.log(`   Prompt: ${prompt}`);
    console.log('');
  } else if (args.length < 3) {
    console.log('Usage: node deep-image-ai.js [src_image] [dst_image] [prompt] [size]');
    console.log('');
    console.log('Run without parameters to use defaults:');
    console.log('  node deep-image-ai.js');
    console.log('');
    console.log('Or provide custom parameters:');
    console.log('  node deep-image-ai.js test-deep-face.jpg output.png "professional office background" 1024');
    process.exit(1);
  } else {
    // Use provided parameters
    [srcPath, dstPath, prompt] = args;
    const sizeStr = args[3];
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
    const deepImage = new DeepImageAI(apiKey);

    // Check account info first
    console.log('Checking account info...');
    const accountInfo = await deepImage.getAccountInfo();
    console.log(`Account: ${accountInfo.username}, Credits: ${accountInfo.credits}`);

    // Generate the image
    const resultPath = await deepImage.generateSquareImage(srcPath, dstPath, prompt, size);
    console.log(`\n✅ Success! Generated image saved to: ${resultPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for module usage
module.exports = DeepImageAI;

// Run main function if called directly
if (require.main === module) {
  main();
}
