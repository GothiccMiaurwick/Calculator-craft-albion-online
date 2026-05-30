import type { AlbionItem } from '@/lib/items';

export type CraftJournalType = 'BLACKSMITH' | 'IMBUER' | 'FLETCHER' | 'TINKER';

type FameClass = 'weapon2h' | 'weapon1h' | 'armor' | 'small';

const CRAFTING_FAME_TABLE: Record<number, Record<number, Record<FameClass, number>>> = {
  4: {
    0: { weapon2h: 720, weapon1h: 540, armor: 360, small: 180 },
    1: { weapon2h: 1440, weapon1h: 1080, armor: 720, small: 360 },
    2: { weapon2h: 2880, weapon1h: 2160, armor: 1440, small: 720 },
    3: { weapon2h: 5760, weapon1h: 4320, armor: 2880, small: 1440 },
    4: { weapon2h: 11520, weapon1h: 8640, armor: 5760, small: 2880 },
  },
  5: {
    0: { weapon2h: 2880, weapon1h: 2160, armor: 1440, small: 720 },
    1: { weapon2h: 5760, weapon1h: 4320, armor: 2880, small: 1440 },
    2: { weapon2h: 11520, weapon1h: 8640, armor: 5760, small: 2880 },
    3: { weapon2h: 23040, weapon1h: 17280, armor: 11520, small: 5760 },
    4: { weapon2h: 46080, weapon1h: 34560, armor: 23040, small: 11520 },
  },
  6: {
    0: { weapon2h: 8640, weapon1h: 6480, armor: 4320, small: 2160 },
    1: { weapon2h: 17280, weapon1h: 12960, armor: 8640, small: 4320 },
    2: { weapon2h: 34560, weapon1h: 25920, armor: 17280, small: 8640 },
    3: { weapon2h: 69120, weapon1h: 51840, armor: 34560, small: 17280 },
    4: { weapon2h: 138240, weapon1h: 103680, armor: 69120, small: 34560 },
  },
  7: {
    0: { weapon2h: 20640, weapon1h: 15480, armor: 10320, small: 5160 },
    1: { weapon2h: 41280, weapon1h: 30960, armor: 20640, small: 10320 },
    2: { weapon2h: 82560, weapon1h: 61920, armor: 41280, small: 20640 },
    3: { weapon2h: 165120, weapon1h: 123840, armor: 82560, small: 41280 },
    4: { weapon2h: 330240, weapon1h: 247680, armor: 165120, small: 82560 },
  },
  8: {
    0: { weapon2h: 44640, weapon1h: 33480, armor: 22320, small: 11160 },
    1: { weapon2h: 89280, weapon1h: 66960, armor: 44640, small: 22320 },
    2: { weapon2h: 178560, weapon1h: 133920, armor: 89280, small: 44640 },
    3: { weapon2h: 357120, weapon1h: 267840, armor: 178560, small: 89280 },
    4: { weapon2h: 714240, weapon1h: 535680, armor: 357120, small: 178560 },
  },
};

const JOURNAL_CAPACITY: Record<number, number> = {
  4: 3600,
  5: 7200,
  6: 14400,
  7: 28800,
  8: 57600,
};

export function getJournalType(item: AlbionItem): CraftJournalType {
  const sub = item.subcategory.toLowerCase();

  if (item.category === 'cascos' || item.category === 'pecheras' || item.category === 'botas') {
    if (sub.includes('tela')) return 'IMBUER';
    if (sub.includes('cuero')) return 'FLETCHER';
    return 'BLACKSMITH';
  }

  if (item.category === 'armas') {
    if (['igneos', 'sagrados', 'arcanos', 'hielo', 'malditos'].includes(sub)) return 'IMBUER';
    if (['arcos', 'dagas', 'lanzas', 'naturales', 'varas'].includes(sub)) return 'FLETCHER';
    return 'BLACKSMITH';
  }

  if (item.category === 'bolsas' || item.category === 'capas') return 'TINKER';
  if (item.category === 'secundaria') {
    if (sub.includes('escudo')) return 'BLACKSMITH';
    if (sub.includes('antorcha')) return 'FLETCHER';
    return 'IMBUER';
  }
  return 'BLACKSMITH';
}

function getFameClass(item: AlbionItem): FameClass {
  const sub = item.subcategory.toLowerCase();

  if (item.category === 'armas') {
    // 32-mat weapons (2H)
    if (sub.includes('varas') || sub.includes('arcos') || item.baseId.includes('2H')) return 'weapon2h';
    // 24-mat weapons (1H Axes, Maces, Hammers, Crossbows)
    if (['hachas', 'mazas', 'martillos', 'ballestas'].includes(sub)) return 'weapon1h';
    // 16-mat weapons (1H Swords, Daggers, Spears, Staves)
    return 'armor';
  }

  if (item.category === 'pecheras') return 'armor';
  if (item.category === 'bolsas' || item.category === 'capas') return 'armor'; 
  return 'small';
}

export function getCraftingFameForItem(item: AlbionItem, tier: number, enchant: number) {
  const tierTable = CRAFTING_FAME_TABLE[tier] ?? CRAFTING_FAME_TABLE[4];
  const enchantTable = tierTable[enchant] ?? tierTable[0];
  const fameClass = getFameClass(item);
  return enchantTable[fameClass];
}

export function getJournalCapacity(tier: number) {
  return JOURNAL_CAPACITY[tier] ?? JOURNAL_CAPACITY[4];
}

export function getJournalProgress(item: AlbionItem, tier: number, enchant: number, quantity: number) {
  const famePerItem = getCraftingFameForItem(item, tier, enchant);
  const totalFame = famePerItem * quantity;
  const capacity = getJournalCapacity(tier);
  const exactJournals = totalFame / capacity;
  const fullJournals = Math.floor(exactJournals);
  const partialFill = exactJournals - fullJournals;

  return {
    type: getJournalType(item),
    famePerItem,
    totalFame,
    capacity,
    exactJournals,
    fullJournals,
    partialFill,
    emptyJournalsToBuy: exactJournals > 0 ? Math.ceil(exactJournals) : 0,
  };
}
