const fs = require('fs');

const itemsTs = fs.readFileSync('src/lib/items.ts', 'utf8');
const data = JSON.parse(fs.readFileSync('items_dump.json', 'utf8'));

// Get all valid T4 UniqueNames from the dump (excluding enchantments and artefacts since we append those dynamically, but we should check the base name)
const validNames = new Set();
for (const item of data) {
  if (item.UniqueName.startsWith('T4_') && !item.UniqueName.includes('@') && !item.UniqueName.includes('ARTEFACT')) {
    validNames.add(item.UniqueName.substring(3)); // Remove 'T4_'
  }
}

// Find all used base IDs in items.ts
const regex = /buildTreeItem\('([^']+)'/g;
let match;
const missing = [];

while ((match = regex.exec(itemsTs)) !== null) {
  const baseId = match[1];
  if (!validNames.has(baseId) && !['BAG', 'BAG_INSIGHT'].includes(baseId)) { // skip generic bags just in case
    missing.push(baseId);
  }
}

console.log('Total invalid IDs found: ', missing.length);
console.log('Invalid IDs:', missing.join(', '));
