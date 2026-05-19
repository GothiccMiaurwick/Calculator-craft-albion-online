const fs = require('fs');
const data = JSON.parse(fs.readFileSync('items_dump.json', 'utf8'));

const namesToFind = [
  "Espada ancha del iniciado", "Claymore del iniciado", "Dos espadas", "Hoja Clarent", "Espada tallada", "Dos galatinas", "Crea-reyes", "Hoja infinita",
  "Hacha de guerra", "Gran hacha", "Alabarda", "Llamacarroña", "Guadaña infernal", "Patas de oso", "Romperreinos", "Falce de cristal",
  "Maza", "Maza pesada", "Mangual", "Maza de lecho de roca", "Maza íncubo", "Maza de Camlann", "Juradores", "Monarca de la tormenta",
  "Martillo", "Martillo largo", "Gran martillo", "Martillo de la tumba", "Martillos de forja", "Guardabosques", "Mano de la justicia", "Martillo relámpago",
  "Guantes de peleador", "Brazales de batalla", "Guanteletes de púas", "Zarpas osunas", "Manos infernales", "Cestus córvidos", "Puños de Avalon", "Brazales de fuerza pulsante",
  "Ballesta", "Ballesta pesada", "Ballesta ligera", "Repetidora de desconsuelo", "Lanzasaetas", "Arco de asedio", "Modelador de energía", "Desintegradoras de luz",
  "Arco del iniciado", "Arco de guerra", "Arco largo", "Arco susurrante", "Arco de lamentaciones", "Arco de Badon", "Perforador de niebla", "Arco cruzacielos",
  "Daga", "Daga doble", "Garras", "Sangradora", "Colmillo demoníaco", "Concedemuertes", "Furia contenida", "Gemelas asesinas",
  "Lanza", "Pica", "Guja", "Lanza de garza", "Cazaespíritus", "Lanza de la trinidad", "Portador del alba", "Guja fisurante",
  "Vara", "Bastón metálico", "Bastón de doble filo", "Bastón de monje negro", "Guadaña de almas", "Bastón de equilibrio", "Buscador de grial", "Hoja doble fantasma",
  "Bastón de merodeador", "Bastón enrizado", "Bastón primitivo", "Bastón de luna sangrienta", "Bastón de criatura infernal", "Bastón terrúnico", "Invocador de luz", "Bastón de mirada firme",
  "Bastón natural", "Gran bastón natural", "Bastón salvaje", "Bastón druida", "Bastón de infortunio", "Bastón desenfrenado", "Bastón de raíz férrea", "Bastón de forjacorteza",
  "Bastón ígneo", "Gran bastón ígneo", "Bastón infernal", "Bastón de fuego incontrolable", "Bastón de azufre", "Bastón flamígero", "Canción del despertar", "Bastón de caminallamas",
  "Bastón sagrado", "Gran bastón sagrado", "Bastón divino", "Bastón de toque de vida", "Bastón caído", "Bastón de redención", "Santificador", "Bastón exaltado",
  "Bastón arcano", "Gran bastón arcano", "Bastón enigmático", "Bastón de brujería", "Bastón oculto", "Locus malévolo", "Sonido equilibrado", "Bastón astral",
  "Bastón de hielo", "Gran bastón de hielo", "Bastón glacial", "Bastón de escarcha", "Bastón de carámbanos", "Prisma de hielos perpetuos", "Grito gélido", "Bastón ártico",
  "Bastón maldito", "Gran bastón maldito", "Bastón demoníaco", "Bastón de maldición de vida", "Calavera maldita", "Bastón de maldiciones", "Invocador oscuro", "Bastón putrefacto"
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
