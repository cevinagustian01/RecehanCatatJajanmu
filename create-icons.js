const fs = require('fs');
const path = require('path');

const icon192Path = path.join(__dirname, 'public', 'icon-192x192.png');
const icon512Path = path.join(__dirname, 'public', 'icon-512x512.png');

// 1x1 transparent PNG base64
const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(transparentPngBase64, 'base64');

fs.writeFileSync(icon192Path, buffer);
fs.writeFileSync(icon512Path, buffer);

console.log('Icons generated successfully.');
