import { normalizeId } from './items';

export interface FallbackMaterial {
  id: string;
  quantity: number;
}

// --- CONFIGURATION ---
const PRIMARY_UNITS = 2;
const SECONDARY_UNITS = 1;

const MULTIPLIER_1H = 8;
const MULTIPLIER_2H = 10;
const MULTIPLIER_CHEST = 8;
const MULTIPLIER_HEAD_SHOES = 4;

// --- ARCHETYPE MAPPING ---
type ResourceType = 'lingote' | 'cuero' | 'tablas' | 'tela';

const RESOURCE_IDS: Record<ResourceType, string> = {
  lingote: 'METALBAR',
  cuero: 'LEATHER',
  tablas: 'PLANKS',
  tela: 'CLOTH',
};

interface Archetype {
  primary: ResourceType;
  secondary?: ResourceType;
}

const ARCHETYPES: Record<string, Archetype> = {
  SWORD: { primary: 'lingote', secondary: 'cuero' },
  DAGGER: { primary: 'lingote', secondary: 'cuero' },
  AXE: { primary: 'lingote', secondary: 'tablas' },
  HAMMER: { primary: 'lingote', secondary: 'tela' },
  MACE: { primary: 'lingote', secondary: 'tela' },
  CROSSBOW: { primary: 'tablas', secondary: 'lingote' },
  SPEAR: { primary: 'tablas', secondary: 'lingote' },
  QUARTERSTAFF: { primary: 'cuero', secondary: 'lingote' },
  BOW: { primary: 'tablas' }, // Bow uses 32 planks for 2H
  STAFF: { primary: 'tablas', secondary: 'lingote' },
  SHAPESHIFTER: { primary: 'tablas', secondary: 'cuero' },
  WARGLOVES: { primary: 'cuero', secondary: 'lingote' },
  PLATE: { primary: 'lingote' },
  LEATHER: { primary: 'cuero' },
  CLOTH: { primary: 'tela' },
  OFF_SHIELD: { primary: 'lingote', secondary: 'tablas' },
  OFF_BOOK: { primary: 'tela', secondary: 'cuero' },
  OFF_TORCH: { primary: 'tablas', secondary: 'tela' },
};

// --- KEYWORD MAPPER ---
const KEYWORD_MAP: Record<string, string> = {
  DUALAXE: 'AXE',
  CLEAVER: 'SWORD',
  HALBERD: 'SPEAR',
  SCIMITAR: 'SWORD',
  CLAYMORE: 'SWORD',
  FLAIL: 'MACE',
  ROCKMACE: 'MACE',
  POLEHAMMER: 'HAMMER',
  RAM: 'HAMMER',
  SICKLE: 'AXE',
  SCYTHE: 'AXE',
  KNUCKLES: 'WARGLOVES',
  TWINBLADES: 'SWORD',
  RAPIER: 'SWORD',
  GLOVE: 'WARGLOVES',
};

const FACTIONS = ['KEEPER', 'MORGANA', 'UNDEAD', 'HELL', 'FEY', 'AVALON', 'CRYSTAL'];
const SHAPESHIFTER_SPECIALS: Record<string, string> = {
  SHAPESHIFTER_SET1: 'T3_ALCHEMY_RARE_PANTHER',
  SHAPESHIFTER_SET2: 'T3_ALCHEMY_RARE_ENT',
  SHAPESHIFTER_SET3: 'T3_ALCHEMY_RARE_DIREBEAR',
  SHAPESHIFTER_MORGANA: 'T3_ALCHEMY_RARE_WEREWOLF',
  SHAPESHIFTER_KEEPER: 'T3_ALCHEMY_RARE_ELEMENTAL',
  SHAPESHIFTER_HELL: 'T3_ALCHEMY_RARE_IMP',
  SHAPESHIFTER_AVALON: 'T3_ALCHEMY_RARE_EAGLE',
};

const RESOURCE_RECIPE_OVERRIDES: Record<string, Array<{ resource: ResourceType; quantity: number }>> = {
  MAIN_HAMMER: [{ resource: 'lingote', quantity: 24 }],
  MAIN_CARVINGSWORD: [
    { resource: 'lingote', quantity: 20 },
    { resource: 'cuero', quantity: 12 },
  ],

  '2H_BOW': [{ resource: 'tablas', quantity: 32 }],
  '2H_WARBOW': [{ resource: 'tablas', quantity: 32 }],
  '2H_LONGBOW': [{ resource: 'tablas', quantity: 32 }],
  '2H_LONGBOW_UNDEAD': [{ resource: 'tablas', quantity: 32 }],
  '2H_BOW_HELL': [{ resource: 'tablas', quantity: 32 }],
  '2H_BOW_KEEPER': [{ resource: 'tablas', quantity: 32 }],
  '2H_BOW_AVALON': [{ resource: 'tablas', quantity: 32 }],
  '2H_BOW_CRYSTAL': [{ resource: 'tablas', quantity: 32 }],

  MAIN_DAGGER: [
    { resource: 'lingote', quantity: 12 },
    { resource: 'cuero', quantity: 12 },
  ],
  MAIN_DAGGER_HELL: [
    { resource: 'lingote', quantity: 12 },
    { resource: 'cuero', quantity: 12 },
  ],
  '2H_DAGGERPAIR': [
    { resource: 'lingote', quantity: 16 },
    { resource: 'cuero', quantity: 16 },
  ],
  '2H_DUALSICKLE_UNDEAD': [
    { resource: 'lingote', quantity: 16 },
    { resource: 'cuero', quantity: 16 },
  ],
  '2H_DAGGERPAIR_CRYSTAL': [
    { resource: 'lingote', quantity: 16 },
    { resource: 'cuero', quantity: 16 },
  ],
  '2H_CLAWPAIR': [
    { resource: 'lingote', quantity: 12 },
    { resource: 'cuero', quantity: 20 },
  ],
  '2H_DAGGER_KATAR_AVALON': [
    { resource: 'lingote', quantity: 12 },
    { resource: 'cuero', quantity: 20 },
  ],

  '2H_GLAIVE': [
    { resource: 'tablas', quantity: 12 },
    { resource: 'lingote', quantity: 20 },
  ],
  '2H_GLAIVE_CRYSTAL': [
    { resource: 'tablas', quantity: 12 },
    { resource: 'lingote', quantity: 20 },
  ],

  '2H_QUARTERSTAFF': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_IRONCLADEDSTAFF': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_DOUBLEBLADEDSTAFF': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_COMBATSTAFF_MORGANA': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_TWINSCYTHE_HELL': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_ROCKSTAFF_KEEPER': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_QUARTERSTAFF_AVALON': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_DOUBLEBLADEDSTAFF_CRYSTAL': [
    { resource: 'cuero', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],

  MAIN_NATURESTAFF: [
    { resource: 'tablas', quantity: 16 },
    { resource: 'tela', quantity: 8 },
  ],
  MAIN_NATURESTAFF_KEEPER: [
    { resource: 'tablas', quantity: 16 },
    { resource: 'tela', quantity: 8 },
  ],
  MAIN_NATURESTAFF_AVALON: [
    { resource: 'tablas', quantity: 16 },
    { resource: 'tela', quantity: 8 },
  ],
  MAIN_NATURESTAFF_CRYSTAL: [
    { resource: 'tablas', quantity: 16 },
    { resource: 'tela', quantity: 8 },
  ],
  '2H_NATURESTAFF': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],
  '2H_WILDSTAFF': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],
  '2H_NATURESTAFF_HELL': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],
  '2H_NATURESTAFF_KEEPER': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],

  MAIN_HOLYSTAFF: [
    { resource: 'tablas', quantity: 16 },
    { resource: 'tela', quantity: 8 },
  ],
  MAIN_HOLYSTAFF_MORGANA: [
    { resource: 'tablas', quantity: 16 },
    { resource: 'tela', quantity: 8 },
  ],
  MAIN_HOLYSTAFF_AVALON: [
    { resource: 'tablas', quantity: 16 },
    { resource: 'tela', quantity: 8 },
  ],
  '2H_HOLYSTAFF': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],
  '2H_DIVINESTAFF': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],
  '2H_HOLYSTAFF_HELL': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],
  '2H_HOLYSTAFF_UNDEAD': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],
  '2H_HOLYSTAFF_CRYSTAL': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'tela', quantity: 12 },
  ],

  '2H_FIRE_RINGPAIR_AVALON': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_ENIGMATICORB_MORGANA': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_ARCANE_RINGPAIR_AVALON': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_ICEGAUNTLETS_HELL': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_ICECRYSTAL_UNDEAD': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],
  '2H_SKULLORB_HELL': [
    { resource: 'tablas', quantity: 20 },
    { resource: 'lingote', quantity: 12 },
  ],

  OFF_HORN_KEEPER: [
    { resource: 'tablas', quantity: 4 },
    { resource: 'tela', quantity: 4 },
  ],
  OFF_JESTERCANE_HELL: [
    { resource: 'tablas', quantity: 4 },
    { resource: 'tela', quantity: 4 },
  ],
  OFF_LAMP_UNDEAD: [
    { resource: 'tablas', quantity: 4 },
    { resource: 'tela', quantity: 4 },
  ],
  OFF_TALISMAN_AVALON: [
    { resource: 'tablas', quantity: 4 },
    { resource: 'tela', quantity: 4 },
  ],
  OFF_ORB_MORGANA: [
    { resource: 'tela', quantity: 4 },
    { resource: 'cuero', quantity: 4 },
  ],
  OFF_DEMONSKULL_HELL: [
    { resource: 'tela', quantity: 4 },
    { resource: 'cuero', quantity: 4 },
  ],
  OFF_TOTEM_KEEPER: [
    { resource: 'tela', quantity: 4 },
    { resource: 'cuero', quantity: 4 },
  ],
  OFF_CENSER_AVALON: [
    { resource: 'tela', quantity: 4 },
    { resource: 'cuero', quantity: 4 },
  ],
  OFF_TOME_CRYSTAL: [
    { resource: 'tela', quantity: 4 },
    { resource: 'cuero', quantity: 4 },
  ],
};

// Non-faction artifact items that need explicit artifact injection
const ARTIFACT_ITEM_MAP: Record<string, string> = {
  MAIN_CARVINGSWORD: 'ARTEFACT_MAIN_CARVINGSWORD',
};

/**
 * Gets a fallback recipe for any item ID using dynamic hybrid logic.
 */
export function getFallbackRecipe(normalizedId: string): FallbackMaterial[] {
  const norm = normalizedId.toUpperCase();
  
  // 1. Extract Tier and Enchantment
  const tierMatch = norm.match(/T(\d)/);
  const tier = tierMatch ? parseInt(tierMatch[1], 10) : 4;
  
  const enchantMatch = norm.match(/@(\d)/);
  const enchant = enchantMatch ? parseInt(enchantMatch[1], 10) : 0;
  const enchantSuffix = enchant > 0 ? `@${enchant}` : '';

  // 2. Extract Base ID and Keywords
  const baseId = norm.replace(/^T\d_/, '').replace(/@\d+$/, '');
  
  // 3. Find Archetype
  let typeKey = 'UNKNOWN';
  for (const k in ARCHETYPES) {
    if (baseId.includes(k)) {
      typeKey = k;
      break;
    }
  }

  // Apply keyword mapper if specific type not found or for normalization
  for (const [k, v] of Object.entries(KEYWORD_MAP)) {
    if (baseId.includes(k)) {
      typeKey = v;
      break;
    }
  }

  // 4. Determine Multiplier
  let multiplier = MULTIPLIER_1H;
  if (baseId.includes('2H')) multiplier = MULTIPLIER_2H;
  else if (baseId.includes('ARMOR')) multiplier = MULTIPLIER_CHEST;
  else if (baseId.includes('HEAD') || baseId.includes('SHOES')) multiplier = MULTIPLIER_HEAD_SHOES;
  else if (baseId.includes('OFF')) multiplier = 4; // Default offhand

  // 5. Build Material List
  const materials: FallbackMaterial[] = [];
  const archetype = ARCHETYPES[typeKey];
  const resourceOverride = RESOURCE_RECIPE_OVERRIDES[baseId];

  if (baseId.startsWith('BAG')) {
    materials.push(
      {
        id: normalizeId(`T${tier}_${RESOURCE_IDS.tela}${enchantSuffix}`),
        quantity: 8,
      },
      {
        id: normalizeId(`T${tier}_${RESOURCE_IDS.cuero}${enchantSuffix}`),
        quantity: 8,
      },
    );
    if (baseId === 'BAG_INSIGHT') {
      materials.push({
        id: normalizeId(`T${tier}_SKILLBOOK_STANDARD`),
        quantity: 1,
      });
    }
  } else if (resourceOverride) {
    resourceOverride.forEach(({ resource, quantity }) => {
      materials.push({
        id: normalizeId(`T${tier}_${RESOURCE_IDS[resource]}${enchantSuffix}`),
        quantity,
      });
    });
  } else if (archetype) {
    // Primary
    materials.push({
      id: normalizeId(`T${tier}_${RESOURCE_IDS[archetype.primary]}${enchantSuffix}`),
      quantity: multiplier * PRIMARY_UNITS
    });

    // Secondary
    if (archetype.secondary) {
      const secondaryQuantity = baseId.includes('2H')
        ? 12
        : multiplier * SECONDARY_UNITS;

      materials.push({
        id: normalizeId(`T${tier}_${RESOURCE_IDS[archetype.secondary]}${enchantSuffix}`),
        quantity: secondaryQuantity
      });
    }
  } else {
    // GENERIC FALLBACK: 16 Metal Bars
    materials.push({
      id: normalizeId(`T${tier}_METALBAR${enchantSuffix}`),
      quantity: 16
    });
  }

  // 6. Artifact Injection
  const specialIngredient = Object.entries(SHAPESHIFTER_SPECIALS).find(([key]) => baseId.includes(key))?.[1];
  if (specialIngredient) {
    materials.push({
      id: normalizeId(specialIngredient),
      quantity: 2,
    });
  }

  for (const faction of FACTIONS) {
    if (baseId.includes(faction)) {
      // The artifact DB and renderer use the full item base id, not a generic type/faction pair.
      const artifactId = normalizeId(`T${tier}_ARTEFACT_${baseId}`);
      materials.push({
        id: artifactId,
        quantity: 1
      });
      break;
    }
  }

  // Non-faction artifact items
  const artifactItemId = ARTIFACT_ITEM_MAP[baseId];
  if (artifactItemId) {
    materials.push({
      id: normalizeId(`T${tier}_${artifactItemId}`),
      quantity: 1,
    });
  }

  return materials;
}
