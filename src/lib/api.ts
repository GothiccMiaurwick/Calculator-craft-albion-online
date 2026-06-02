import { Server, normalizeId } from './items';
import { getFallbackRecipe, type FallbackMaterial } from './fallbacks';

const BASE_URLS: Record<Server, string> = {
  west: 'https://west.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com',
};

interface MarketPrice {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export async function fetchPrices(
  itemIds: string[],
  server: Server,
  cities: string[]
): Promise<MarketPrice[]> {
  if (itemIds.length === 0) return [];
  
  const idsStr = itemIds.join(',');
  const citiesStr = cities.join(',');
  const url = `${BASE_URLS[server]}/api/v2/stats/prices/${idsStr}.json?locations=${citiesStr}&qualities=1,2,3,4,5`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Market API error: ${res.status}`);
  return res.json();
}

export function formatSilver(value: number): string {
  if (!value || value === 0) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

/**
 * Recursively searches for the first array containing objects with material identifiers.
 */
type ApiMaterialCandidate = {
  count?: number | string;
  amount?: number | string;
} & (
  | { itemTypeId: string; uniqueName?: string }
  | { itemTypeId?: string; uniqueName: string }
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isMaterialCandidate(value: unknown): value is ApiMaterialCandidate {
  if (!isRecord(value)) return false;
  return typeof value.itemTypeId === 'string' || typeof value.uniqueName === 'string';
}

function findMaterialArray(obj: unknown): ApiMaterialCandidate[] | null {
  if (!obj || typeof obj !== 'object') return null;

  // 1. If it's an array, check if it contains materials
  if (Array.isArray(obj)) {
    if (obj.length > 0 && isMaterialCandidate(obj[0])) {
      return obj;
    }
    // Deep search in children
    for (const item of obj) {
      const found = findMaterialArray(item);
      if (found) return found;
    }
  }

  // 2. If it's an object, check keys and deep search values
  // Prioritize known keys
  const prioritizedKeys = ['craftresource', 'craftResourceList', 'craftingrequirements', 'craftingRequirements'];
  const record = obj as Record<string, unknown>;
  for (const key of prioritizedKeys) {
    const found = findMaterialArray(record[key]);
    if (found) return found;
  }

  // Generic deep search for other keys
  for (const key in record) {
    if (prioritizedKeys.includes(key)) continue; // Already checked
    const found = findMaterialArray(record[key]);
    if (found) return found;
  }

  return null;
}

function contextualizeMaterialId(craftedItemId: string, materialId: string) {
  const normalizedMaterialId = normalizeId(materialId);
  const isFavorToken = normalizedMaterialId.includes('ARTEFACT_TOKEN_FAVOR_');
  const isFactionArtifactAlias = /^T\d+_(METALBAR|LEATHER|PLANKS|FIBER|CLOTH)_(KEEPER|MORGANA|HELL|UNDEAD|AVALON|FEY|CRYSTAL)(?:_LEVEL\d+)?(?:@\d+)?$/.test(normalizedMaterialId);

  if (!isFavorToken && !isFactionArtifactAlias) return normalizedMaterialId;

  const tierMatch = normalizedMaterialId.match(/^T\d+/);
  const tierPrefix = tierMatch ? tierMatch[0] : 'T4';
  const craftedBaseId = normalizeId(craftedItemId).replace(/^T\d_/, '').replace(/@\d+$/, '');
  return normalizeId(`${tierPrefix}_ARTEFACT_${craftedBaseId}`);
}

export async function fetchItemMaterials(itemId: string) {
  let fallbackUsed = false;
  let materials: FallbackMaterial[] | null = null;
  const canonicalMaterials = getFallbackRecipe(itemId);
  
  try {
    // MANDATORY LOG
    console.log("ITEM ID:", itemId);

    const res = await fetch(`/api/proxy/recipe?itemId=${itemId}`);
    if (res.ok) {
      const data = await res.json();
      
      // MANDATORY LOG
      console.log("API RESULT:", data);

      // EXHAUSTIVE EXTRACTION
      const apiMaterials = findMaterialArray(data);

      if (apiMaterials && Array.isArray(apiMaterials)) {
        // STRICT VALIDATION
        materials = apiMaterials
          .filter(isMaterialCandidate)
          .map((m) => {
            const typeId = (m.itemTypeId || m.uniqueName)!;
            return {
              id: contextualizeMaterialId(itemId, typeId),
              quantity: Number(m.count) || Number(m.amount) || 1,
            };
          })
          .filter((m) => m.id && m.quantity > 0);

        if (materials.length === 0) materials = null;
      }
    }
  } catch (e) {
    console.error("Fetch materials error (API failed):", e);
  }

  // The Albion recipe endpoint is inconsistent for some enchanted tiers
  // (for example two-handed staffs can lose their 12-unit secondary material).
  // Use the local canonical recipe whenever it can describe the item.
  if (canonicalMaterials.length > 0) {
    fallbackUsed = true;
    materials = canonicalMaterials;
  } else if (!materials || materials.length === 0) {
    fallbackUsed = true;
    materials = canonicalMaterials;
  }

  // MANDATORY LOGS
  console.log("USING FALLBACK:", fallbackUsed);
  console.log("FINAL MATERIALS:", materials);

  return materials;
}
