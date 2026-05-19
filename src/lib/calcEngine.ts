/**
 * calcEngine.ts — Pure Financial Calculation Engine
 */

import { ResourceRow } from '@/lib/AppContext';
import { normalizeId } from './items';

const RESOURCE_MAP: Record<string, keyof Omit<ResourceRow, 'tier'>> = {
  METALBAR: 'lingote',
  LEATHER:  'cuero',
  PLANKS:   'tablas',
  FIBER:    'tela',
  CLOTH:    'tela',
};

const SPECIAL_INGREDIENT_MARKERS = ['ALCHEMY_RARE', 'SKILLBOOK_STANDARD'];

function getResourceField(normId: string): keyof Omit<ResourceRow, 'tier'> | undefined {
  const resourceKey = Object.keys(RESOURCE_MAP).find((key) => normId.includes(key));
  return resourceKey ? RESOURCE_MAP[resourceKey] : undefined;
}

export function isLocalResourceMaterial(id: string) {
  const normId = normalizeId(id);
  if (isArtifactLikeMaterial(normId)) return false;
  return Boolean(getResourceField(normId));
}

export function isSpecialIngredientMaterial(id: string) {
  const normId = normalizeId(id);
  return SPECIAL_INGREDIENT_MARKERS.some((marker) => normId.includes(marker));
}

export function isArtifactMaterial(id: string) {
  return normalizeId(id).includes('ARTEFACT');
}

export function isArtifactLikeMaterial(id: string) {
  return isArtifactMaterial(id) || isSpecialIngredientMaterial(id);
}

export function isReturnEligibleMaterial(id: string) {
  return isLocalResourceMaterial(id);
}

export function getRequiredPurchaseQuantity(
  perCraftQuantity: number,
  itemQuantity: number,
  returnRate: number,
  returnEligible: boolean
) {
  const rawQuantity = Number(perCraftQuantity || 0) * Number(itemQuantity || 0);
  if (!returnEligible || rawQuantity <= 0) return rawQuantity;

  const returnRatio = Math.max(0, Number(returnRate || 0)) / 100;
  const returnedQuantity = rawQuantity * returnRatio;
  const firstCraftBuffer = Math.ceil(Number(perCraftQuantity || 0) * returnRatio);

  return Math.min(rawQuantity, Math.ceil(rawQuantity - returnedQuantity) + firstCraftBuffer);
}

// NOTE: This function is kept for display purposes in materialBreakdown only.
// The actual investment uses the Albion Printer method: Math.round(rawTotal * (1 - RR))
function getNetInvestmentQuantity(
  perCraftQuantity: number,
  itemQuantity: number,
  returnRate: number,
  returnEligible: boolean
) {
  const rawQuantity = Number(perCraftQuantity || 0) * Number(itemQuantity || 0);
  if (!returnEligible || rawQuantity <= 0) return rawQuantity;

  const returnRatio = Math.max(0, Number(returnRate || 0)) / 100;
  return rawQuantity * (1 - returnRatio);
}

export function resolvePrice(
  id: string, 
  resources: ResourceRow[], 
  artifactPrices: Record<string, number> = {},
  priceOverrides: Record<string, number> = {},
  marketPrices: Record<string, number> = {}
): number {
  const normId = normalizeId(id);

  if (priceOverrides[normId] !== undefined) {
    const ovr = Number(priceOverrides[normId]);
    if (!isNaN(ovr) && ovr > 0) return ovr;
  }

  if (isArtifactMaterial(normId)) {
    const artPrice = Number(artifactPrices[normId]);
    if (!isNaN(artPrice) && artPrice > 0) return artPrice;
  }

  const parts = normId.split('_');
  const tier = parts[0];
  const field = getResourceField(normId);

  if (field) {
    let enchant = 0;
    if (normId.includes('@')) enchant = parseInt(normId.split('@')[1], 10) || 0;
    const row = resources.find(r => r.tier === `${tier}.${enchant}`);
    if (row && row[field]) return row[field];
  }

  const marketPrice = Number(marketPrices[normId]);
  if (!isNaN(marketPrice) && marketPrice > 0) return marketPrice;

  return 0;
}

export interface RawMaterial {
  id:       string;
  quantity: number;
}

export interface CalcInput {
  materials:      RawMaterial[];
  resources:      ResourceRow[];
  artifactPrices: Record<string, number>;
  priceOverrides?: Record<string, number>;
  marketPrices?: Record<string, number>;
  salePrice:      number;   
  returnRate:     number;   
  taxRate:        number;   
  itemQuantity?:  number;   
}

export interface CalcResult {
  rawTotalCost:    number;   
  returnValue:     number;   
  taxAmount:       number;   
  inversion:       number;   // Net Investment (Target: 171.456)
  gananciaNeta:    number;   // Net Profit (Target: +62.294)
  margenGanancia:  number;   // Net Margin (Target: 36.3%)
}

export function calculateCrafting(input: CalcInput): CalcResult {
  const { 
    materials, 
    resources, 
    artifactPrices, 
    priceOverrides = {}, 
    marketPrices = {},
    salePrice, 
    returnRate, 
    taxRate,
    itemQuantity = 1 
  } = input;

  // STEP 1: Calculate raw total cost and identify what is return-eligible
  let rawTotalCost = 0;
  let returnEligibleRawCost = 0;

  for (const mat of materials) {
    const price = resolvePrice(mat.id, resources, artifactPrices, priceOverrides, marketPrices);
    const totalMatQuantity = (Number(mat.quantity) || 0) * Number(itemQuantity);
    const materialCost = (Number(price) || 0) * totalMatQuantity;
    
    rawTotalCost += materialCost;
    
    // Only resources (cloth, leather, metal, planks, stone) are return-eligible
    if (isReturnEligibleMaterial(mat.id)) {
      returnEligibleRawCost += materialCost;
    }
  }

  // STEP 2: Calculate Inversion
  // Formula: Inversion = TotalRawCost - (ReturnEligibleRawCost * ReturnRate)
  const returnRatio = Math.max(0, Number(returnRate || 0)) / 100;
  const returnValue = returnEligibleRawCost * returnRatio;
  const inversion = Math.round(rawTotalCost - returnValue);

  // STEP 3: Net revenue after tax
  const totalRevenue = Number(salePrice) * Number(itemQuantity);
  const taxAmount = totalRevenue * (Number(taxRate) / 100);
  const netRevenue = totalRevenue - taxAmount;

  // STEP 4: Net profit = netRevenue - inversion
  const gananciaNeta = netRevenue - inversion;

  // STEP 5: Margin = profit / inversion * 100
  const margenGanancia = inversion > 0 ? (gananciaNeta / inversion) * 100 : 0;

  return {
    rawTotalCost:    Number(rawTotalCost.toFixed(2)),
    returnValue:     Number(returnValue.toFixed(2)),
    taxAmount:       Number(taxAmount.toFixed(2)),
    inversion:       inversion,
    gananciaNeta:    Number(gananciaNeta.toFixed(2)),
    margenGanancia:  Number(margenGanancia.toFixed(1)),
  };
}
