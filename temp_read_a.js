// This is a temporary file to read a.js
const fs = require('fs');
const path = require('path');

try {
    const content = fs.readFileSync(path.join(__dirname, 'a.js'), 'utf8');
    console.log('Contents of a.js:');
    console.log('================');
    console.log(content);
} catch (error) {
    console.error('Error reading a.js:', error.message);
}
