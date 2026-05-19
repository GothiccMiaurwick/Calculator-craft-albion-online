const fs = require('fs');
const data = JSON.parse(fs.readFileSync('items_dump.json', 'utf8'));

const namesToFind = [
  "Badon", "Pica", "Lanza de la Trinidad", "desenfrenado", "raíz férrea", "forjacorteza", "Bastón flamígero", "Santificador",
  "Casco crepuscular", "Capucha de caminanieblas", "Armadura crepuscular", "Chaqueta de caminanieblas", "Zapatos de caminanieblas", "Botas crepuscular",
  "Sarcófago", "Partecaras", "Invocanieblas", "Bastón malicioso", "Vela de cripta", "Cetro sagrado", "Grimorio cronoestático"
];

const results = {};

for (const item of data) {
  if (item.LocalizedNames && item.LocalizedNames['ES-ES'] && item.UniqueName.startsWith('T4_') && !item.UniqueName.includes('@') && !item.UniqueName.includes('ARTEFACT')) {
    const esName = item.LocalizedNames['ES-ES'].toLowerCase();
    for (const targetName of namesToFind) {
      if (esName.includes(targetName.toLowerCase())) {
         if (!results[targetName]) {
             results[targetName] = [];
         }
         results[targetName].push(item.UniqueName);
      }
    }
  }
}

for (const key in results) {
  console.log(`${key}: ${results[key].join(', ')}`);
}
