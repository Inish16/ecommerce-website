#!/usr/bin/env node
/* Check all product image URLs for broken/404 */
const https = require('https');
const http = require('http');

// Load products data
const fs = require('fs');
const dataContent = fs.readFileSync(__dirname + '/products-data.js', 'utf8');

// Extract image URLs
const urlRegex = /https:\/\/images\.unsplash\.com\/[^"]+/g;
const allUrls = [...new Set(dataContent.match(urlRegex) || [])];

// Normalize URLs to just the photo ID
const photoIds = new Set();
allUrls.forEach(url => {
  const match = url.match(/unsplash\.com\/(photo-[^?]+)/);
  if (match) photoIds.add(match[1]);
});

console.log('Total unique image URLs:', allUrls.length);
console.log('Total unique photo IDs:', photoIds.size);
console.log('');

// Test each unique photo ID
let tested = 0;
let broken = [];
let working = [];

function testUrl(photoId) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/${photoId}?w=100&q=10`;
    const req = https.get(url, { timeout: 8000 }, (res) => {
      tested++;
      if (res.statusCode >= 400) {
        broken.push({ id: photoId, status: res.statusCode });
        console.log(`❌ ${photoId} → ${res.statusCode}`);
      } else {
        working.push(photoId);
      }
      // Consume response data to free up memory
      res.resume();
      resolve();
    });
    req.on('error', (e) => {
      tested++;
      broken.push({ id: photoId, status: 'ERROR: ' + e.message });
      console.log(`❌ ${photoId} → ERROR: ${e.message}`);
      resolve();
    });
    req.on('timeout', () => {
      tested++;
      broken.push({ id: photoId, status: 'TIMEOUT' });
      console.log(`❌ ${photoId} → TIMEOUT`);
      req.destroy();
      resolve();
    });
  });
}

async function main() {
  const ids = [...photoIds];
  // Test in batches of 5
  for (let i = 0; i < ids.length; i += 5) {
    const batch = ids.slice(i, i + 5);
    await Promise.all(batch.map(testUrl));
    process.stdout.write(`  Progress: ${tested}/${ids.length}\r`);
  }
  
  console.log('\n\n========== RESULTS ==========');
  console.log(`Working: ${working.length}`);
  console.log(`Broken: ${broken.length}`);
  
  if (broken.length > 0) {
    console.log('\n--- BROKEN IMAGE IDs ---');
    broken.forEach(b => console.log(`  ${b.id} → ${b.status}`));
    
    // Find which products use broken images
    console.log('\n--- AFFECTED PRODUCTS ---');
    broken.forEach(b => {
      // Find matching lines in data
      const lines = dataContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(b.id)) {
          // Find the product name (search backwards)
          for (let j = i; j >= Math.max(0, i - 15); j--) {
            const nameMatch = lines[j].match(/"name":\s*"([^"]+)"/);
            if (nameMatch) {
              console.log(`  Product: "${nameMatch[1]}" uses broken image: ${b.id}`);
              break;
            }
          }
          break;
        }
      }
    });
  }
}

main();
