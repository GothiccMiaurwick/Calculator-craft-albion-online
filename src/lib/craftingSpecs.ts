import type { AlbionItem } from '@/lib/items';
import { CATEGORIES } from '@/lib/items';
import { SPECS_DATA } from '@/lib/specsData';

const GENERAL_FOCUS_EFFICIENCY_PER_LEVEL = 30;
const SHARED_ITEM_FOCUS_EFFICIENCY_PER_LEVEL = 15;
const DIRECT_ITEM_FOCUS_EFFICIENCY_PER_LEVEL = 250;

const GENERAL_QUALITY_PER_LEVEL = 0.75;
const SHARED_ITEM_QUALITY_PER_LEVEL = 0.375;
const DIRECT_ITEM_QUALITY_PER_LEVEL = 6;

type SpecNodeEntry = {
  generalKey: string;
  itemKeysByBaseId: Record<string, string>;
  itemKeys: string[];
};

type CraftingSpecBonus = {
  directItemLevel: number;
  sharedItemLevels: number;
  generalLevel: number;
  totalFocusEfficiency: number;
  totalQualityBonus: number;
};

export type QualityPriceMap = Partial<Record<1 | 2 | 3 | 4 | 5, number>>;

const SPEC_NODE_MAP: Record<string, SpecNodeEntry> = buildSpecNodeMap();

function buildSpecNodeMap() {
  const map: Record<string, SpecNodeEntry> = {};

  CATEGORIES.forEach((category, categoryIndex) => {
    const specsCategory = SPECS_DATA[categoryIndex];
    if (!specsCategory) return;

    category.subcategories.forEach((subcategory, subcategoryIndex) => {
      const specsSubcategory = specsCategory.subcategories[subcategoryIndex];
      if (!specsSubcategory) return;

      const itemKeysByBaseId: Record<string, string> = {};
      const itemKeys: string[] = [];

      subcategory.items.forEach((item, itemIndex) => {
        const specsItem = specsSubcategory.items[itemIndex];
        if (!specsItem) return;

        itemKeysByBaseId[item.id] = specsItem.name;
        itemKeys.push(specsItem.name);
      });

      map[subcategory.id] = {
        generalKey: specsSubcategory.general.name,
        itemKeysByBaseId,
        itemKeys,
      };
    });
  });

  return map;
}

export function getBaseFocusCost(tier: number, enchant: number) {
  return 500 * Math.pow(1.5, tier - 4) * Math.pow(1.2, enchant);
}

export function getCraftingSpecBonus(item: AlbionItem, specs: Record<string, number>): CraftingSpecBonus {
  const node = SPEC_NODE_MAP[item.subcategory];
  if (!node) {
    return {
      directItemLevel: 0,
      sharedItemLevels: 0,
      generalLevel: 0,
      totalFocusEfficiency: 0,
      totalQualityBonus: 0,
    };
  }

  const generalLevel = Number(specs[node.generalKey] || 0);
  const directItemKey = node.itemKeysByBaseId[item.baseId];
  const directItemLevel = directItemKey ? Number(specs[directItemKey] || 0) : 0;
  const sharedItemLevels = node.itemKeys.reduce((sum, key) => sum + Number(specs[key] || 0), 0);

  return {
    directItemLevel,
    sharedItemLevels,
    generalLevel,
    totalFocusEfficiency:
      generalLevel * GENERAL_FOCUS_EFFICIENCY_PER_LEVEL +
      sharedItemLevels * SHARED_ITEM_FOCUS_EFFICIENCY_PER_LEVEL +
      directItemLevel * DIRECT_ITEM_FOCUS_EFFICIENCY_PER_LEVEL,
    totalQualityBonus:
      generalLevel * GENERAL_QUALITY_PER_LEVEL +
      sharedItemLevels * SHARED_ITEM_QUALITY_PER_LEVEL +
      directItemLevel * DIRECT_ITEM_QUALITY_PER_LEVEL,
  };
}

export function getAdjustedFocusCost(
  item: AlbionItem,
  tier: number,
  enchant: number,
  specs: Record<string, number>,
) {
  const baseFocusCost = getBaseFocusCost(tier, enchant);
  const { totalFocusEfficiency } = getCraftingSpecBonus(item, specs);

  return baseFocusCost / Math.pow(2, totalFocusEfficiency / 10000);
}

const BASE_QUALITY_PROBABILITIES = [0.689, 0.25, 0.05, 0.01, 0.001] as const;

function getBestOfRollsDistribution(rolls: number): number[] {
  const cumulative = BASE_QUALITY_PROBABILITIES.reduce<number[]>((acc, probability, index) => {
    const previous = index > 0 ? acc[index - 1] : 0;
    acc.push(previous + probability);
    return acc;
  }, []);

  return BASE_QUALITY_PROBABILITIES.map((_, index) => {
    const atMostCurrent = Math.pow(cumulative[index], rolls);
    const belowCurrent = index > 0 ? Math.pow(cumulative[index - 1], rolls) : 0;
    return atMostCurrent - belowCurrent;
  });
}

export function getExpectedQualityDistribution(item: AlbionItem, specs: Record<string, number>) {
  const { totalQualityBonus } = getCraftingSpecBonus(item, specs);
  const totalRolls = 1 + totalQualityBonus / 100;
  const wholeRolls = Math.max(1, Math.floor(totalRolls));
  const fractionalRoll = totalRolls - wholeRolls;

  const baseDistribution = getBestOfRollsDistribution(wholeRolls);
  if (fractionalRoll <= 0) {
    return baseDistribution;
  }

  const nextDistribution = getBestOfRollsDistribution(wholeRolls + 1);
  return baseDistribution.map((probability, index) => probability * (1 - fractionalRoll) + nextDistribution[index] * fractionalRoll);
}

export function getExpectedSalePriceFromQualities(
  item: AlbionItem,
  specs: Record<string, number>,
  qualityPrices?: QualityPriceMap,
  fallbackPrice = 0,
) {
  const distribution = getExpectedQualityDistribution(item, specs);
  const normalizedPrices: number[] = [];
  let lastKnownPrice = fallbackPrice;

  for (let quality = 1 as const; quality <= 5; quality += 1) {
    const price = qualityPrices?.[quality];
    if (typeof price === 'number' && price > 0) {
      lastKnownPrice = price;
    }
    normalizedPrices.push(lastKnownPrice);
  }

  return distribution.reduce((sum, probability, index) => sum + probability * normalizedPrices[index], 0);
}
