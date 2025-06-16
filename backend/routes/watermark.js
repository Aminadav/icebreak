const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * GET /api/watermark/:imageHash
 * 
 * Returns an image with a watermark positioned at 80% from the top and full width
 * keeping the watermark's aspect ratio
 */
router.get('/:imageHash', async (req, res) => {
  try {
    const { imageHash } = req.params;
    
    if (!imageHash) {
      return res.status(400).json({ error: 'Image hash is required' });
    }

    // Validate imageHash format (should be MD5 hash)
    if (!/^[a-f0-9]{32}$/i.test(imageHash)) {
      return res.status(400).json({ error: 'Invalid image hash format' });
    }

    // Check cache first
    const cacheKey = `watermarked-${imageHash}`;
    const cacheDir = path.join(__dirname, '..', 'cache');
    const cachedImagePath = path.join(cacheDir, `${cacheKey}.jpg`);
    
    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // If cached version exists, serve it
    if (fs.existsSync(cachedImagePath)) {
      console.log(`🚀 Serving cached watermarked image for hash: ${imageHash}`);
      
      const cachedImage = fs.readFileSync(cachedImagePath);
      
      res.set({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': cachedImage.length
      });
      
      return res.send(cachedImage);
    }

    // Construct original image path
    const imagePath = path.join(__dirname, '..', 'uploads', `${imageHash}.jpg`);
    
    // Check if original image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Path to watermark
    const watermarkPath = path.join(__dirname, '..', 'assets', 'watermark.png');
    

    // Get image metadata
    const imageMetadata = await sharp(imagePath).metadata();
    const { width: imageWidth, height: imageHeight } = imageMetadata;

    // Get watermark metadata
    const watermarkMetadata = await sharp(watermarkPath).metadata();
    const { width: watermarkWidth, height: watermarkHeight } = watermarkMetadata;

    // Calculate watermark dimensions to fit full width while keeping aspect ratio
    const targetWatermarkWidth = imageWidth;
    const aspectRatio = watermarkHeight / watermarkWidth;
    const targetWatermarkHeight = Math.round(targetWatermarkWidth * aspectRatio);

    // Calculate position: 80% from the top
    const topPosition = Math.round(imageHeight * 0.8);

    // Resize watermark to fit full width
    const resizedWatermark = await sharp(watermarkPath)
      .resize(targetWatermarkWidth, targetWatermarkHeight)
      .png() // Ensure PNG format for transparency
      .toBuffer();

    // Composite the watermark onto the image
    const result = await sharp(imagePath)
      .composite([{
        input: resizedWatermark,
        left: 0,
        top: topPosition,
        blend: 'over'
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Save to cache
    fs.writeFileSync(cachedImagePath, result);
    console.log(`💾 Watermarked image cached with key: ${cacheKey}`);

    // Set response headers
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Length': result.length
    });

    // Send the watermarked image
    res.send(result);

    console.log(`🏷️ Watermarked image generated and served for hash: ${imageHash}`);

  } catch (error) {
    console.error('Error creating watermarked image:', error);
    res.status(500).json({ 
      error: 'Failed to create watermarked image',
      message: error.message 
    });
  }
});

module.exports = router;