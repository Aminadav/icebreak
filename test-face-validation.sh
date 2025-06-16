#!/bin/bash

# Test script for face validation functionality

echo "🧪 Testing Face Validation System"
echo "================================="

# Change to backend directory
cd backend

echo ""
echo "📋 Test Cases:"
echo "1. Testing with WhatsApp downloaded image (if exists)"
echo "2. Testing face validator directly"
echo ""

# Test 1: Check if there are any WhatsApp images downloaded
WHATSAPP_DIR="image_per_whatsapp"
if [ -d "$WHATSAPP_DIR" ] && [ "$(ls -A $WHATSAPP_DIR 2>/dev/null)" ]; then
    echo "🔍 Found WhatsApp images, testing validation..."
    for img in "$WHATSAPP_DIR"/*.jpg; do
        if [ -f "$img" ]; then
            echo "📸 Testing: $(basename "$img")"
            node image-recognization/face-validator.js "$img"
            echo ""
        fi
    done
else
    echo "ℹ️  No WhatsApp images found in $WHATSAPP_DIR"
fi

# Test 2: Test with existing test image if available
TEST_IMAGE="image-recognization/test-image.jpg"
if [ -f "$TEST_IMAGE" ]; then
    echo "🧪 Testing with test image:"
    node image-recognization/face-validator.js "$TEST_IMAGE"
else
    echo "ℹ️  No test image found at $TEST_IMAGE"
    echo "💡 You can add a test image to test the face validation system"
fi

echo ""
echo "✅ Face validation testing complete"
echo ""
echo "💡 To test with a specific image:"
echo "   cd backend && node image-recognization/face-validator.js /path/to/your/image.jpg"
