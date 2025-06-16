require('dotenv').config({ path: __dirname +'/../.env' });
const fs = require('fs');
const path = require('path');
/**
 * Validates if an image contains one clear, usable face
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{isValid: boolean, reason?: string, faceCount?: number, quality?: string}>}
 */
async function validateFaceInImage(imagePath) {
    try {
        if (!fs.existsSync(imagePath)) {
            throw new Error('Image file not found');
        }

        // Read and encode the image
        const imageBuffer = fs.readFileSync(imagePath);
        const ext = path.extname(imagePath).toLowerCase();
        
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.gif') mimeType = 'image/gif';
        
        const base64Image = imageBuffer.toString('base64');
        const imageData = `data:${mimeType};base64,${base64Image}`;

        // OpenAI Vision API request for face validation
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPEN_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                response_format:{ "type": "json_object" },
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this image for face suitability for a profile picture. I need to know:
1. How many faces are clearly visible?
2. Is there ONE dominant/main face that takes up a good portion of the image?
3. Is the main face clear, well-lit, and not blurry?
4. Is it suitable for use as a profile picture?

Respond with ONLY a JSON object in this exact format:
{
  "faceCount": number,
  "hasOneDominantFace": true/false,
  "faceQuality": "excellent"/"good"/"poor",
  "isProfilePictureReady": true/false,
  "reason": "brief explanation if not suitable"
}

Do not include any other text.`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageData
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse the JSON response
        const result = JSON.parse(content);
        
        // Validate response format
        if (typeof result.faceCount !== 'number' || typeof result.hasOneDominantFace !== 'boolean') {
            throw new Error('Invalid response format from OpenAI');
        }

        // Determine if the image is valid for use
        const isValid = result.isProfilePictureReady === true && 
                       result.hasOneDominantFace === true && 
                       result.faceCount == 1 && 
                       ['excellent', 'good'].includes(result.faceQuality);

        return {
            isValid,
            faceCount: result.faceCount,
            hasOneDominantFace: result.hasOneDominantFace,
            quality: result.faceQuality,
            reason: isValid ? 'Image contains one clear, usable face' : (result.reason || 'Image not suitable for profile picture')
        };

    } catch (error) {
        console.error('Error in face validation:', error.message);
        return {
            isValid: false,
            reason: `Validation failed: ${error.message}`
        };
    }
}

// CLI testing functionality
async function runTest() {
    const testImagePath = process.argv[2] || path.join(__dirname, 'test-image.jpg');
    
    if (!fs.existsSync(testImagePath)) {
        console.error('Test image not found:', testImagePath);
        console.log('Usage: node face-validator.js [image-path]');
        process.exit(1);
    }
    
    console.log('Testing face validation with:', testImagePath);
    
    try {
        const result = await validateFaceInImage(testImagePath);
        console.log('Validation result:', JSON.stringify(result, null, 2));
        
        if (result.isValid) {
            console.log('✅ Image is suitable for use as profile picture');
        } else {
            console.log('❌ Image is NOT suitable:', result.reason);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

// Export for module use
module.exports = { validateFaceInImage };

// CLI execution
if (require.main === module) {
    runTest();
}
