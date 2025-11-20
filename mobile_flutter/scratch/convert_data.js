const fs = require('fs');
const path = require('path');

const srcPath = 'd:/1/frontend/src/data/curatedPlans.js';
const destPath = 'd:/1/mobile_flutter/assets/data/curated_plans.json';

try {
    const content = fs.readFileSync(srcPath, 'utf8');
    // Extract the array
    const match = content.match(/export const curatedPlans = (\[[\s\S]*\]);/);
    if (!match) throw new Error('Could not find curatedPlans array');

    let jsonStr = match[1];

    // Basic cleanup for non-standard JS objects to JSON
    // 1. Add quotes to keys
    jsonStr = jsonStr.replace(/(\s+)(\w+):/g, '$1"$2":');
    // 2. Replace single quotes with double quotes
    jsonStr = jsonStr.replace(/'/g, '"');
    // 3. Remove trailing commas
    jsonStr = jsonStr.replace(/,\s*\]/g, ']');
    jsonStr = jsonStr.replace(/,\s*\}/g, '}');

    // Ensure the directory exists
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(destPath, jsonStr);
    console.log('Successfully converted curatedPlans.js to JSON');
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
