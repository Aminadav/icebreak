require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

/**
 * @param {string} srcImage - Path to the image file or base64 encoded image
 * @returns {Promise<{gender:string, age:number}>}
 */
async function genderAgeDetector({srcImage}) {
    try {
        // Prepare image data
        let imageData;
        let mimeType = 'image/jpeg';
        
        if (srcImage.startsWith('data:')) {
            // Already base64 encoded
            imageData = srcImage;
        } else if (fs.existsSync(srcImage)) {
            // File path - read and encode
            const imageBuffer = fs.readFileSync(srcImage);
            const ext = path.extname(srcImage).toLowerCase();
            
            if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.webp') mimeType = 'image/webp';
            else if (ext === '.gif') mimeType = 'image/gif';
            
            const base64Image = imageBuffer.toString('base64');
            imageData = `data:${mimeType};base64,${base64Image}`;
        } else {
            throw new Error('Invalid image source: must be a file path or base64 encoded data');
        }

        // OpenAI Vision API request
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPEN_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Analyze this image and determine the person's gender and approximate age. Respond with ONLY a JSON object in this exact format: {\"gender\": \"male\" or \"female\", \"age\": number}. Do not include any other text or explanation."
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
                max_tokens: 100
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
        if (!result.gender || typeof result.age !== 'number') {
            throw new Error('Invalid response format from OpenAI');
        }
        
        return {
            gender: result.gender.toLowerCase(),
            age: result.age
        };

    } catch (error) {
        console.error('Error in genderAgeDetector:', error.message);
        throw error;
    }
}

// CLI testing functionality
async function runTest() {
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    if (!fs.existsSync(testImagePath)) {
        console.error('Test image not found:', testImagePath);
        process.exit(1);
    }
    
    console.log('Testing gender and age detection with test image...');
    
    try {
        const result = await genderAgeDetector({ srcImage: testImagePath });
        console.log('Detection result:', result);
        console.log(`Detected: ${result.gender}, approximately ${result.age} years old`);
    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

// Export for module use
module.exports = { genderAgeDetector };

// CLI execution
if (require.main === module) {
    // Check if running as CLI without arguments
    if (process.argv.length === 2) {
        runTest();
    } else {
        console.log('Usage: node gender-age-detector.js');
        console.log('Runs test with test-image.jpg in the same directory');
    }
}