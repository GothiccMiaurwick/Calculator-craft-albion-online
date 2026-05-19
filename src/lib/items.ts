// Full Albion Online item database with categories, subcategories and items

export type Server = 'west' | 'east' | 'europe';

export interface Material {
  id: string;
  name: string;
  quantity: number;
  isArtifact?: boolean;
}

export interface AlbionItem {
  id: string;
  name: string;
  baseId: string; // base ID without tier prefix, for display
  category: string;
  subcategory: string;
  materials: Material[];
}

export interface TreeItem {
  id: string; // base name like "ESPADA_ANCHA"
  name: string;
  tiers: { [tier: number]: { [enchant: number]: AlbionItem } };
}

export interface Subcategory {
  id: string;
  name: string;
  items: TreeItem[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export const CITIES = ['Caerleon', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling'];
export const SERVERS: { id: Server; name: string }[] = [
  { id: 'west', name: 'Americas (West)' },
  { id: 'east', name: 'Asia (East)' },
  { id: 'europe', name: 'Europe' },
];
export const TIERS = [4, 5, 6, 7, 8];
export const ENCHANTS = [0, 1, 2, 3, 4];

export function getItemImageUrl(itemId: string): string {
  return `https://render.albiononline.com/v1/item/${itemId}.png`;
}

/**
 * Normalizes item IDs for consistent lookups.
 * Converts to uppercase and trims whitespace.
 */
export function normalizeId(id: string): string {
  if (!id) return '';
  return id.toUpperCase().trim();
}

// ─── Helper: Build item for a given tier/enchant ──────────────────────────────
function buildItem(
  baseName: string,
  displayName: string,
  category: string,
  subcategory: string,
  tier: number,
  enchant: number
): AlbionItem {
  const suffix = enchant > 0 ? `@${enchant}` : '';
  const id = `T${tier}_${baseName}${suffix}`;
  
  return Object.freeze({ 
    id: normalizeId(id), 
    name: displayName, 
    baseId: baseName, 
    category, 
    subcategory, 
    materials: [] // Populations will happen dynamically from API
  });
}

function buildTreeItem(
  baseName: string,
  displayName: string,
  category: string,
  subcategory: string
): TreeItem {
  const tiers: TreeItem['tiers'] = {};
  for (const tier of TIERS) {
    tiers[tier] = {};
    for (const enchant of ENCHANTS) {
      tiers[tier][enchant] = buildItem(baseName, displayName, category, subcategory, tier, enchant);
    }
  }
  return { id: baseName, name: displayName, tiers };
}

// ─── Full Categories ──────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  {
    id: 'armas', name: 'ARMAS', icon: 'Sword',
    subcategories: [
      {
        id: 'espadas', name: 'ESPADAS',
        items: [
          buildTreeItem('MAIN_SWORD', 'ESPADA ANCHA', 'armas', 'espadas'),
          buildTreeItem('2H_CLAYMORE', 'CLAYMORE', 'armas', 'espadas'),
          buildTreeItem('2H_DUALSWORD', 'DOS ESPADAS', 'armas', 'espadas'),
          buildTreeItem('MAIN_SCIMITAR_MORGANA', 'HOJA CLARENT', 'armas', 'espadas'),
          buildTreeItem('2H_CLEAVER_HELL', 'ESPADA TALLADA', 'armas', 'espadas'),
          buildTreeItem('2H_DUALSCIMITAR_UNDEAD', 'DOS GALATINAS', 'armas', 'espadas'),
          buildTreeItem('2H_CLAYMORE_AVALON', 'CREA-REYES', 'armas', 'espadas'),
          buildTreeItem('MAIN_SWORD_CRYSTAL', 'HOJA INFINITA', 'armas', 'espadas'),
        ],
      },
      {
        id: 'hachas', name: 'HACHAS',
        items: [
          buildTreeItem('MAIN_AXE', 'HACHA DE GUERRA', 'armas', 'hachas'),
          buildTreeItem('2H_AXE', 'GRAN HACHA', 'armas', 'hachas'),
          buildTreeItem('2H_HALBERD', 'ALABARDA', 'armas', 'hachas'),
          buildTreeItem('2H_HALBERD_MORGANA', 'LLAMACARROÑA', 'armas', 'hachas'),
          buildTreeItem('2H_SCYTHE_HELL', 'GUADAÑA INFERNAL', 'armas', 'hachas'),
          buildTreeItem('2H_DUALAXE_KEEPER', 'PATAS DE OSO', 'armas', 'hachas'),
          buildTreeItem('2H_AXE_AVALON', 'ROMPERREINOS', 'armas', 'hachas'),
          buildTreeItem('2H_SCYTHE_CRYSTAL', 'FALCE DE CRISTAL', 'armas', 'hachas'),
        ],
      },
      {
        id: 'mazas', name: 'MAZAS',
        items: [
          buildTreeItem('MAIN_MACE', 'MAZA', 'armas', 'mazas'),
          buildTreeItem('2H_MACE', 'MAZA PESADA', 'armas', 'mazas'),
          buildTreeItem('2H_FLAIL', 'MANGUAL', 'armas', 'mazas'),
          buildTreeItem('MAIN_ROCKMACE_KEEPER', 'MAZA DE LECHO DE ROCA', 'armas', 'mazas'),
          buildTreeItem('MAIN_MACE_HELL', 'MAZA ÍNCUBO', 'armas', 'mazas'),
          buildTreeItem('2H_MACE_MORGANA', 'MAZA DE CAMLANN', 'armas', 'mazas'),
          buildTreeItem('2H_DUALMACE_AVALON', 'JURADORES', 'armas', 'mazas'),
          buildTreeItem('MAIN_MACE_CRYSTAL', 'MONARCA DE LA TORMENTA', 'armas', 'mazas'),
        ],
      },
      {
        id: 'martillos', name: 'MARTILLOS',
        items: [
          buildTreeItem('MAIN_HAMMER', 'MARTILLO', 'armas', 'martillos'),
          buildTreeItem('2H_POLEHAMMER', 'MARTILLO LARGO', 'armas', 'martillos'),
          buildTreeItem('2H_HAMMER', 'GRAN MARTILLO', 'armas', 'martillos'),
          buildTreeItem('2H_HAMMER_UNDEAD', 'MARTILLO DE LA TUMBA', 'armas', 'martillos'),
          buildTreeItem('2H_DUALHAMMER_HELL', 'MARTILLOS DE FORJA', 'armas', 'martillos'),
          buildTreeItem('2H_RAM_KEEPER', 'GUARDABOSQUES', 'armas', 'martillos'),
          buildTreeItem('2H_HAMMER_AVALON', 'MANO DE LA JUSTICIA', 'armas', 'martillos'),
          buildTreeItem('2H_HAMMER_CRYSTAL', 'MARTILLO RELÁMPAGO', 'armas', 'martillos'),
        ],
      },
      {
        id: 'guantes', name: 'GUANTES',
        items: [
          buildTreeItem('2H_KNUCKLES_SET1', 'GUANTES DE PELEADOR', 'armas', 'guantes'),
          buildTreeItem('2H_KNUCKLES_SET2', 'BRAZALES DE BATALLA', 'armas', 'guantes'),
          buildTreeItem('2H_KNUCKLES_SET3', 'GUANTELETES DE PÚAS', 'armas', 'guantes'),
          buildTreeItem('2H_KNUCKLES_KEEPER', 'ZARPAS OSUNAS', 'armas', 'guantes'),
          buildTreeItem('2H_KNUCKLES_HELL', 'MANOS INFERNALES', 'armas', 'guantes'),
          buildTreeItem('2H_KNUCKLES_MORGANA', 'CESTUS CÓRVIDOS', 'armas', 'guantes'),
          buildTreeItem('2H_KNUCKLES_AVALON', 'PUÑOS DE AVALON', 'armas', 'guantes'),
          buildTreeItem('2H_KNUCKLES_CRYSTAL', 'BRAZALES DE FUERZA PULSANTE', 'armas', 'guantes'),
        ],
      },
      {
        id: 'ballestas', name: 'BALLESTAS',
        items: [
          buildTreeItem('2H_CROSSBOW', 'BALLESTA', 'armas', 'ballestas'),
          buildTreeItem('2H_CROSSBOWLARGE', 'BALLESTA PESADA', 'armas', 'ballestas'),
          buildTreeItem('MAIN_1HCROSSBOW', 'BALLESTA LIGERA', 'armas', 'ballestas'),
          buildTreeItem('2H_REPEATINGCROSSBOW_UNDEAD', 'REPETIDORA DE DESCONSUELO', 'armas', 'ballestas'),
          buildTreeItem('2H_DUALCROSSBOW_HELL', 'LANZASAETAS', 'armas', 'ballestas'),
          buildTreeItem('2H_CROSSBOWLARGE_MORGANA', 'ARCO DE ASEDIO', 'armas', 'ballestas'),
          buildTreeItem('2H_CROSSBOW_CANNON_AVALON', 'MODELADOR DE ENERGÍA', 'armas', 'ballestas'),
          buildTreeItem('2H_DUALCROSSBOW_CRYSTAL', 'DESINTEGRADORAS DE LUZ', 'armas', 'ballestas'),
        ],
      },
      {
        id: 'arcos', name: 'ARCOS',
        items: [
          buildTreeItem('2H_BOW', 'ARCO', 'armas', 'arcos'),
          buildTreeItem('2H_WARBOW', 'ARCO DE GUERRA', 'armas', 'arcos'),
          buildTreeItem('2H_LONGBOW', 'ARCO LARGO', 'armas', 'arcos'),
          buildTreeItem('2H_LONGBOW_UNDEAD', 'ARCO SUSURRANTE', 'armas', 'arcos'),
          buildTreeItem('2H_BOW_HELL', 'ARCO DE LAMENTACIONES', 'armas', 'arcos'),
          buildTreeItem('2H_BOW_KEEPER', 'ARCO DE BADON', 'armas', 'arcos'),
          buildTreeItem('2H_BOW_AVALON', 'PERFORADOR DE NIEBLA', 'armas', 'arcos'),
          buildTreeItem('2H_BOW_CRYSTAL', 'ARCO CRUZACIELOS', 'armas', 'arcos'),
        ],
      },
      {
        id: 'dagas', name: 'DAGAS',
        items: [
          buildTreeItem('MAIN_DAGGER', 'DAGA', 'armas', 'dagas'),
          buildTreeItem('2H_DAGGERPAIR', 'DAGA DOBLE', 'armas', 'dagas'),
          buildTreeItem('2H_CLAWPAIR', 'GARRAS', 'armas', 'dagas'),
          buildTreeItem('MAIN_RAPIER_MORGANA', 'SANGRADORA', 'armas', 'dagas'),
          buildTreeItem('MAIN_DAGGER_HELL', 'COLMILLO DEMONÍACO', 'armas', 'dagas'),
          buildTreeItem('2H_DUALSICKLE_UNDEAD', 'CONCEDEMUERTES', 'armas', 'dagas'),
          buildTreeItem('2H_DAGGER_KATAR_AVALON', 'FURIA CONTENIDA', 'armas', 'dagas'),
          buildTreeItem('2H_DAGGERPAIR_CRYSTAL', 'GEMELAS ASESINAS', 'armas', 'dagas'),
        ],
      },
      {
        id: 'lanzas', name: 'LANZAS',
        items: [
          buildTreeItem('MAIN_SPEAR', 'LANZA', 'armas', 'lanzas'),
          buildTreeItem('2H_SPEAR', 'PICA', 'armas', 'lanzas'),
          buildTreeItem('2H_GLAIVE', 'GUJA', 'armas', 'lanzas'),
          buildTreeItem('MAIN_SPEAR_KEEPER', 'LANZA DE GARZA', 'armas', 'lanzas'),
          buildTreeItem('2H_HARPOON_HELL', 'CAZAESPÍRITUS', 'armas', 'lanzas'),
          buildTreeItem('2H_TRIDENT_UNDEAD', 'LANZA DE TRINIDAD', 'armas', 'lanzas'),
          buildTreeItem('MAIN_SPEAR_LANCE_AVALON', 'PORTADOR DEL ALBA', 'armas', 'lanzas'),
          buildTreeItem('2H_GLAIVE_CRYSTAL', 'GUJA FISURANTE', 'armas', 'lanzas'),
        ],
      },
      {
        id: 'varas', name: 'VARAS',
        items: [
          buildTreeItem('2H_QUARTERSTAFF', 'VARA', 'armas', 'varas'),
          buildTreeItem('2H_IRONCLADEDSTAFF', 'BASTÓN METÁLICO', 'armas', 'varas'),
          buildTreeItem('2H_DOUBLEBLADEDSTAFF', 'BASTÓN DE DOBLE FILO', 'armas', 'varas'),
          buildTreeItem('2H_COMBATSTAFF_MORGANA', 'BASTÓN DE MONJE NEGRO', 'armas', 'varas'),
          buildTreeItem('2H_TWINSCYTHE_HELL', 'GUADAÑA DE ALMAS', 'armas', 'varas'),
          buildTreeItem('2H_ROCKSTAFF_KEEPER', 'BASTÓN DE EQUILIBRIO', 'armas', 'varas'),
          buildTreeItem('2H_QUARTERSTAFF_AVALON', 'BUSCADOR DE GRIAL', 'armas', 'varas'),
          buildTreeItem('2H_DOUBLEBLADEDSTAFF_CRYSTAL', 'HOJA DOBLE FANTASMA', 'armas', 'varas'),
        ],
      },
      {
        id: 'cambiaformas', name: 'BASTÓN DE CAMBIAFORMAS',
        items: [
          buildTreeItem('2H_SHAPESHIFTER_SET1', 'BASTÓN DE MERODEADOR', 'armas', 'cambiaformas'),
          buildTreeItem('2H_SHAPESHIFTER_SET2', 'BASTÓN ENRIZADO', 'armas', 'cambiaformas'),
          buildTreeItem('2H_SHAPESHIFTER_SET3', 'BASTÓN PRIMITIVO', 'armas', 'cambiaformas'),
          buildTreeItem('2H_SHAPESHIFTER_HELL', 'BASTÓN DE LUNA SANGRIENTA', 'armas', 'cambiaformas'),
          buildTreeItem('2H_SHAPESHIFTER_KEEPER', 'BASTÓN DE CRIATURA INFERNAL', 'armas', 'cambiaformas'),
          buildTreeItem('2H_SHAPESHIFTER_MORGANA', 'BASTÓN TERRÚNICO', 'armas', 'cambiaformas'),
          buildTreeItem('2H_SHAPESHIFTER_AVALON', 'INVOCADOR DE LUZ', 'armas', 'cambiaformas'),
          buildTreeItem('2H_SHAPESHIFTER_CRYSTAL', 'BASTÓN DE MIRADA FIRME', 'armas', 'cambiaformas'),
        ],
      },
      {
        id: 'naturales', name: 'BASTONES NATURALES',
        items: [
          buildTreeItem('MAIN_NATURESTAFF', 'BASTÓN NATURAL', 'armas', 'naturales'),
          buildTreeItem('2H_NATURESTAFF', 'GRAN BASTÓN NATURAL', 'armas', 'naturales'),
          buildTreeItem('2H_WILDSTAFF', 'BASTÓN SALVAJE', 'armas', 'naturales'),
          buildTreeItem('MAIN_NATURESTAFF_KEEPER', 'BASTÓN DRUIDA', 'armas', 'naturales'),
          buildTreeItem('2H_NATURESTAFF_HELL', 'BASTÓN DE INFORTUNIO', 'armas', 'naturales'),
          buildTreeItem('2H_NATURESTAFF_KEEPER', 'BASTÓN DESENFRENADO', 'armas', 'naturales'),
          buildTreeItem('MAIN_NATURESTAFF_AVALON', 'BASTÓN DE RAÍZ FÉRREA', 'armas', 'naturales'),
          buildTreeItem('MAIN_NATURESTAFF_CRYSTAL', 'BASTÓN DE FORJACORTEZA', 'armas', 'naturales'),
        ],
      },
      {
        id: 'igneos', name: 'BASTONES ÍGNEOS',
        items: [
          buildTreeItem('MAIN_FIRESTAFF', 'BASTÓN ÍGNEO', 'armas', 'igneos'),
          buildTreeItem('2H_FIRESTAFF', 'GRAN BASTÓN ÍGNEO', 'armas', 'igneos'),
          buildTreeItem('2H_INFERNOSTAFF', 'BASTÓN INFERNAL', 'armas', 'igneos'),
          buildTreeItem('MAIN_FIRESTAFF_KEEPER', 'BASTÓN DE FUEGO INCONTROLABLE', 'armas', 'igneos'),
          buildTreeItem('2H_FIRESTAFF_HELL', 'BASTÓN DE AZUFRE', 'armas', 'igneos'),
          buildTreeItem('2H_INFERNOSTAFF_MORGANA', 'BASTÓN FLAMÍGERO', 'armas', 'igneos'),
          buildTreeItem('2H_FIRE_RINGPAIR_AVALON', 'CANCIÓN DEL DESPERTAR', 'armas', 'igneos'),
          buildTreeItem('MAIN_FIRESTAFF_CRYSTAL', 'BASTÓN DE CAMINALLAMAS', 'armas', 'igneos'),
        ],
      },
      {
        id: 'sagrados', name: 'BASTONES SAGRADOS',
        items: [
          buildTreeItem('MAIN_HOLYSTAFF', 'BASTÓN SAGRADO', 'armas', 'sagrados'),
          buildTreeItem('2H_HOLYSTAFF', 'GRAN BASTÓN SAGRADO', 'armas', 'sagrados'),
          buildTreeItem('2H_DIVINESTAFF', 'BASTÓN DIVINO', 'armas', 'sagrados'),
          buildTreeItem('MAIN_HOLYSTAFF_MORGANA', 'BASTÓN DE TOQUE DE VIDA', 'armas', 'sagrados'),
          buildTreeItem('2H_HOLYSTAFF_HELL', 'BASTÓN CAÍDO', 'armas', 'sagrados'),
          buildTreeItem('2H_HOLYSTAFF_UNDEAD', 'BASTÓN DE REDENCIÓN', 'armas', 'sagrados'),
          buildTreeItem('MAIN_HOLYSTAFF_AVALON', 'SANTIFICADOR', 'armas', 'sagrados'),
          buildTreeItem('2H_HOLYSTAFF_CRYSTAL', 'BASTÓN EXALTADO', 'armas', 'sagrados'),
        ],
      },
      {
        id: 'arcanos', name: 'BASTONES ARCANOS',
        items: [
          buildTreeItem('MAIN_ARCANESTAFF', 'BASTÓN ARCANO', 'armas', 'arcanos'),
          buildTreeItem('2H_ARCANESTAFF', 'GRAN BASTÓN ARCANO', 'armas', 'arcanos'),
          buildTreeItem('2H_ENIGMATICSTAFF', 'BASTÓN ENIGMÁTICO', 'armas', 'arcanos'),
          buildTreeItem('MAIN_ARCANESTAFF_UNDEAD', 'BASTÓN DE BRUJERÍA', 'armas', 'arcanos'),
          buildTreeItem('2H_ARCANESTAFF_HELL', 'BASTÓN OCULTO', 'armas', 'arcanos'),
          buildTreeItem('2H_ENIGMATICORB_MORGANA', 'LOCUS MALÉVOLO', 'armas', 'arcanos'),
          buildTreeItem('2H_ARCANE_RINGPAIR_AVALON', 'SONIDO EQUILIBRADO', 'armas', 'arcanos'),
          buildTreeItem('2H_ARCANESTAFF_CRYSTAL', 'BASTÓN ASTRAL', 'armas', 'arcanos'),
        ],
      },
      {
        id: 'hielo', name: 'BASTONES DE HIELO',
        items: [
          buildTreeItem('MAIN_FROSTSTAFF', 'BASTÓN DE HIELO', 'armas', 'hielo'),
          buildTreeItem('2H_FROSTSTAFF', 'GRAN BASTÓN DE HIELO', 'armas', 'hielo'),
          buildTreeItem('2H_GLACIALSTAFF', 'BASTÓN GLACIAL', 'armas', 'hielo'),
          buildTreeItem('MAIN_FROSTSTAFF_KEEPER', 'BASTÓN DE ESCARCHA', 'armas', 'hielo'),
          buildTreeItem('2H_ICEGAUNTLETS_HELL', 'BASTÓN DE CARÁMBANOS', 'armas', 'hielo'),
          buildTreeItem('2H_ICECRYSTAL_UNDEAD', 'PRISMA DE HIELOS PERPETUOS', 'armas', 'hielo'),
          buildTreeItem('MAIN_FROSTSTAFF_AVALON', 'GRITO GÉLIDO', 'armas', 'hielo'),
          buildTreeItem('2H_FROSTSTAFF_CRYSTAL', 'BASTÓN ÁRTICO', 'armas', 'hielo'),
        ],
      },
      {
        id: 'malditos', name: 'BASTONES MALDITOS',
        items: [
          buildTreeItem('MAIN_CURSEDSTAFF', 'BASTÓN MALDITO', 'armas', 'malditos'),
          buildTreeItem('2H_CURSEDSTAFF', 'GRAN BASTÓN MALDITO', 'armas', 'malditos'),
          buildTreeItem('2H_DEMONICSTAFF', 'BASTÓN DEMONÍACO', 'armas', 'malditos'),
          buildTreeItem('MAIN_CURSEDSTAFF_UNDEAD', 'BASTÓN DE MALDICIÓN DE VIDA', 'armas', 'malditos'),
          buildTreeItem('2H_SKULLORB_HELL', 'CALAVERA MALDITA', 'armas', 'malditos'),
          buildTreeItem('2H_CURSEDSTAFF_MORGANA', 'BASTÓN DE MALDICIONES', 'armas', 'malditos'),
          buildTreeItem('MAIN_CURSEDSTAFF_AVALON', 'INVOCADOR OSCURO', 'armas', 'malditos'),
          buildTreeItem('MAIN_CURSEDSTAFF_CRYSTAL', 'BASTÓN PUTREFACTO', 'armas', 'malditos'),
        ],
      },
    ],
  },
  {
    id: 'cascos', name: 'CASCOS', icon: 'CircleUser',
    subcategories: [
      {
        id: 'cascos_placas', name: 'CASCO DE PLACAS',
        items: [
          buildTreeItem('HEAD_PLATE_SET1', 'CASCO DE SOLDADO', 'cascos', 'cascos_placas'),
          buildTreeItem('HEAD_PLATE_SET2', 'CASCO DE CABALLERO', 'cascos', 'cascos_placas'),
          buildTreeItem('HEAD_PLATE_SET3', 'CASCO DE GUARDIÁN', 'cascos', 'cascos_placas'),
          buildTreeItem('HEAD_PLATE_UNDEAD', 'CASCO DE GUARDATUMBAS', 'cascos', 'cascos_placas'),
          buildTreeItem('HEAD_PLATE_HELL', 'CASCO DE DEMONIO', 'cascos', 'cascos_placas'),
          buildTreeItem('HEAD_PLATE_KEEPER', 'CASCO DE JUEZ', 'cascos', 'cascos_placas'),
          buildTreeItem('HEAD_PLATE_FEY', 'CASCO CREPUSCULAR', 'cascos', 'cascos_placas'),
          buildTreeItem('HEAD_PLATE_AVALON', 'CASCO DE VALOR', 'cascos', 'cascos_placas'),
        ],
      },
      {
        id: 'capuchas_cuero', name: 'CAPUCHAS DE CUERO',
        items: [
          buildTreeItem('HEAD_LEATHER_SET1', 'CAPUCHA DE MERCENARIO', 'cascos', 'capuchas_cuero'),
          buildTreeItem('HEAD_LEATHER_SET2', 'CAPUCHA DE CAZADOR', 'cascos', 'capuchas_cuero'),
          buildTreeItem('HEAD_LEATHER_SET3', 'CAPUCHA DE ASESINO', 'cascos', 'capuchas_cuero'),
          buildTreeItem('HEAD_LEATHER_MORGANA', 'CAPUCHA DE ACECHADOR', 'cascos', 'capuchas_cuero'),
          buildTreeItem('HEAD_LEATHER_HELL', 'CAPUCHA DE VÁNDALO', 'cascos', 'capuchas_cuero'),
          buildTreeItem('HEAD_LEATHER_UNDEAD', 'CAPUCHA DE ESPECTRO', 'cascos', 'capuchas_cuero'),
          buildTreeItem('HEAD_LEATHER_FEY', 'CAPUCHA DE CAMINANIEBLAS', 'cascos', 'capuchas_cuero'),
          buildTreeItem('HEAD_LEATHER_AVALON', 'CAPUCHA DE TENACIDAD', 'cascos', 'capuchas_cuero'),
        ],
      },
      {
        id: 'habitos_tela', name: 'HÁBITOS DE TELA',
        items: [
          buildTreeItem('HEAD_CLOTH_SET1', 'HÁBITO DE ERUDITO', 'cascos', 'habitos_tela'),
          buildTreeItem('HEAD_CLOTH_SET2', 'HÁBITO DE CLÉRIGO', 'cascos', 'habitos_tela'),
          buildTreeItem('HEAD_CLOTH_SET3', 'HÁBITO DE MAGO', 'cascos', 'habitos_tela'),
          buildTreeItem('HEAD_CLOTH_KEEPER', 'HÁBITO DE DRUIDA', 'cascos', 'habitos_tela'),
          buildTreeItem('HEAD_CLOTH_HELL', 'HÁBITO DE DIABLO', 'cascos', 'habitos_tela'),
          buildTreeItem('HEAD_CLOTH_MORGANA', 'HÁBITO DE SECTARIO', 'cascos', 'habitos_tela'),
          buildTreeItem('HEAD_CLOTH_FEY', 'SOMBRERO DE ESCAMA FEÉRICA', 'cascos', 'habitos_tela'),
          buildTreeItem('HEAD_CLOTH_AVALON', 'HÁBITO DE PUREZA', 'cascos', 'habitos_tela'),
        ],
      },
    ],
  },
  {
    id: 'pecheras', name: 'PECHERAS', icon: 'Layers',
    subcategories: [
      {
        id: 'armadura_placas', name: 'ARMADURA DE PLACAS',
        items: [
          buildTreeItem('ARMOR_PLATE_SET1', 'ARMADURA DE SOLDADO', 'pecheras', 'armadura_placas'),
          buildTreeItem('ARMOR_PLATE_SET2', 'ARMADURA DE CABALLERO', 'pecheras', 'armadura_placas'),
          buildTreeItem('ARMOR_PLATE_SET3', 'ARMADURA DE GUARDIÁN', 'pecheras', 'armadura_placas'),
          buildTreeItem('ARMOR_PLATE_UNDEAD', 'ARMADURA DE GUARDATUMBAS', 'pecheras', 'armadura_placas'),
          buildTreeItem('ARMOR_PLATE_HELL', 'ARMADURA DE DEMONIO', 'pecheras', 'armadura_placas'),
          buildTreeItem('ARMOR_PLATE_KEEPER', 'ARMADURA DE JUEZ', 'pecheras', 'armadura_placas'),
          buildTreeItem('ARMOR_PLATE_FEY', 'ARMADURA CREPUSCULAR', 'pecheras', 'armadura_placas'),
          buildTreeItem('ARMOR_PLATE_AVALON', 'ARMADURA DE VALOR', 'pecheras', 'armadura_placas'),
        ],
      },
      {
        id: 'chaquetas_cuero', name: 'CHAQUETAS DE CUERO',
        items: [
          buildTreeItem('ARMOR_LEATHER_SET1', 'CHAQUETA DE MERCENARIO', 'pecheras', 'chaquetas_cuero'),
          buildTreeItem('ARMOR_LEATHER_SET2', 'CHAQUETA DE ASESINO', 'pecheras', 'chaquetas_cuero'),
          buildTreeItem('ARMOR_LEATHER_SET3', 'CHAQUETA DE CAZADOR', 'pecheras', 'chaquetas_cuero'),
          buildTreeItem('ARMOR_LEATHER_MORGANA', 'CHAQUETA DE ACECHADOR', 'pecheras', 'chaquetas_cuero'),
          buildTreeItem('ARMOR_LEATHER_HELL', 'CHAQUETA DE VÁNDALO', 'pecheras', 'chaquetas_cuero'),
          buildTreeItem('ARMOR_LEATHER_UNDEAD', 'CHAQUETA DE ESPECTRO', 'pecheras', 'chaquetas_cuero'),
          buildTreeItem('ARMOR_LEATHER_FEY', 'CHAQUETA DE CAMINANIEBLAS', 'pecheras', 'chaquetas_cuero'),
          buildTreeItem('ARMOR_LEATHER_AVALON', 'CHAQUETA DE TENACIDAD', 'pecheras', 'chaquetas_cuero'),
        ],
      },
      {
        id: 'tunicas_tela', name: 'TÚNICAS DE TELA',
        items: [
          buildTreeItem('ARMOR_CLOTH_SET1', 'TÚNICA DE ERUDITO', 'pecheras', 'tunicas_tela'),
          buildTreeItem('ARMOR_CLOTH_SET2', 'TÚNICA DE CLÉRIGO', 'pecheras', 'tunicas_tela'),
          buildTreeItem('ARMOR_CLOTH_SET3', 'TÚNICA DE MAGO', 'pecheras', 'tunicas_tela'),
          buildTreeItem('ARMOR_CLOTH_KEEPER', 'TÚNICA DE DRUIDA', 'pecheras', 'tunicas_tela'),
          buildTreeItem('ARMOR_CLOTH_HELL', 'TÚNICA DE DIABLO', 'pecheras', 'tunicas_tela'),
          buildTreeItem('ARMOR_CLOTH_MORGANA', 'TÚNICA DE SECTARIO', 'pecheras', 'tunicas_tela'),
          buildTreeItem('ARMOR_CLOTH_FEY', 'TÚNICA DE ESCAMAS FEÉRICAS', 'pecheras', 'tunicas_tela'),
          buildTreeItem('ARMOR_CLOTH_AVALON', 'TÚNICA DE PUREZA', 'pecheras', 'tunicas_tela'),
        ],
      },
    ],
  },
  {
    id: 'botas', name: 'BOTAS', icon: 'Wind',
    subcategories: [
      {
        id: 'zapatos_cuero', name: 'ZAPATOS DE CUERO',
        items: [
          buildTreeItem('SHOES_LEATHER_SET1', 'ZAPATOS DE MERCENARIO', 'botas', 'zapatos_cuero'),
          buildTreeItem('SHOES_LEATHER_SET2', 'ZAPATOS DE CAZADOR', 'botas', 'zapatos_cuero'),
          buildTreeItem('SHOES_LEATHER_SET3', 'ZAPATOS DE ASESINO', 'botas', 'zapatos_cuero'),
          buildTreeItem('SHOES_LEATHER_MORGANA', 'ZAPATOS DE ACECHADOR', 'botas', 'zapatos_cuero'),
          buildTreeItem('SHOES_LEATHER_HELL', 'ZAPATOS DE VÁNDALO', 'botas', 'zapatos_cuero'),
          buildTreeItem('SHOES_LEATHER_UNDEAD', 'ZAPATOS DE ESPECTRO', 'botas', 'zapatos_cuero'),
          buildTreeItem('SHOES_LEATHER_FEY', 'ZAPATOS DE CAMINANIEBLAS', 'botas', 'zapatos_cuero'),
          buildTreeItem('SHOES_LEATHER_AVALON', 'ZAPATOS DE TENACIDAD', 'botas', 'zapatos_cuero'),
        ],
      },
      {
        id: 'botas_placas', name: 'BOTAS DE PLACAS',
        items: [
          buildTreeItem('SHOES_PLATE_SET1', 'BOTAS DE SOLDADO', 'botas', 'botas_placas'),
          buildTreeItem('SHOES_PLATE_SET2', 'BOTAS DE CABALLERO', 'botas', 'botas_placas'),
          buildTreeItem('SHOES_PLATE_SET3', 'BOTAS DE GUARDIÁN', 'botas', 'botas_placas'),
          buildTreeItem('SHOES_PLATE_UNDEAD', 'BOTAS DE GUARDATUMBAS', 'botas', 'botas_placas'),
          buildTreeItem('SHOES_PLATE_HELL', 'BOTAS DE DEMONIO', 'botas', 'botas_placas'),
          buildTreeItem('SHOES_PLATE_KEEPER', 'BOTAS DE JUEZ', 'botas', 'botas_placas'),
          buildTreeItem('SHOES_PLATE_FEY', 'BOTAS CREPUSCULAR', 'botas', 'botas_placas'),
          buildTreeItem('SHOES_PLATE_AVALON', 'BOTAS DE VALOR', 'botas', 'botas_placas'),
        ],
      },
      {
        id: 'sandalias_tela', name: 'SANDALIAS DE TELA',
        items: [
          buildTreeItem('SHOES_CLOTH_SET1', 'SANDALIAS DE ERUDITO', 'botas', 'sandalias_tela'),
          buildTreeItem('SHOES_CLOTH_SET2', 'SANDALIAS DE CLÉRIGO', 'botas', 'sandalias_tela'),
          buildTreeItem('SHOES_CLOTH_SET3', 'SANDALIAS DE MAGO', 'botas', 'sandalias_tela'),
          buildTreeItem('SHOES_CLOTH_KEEPER', 'SANDALIAS DE DRUIDA', 'botas', 'sandalias_tela'),
          buildTreeItem('SHOES_CLOTH_HELL', 'SANDALIAS DE DIABLO', 'botas', 'sandalias_tela'),
          buildTreeItem('SHOES_CLOTH_MORGANA', 'SANDALIAS DE SECTARIO', 'botas', 'sandalias_tela'),
          buildTreeItem('SHOES_CLOTH_FEY', 'SANDALIAS DE ESCAMAS FEÉRICAS', 'botas', 'sandalias_tela'),
          buildTreeItem('SHOES_CLOTH_AVALON', 'SANDALIAS DE PUREZA', 'botas', 'sandalias_tela'),
        ],
      },
    ],
  },
  {
    id: 'secundaria', name: 'MANO SECUNDARIA', icon: 'Shield',
    subcategories: [
      {
        id: 'escudo', name: 'ESCUDO',
        items: [
          buildTreeItem('OFF_SHIELD', 'ESCUDO', 'secundaria', 'escudo'),
          buildTreeItem('OFF_TOWERSHIELD_UNDEAD', 'SARCÓFAGO', 'secundaria', 'escudo'),
          buildTreeItem('OFF_SHIELD_HELL', 'ESCUDO DE VILLANO', 'secundaria', 'escudo'),
          buildTreeItem('OFF_SPIKEDSHIELD_MORGANA', 'PARTECARAS', 'secundaria', 'escudo'),
          buildTreeItem('OFF_SHIELD_AVALON', 'AEGIS ASTRAL', 'secundaria', 'escudo'),
          buildTreeItem('OFF_SHIELD_CRYSTAL', 'BARRERA INQUEBRANTABLE', 'secundaria', 'escudo'),
        ],
      },
      {
        id: 'antorcha', name: 'ANTORCHA',
        items: [
          buildTreeItem('OFF_TORCH', 'ANTORCHA', 'secundaria', 'antorcha'),
          buildTreeItem('OFF_HORN_KEEPER', 'INVOCANIIEBLAS', 'secundaria', 'antorcha'),
          buildTreeItem('OFF_JESTERCANE_HELL', 'BASTÓN MALICIOSO', 'secundaria', 'antorcha'),
          buildTreeItem('OFF_LAMP_UNDEAD', 'VELA DE CRIPTA', 'secundaria', 'antorcha'),
          buildTreeItem('OFF_TALISMAN_AVALON', 'CETRO SAGRADO', 'secundaria', 'antorcha'),
          buildTreeItem('OFF_TORCH_CRYSTAL', 'ANTORCHA LLAMAAZUL', 'secundaria', 'antorcha'),
        ],
      },
      {
        id: 'tomos', name: 'TOMOS',
        items: [
          buildTreeItem('OFF_BOOK', 'LIBRO DE HECHIZOS', 'secundaria', 'tomos'),
          buildTreeItem('OFF_ORB_MORGANA', 'OJO DE LOS SECRETOS', 'secundaria', 'tomos'),
          buildTreeItem('OFF_DEMONSKULL_HELL', 'MUISAK', 'secundaria', 'tomos'),
          buildTreeItem('OFF_TOTEM_KEEPER', 'RAÍZ PRIMARIA', 'secundaria', 'tomos'),
          buildTreeItem('OFF_CENSER_AVALON', 'INCENSARIO CELESTIAL', 'secundaria', 'tomos'),
          buildTreeItem('OFF_TOME_CRYSTAL', 'GRIMORIO CRONOESTÁTICO', 'secundaria', 'tomos'),
        ],
      },
    ],
  },
  {
    id: 'bolsas', name: 'BOLSAS', icon: 'ShoppingBag',
    subcategories: [
      {
        id: 'bolsas', name: 'BOLSAS',
        items: [
          buildTreeItem('BAG', 'BOLSA', 'bolsas', 'bolsas'),
          buildTreeItem('BAG_INSIGHT', 'BOLSA DE VISIÓN', 'bolsas', 'bolsas'),
        ],
      },
    ],
  },
];
