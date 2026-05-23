'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Zap,
  Wallet,
  LineChart,
  Layers,
  Trash2,
  Book,
  Boxes,
  CheckSquare,
  MoonStar,
  ReceiptText,
  Star,
  Weight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { fetchPrices } from '@/lib/api';
import { formatSilver } from '@/lib/api';
import { CITIES, getItemImageUrl } from '@/lib/items';
import {
  calculateCrafting,
  getRequiredPurchaseQuantity,
  isArtifactLikeMaterial,
  isArtifactMaterial,
  isReturnEligibleMaterial,
  isSpecialIngredientMaterial,
  resolvePrice,
} from '@/lib/calcEngine';
import { getAdjustedFocusCost } from '@/lib/craftingSpecs';
import { getFallbackRecipe } from '@/lib/fallbacks';
import { getArtifactNameByBaseId, getDisplayLocale, getItemName, getJournalDisplayName, getJournalWorkerName, getMaterialName, t } from '@/lib/i18n';
import { getCraftingFameForItem, getJournalCapacity, getJournalProgress, getJournalType } from '@/lib/journals';
import AddCraftModal from './AddCraftModal';
import styles from './Planner.module.css';

const EXTRA_COSTS_KEY = 'planner_extra_costs';
const MATERIAL_WEIGHTS: Record<number, number> = { 4: 0.51, 5: 0.76, 6: 1.14, 7: 1.71, 8: 2.6 };
const JOURNAL_WEIGHTS: Record<number, number> = { 4: 0.34, 5: 0.51, 6: 0.76, 7: 1.14, 8: 1.7 };
const ARTIFACT_WEIGHT = 2.0;
const SHARD_WEIGHT = 0.1;

const MOUNTS = [
  { name: 'Armored Horse', capacity: 0, itemId: 'T8_MOUNT_ARMORED_HORSE' },
  { name: 'Gallant Horse', capacity: 156, itemId: 'UNIQUE_MOUNT_GIANT_HORSE_ADC' },
  { name: 'Moose', capacity: 374, itemId: 'T6_MOUNT_GIANTSTAG_MOOSE' },
  { name: 'Spectral Direboar', capacity: 1204, itemId: 'UNIQUE_MOUNT_UNDEAD_DIREBOAR_ADC' },
  { name: 'Elite Wild Boar', capacity: 1582, itemId: 'T8_MOUNT_DIREBOAR_FW_LYMHURST_ELITE' },
  { name: 'Elite Bighorn Ram', capacity: 1994, itemId: 'T8_MOUNT_RAM_FW_MARTLOCK_ELITE' },
  { name: 'Elite Winter Bear', capacity: 2704, itemId: 'T8_MOUNT_DIREBEAR_FW_FORTSTERLING_ELITE' },
  { name: "Elder's Transport Ox", capacity: 4116, itemId: 'T8_MOUNT_OX' },
];
const BAG_OPTIONS = [
  { name: 'No bag', bonus: 0, itemId: '' },
  { name: 'T6 Bag', bonus: 249, itemId: 'T6_BAG' },
  { name: 'T7 Bag', bonus: 300, itemId: 'T7_BAG' },
  { name: 'T8 Bag', bonus: 361, itemId: 'T8_BAG' },
];
const FOOD_OPTIONS = [
  { name: 'No food', bonus: 0, itemId: '' },
  { name: 'Pork Pie', bonus: 0.3, itemId: 'T7_MEAL_PIE' },
  { name: 'Avalonian Pork Pie', bonus: 0.45, itemId: 'T7_MEAL_PIE_AVALON' },
];
const CRAFT_FAME_BONUSES = [
  { label: 'NONE', value: 1 },
  { label: '+10%', value: 1.1 },
  { label: '+15%', value: 1.15 },
  { label: '+25%', value: 1.25 },
  { label: '+30%', value: 1.3 },
  { label: '+35%', value: 1.35 },
];
const JOURNAL_IMG_MAP: Record<string, string> = {
  BLACKSMITH: 'JOURNAL_WARRIOR',
  IMBUER: 'JOURNAL_MAGE',
  FLETCHER: 'JOURNAL_HUNTER',
  TINKER: 'JOURNAL_TOOLMAKER',
  WARRIOR: 'JOURNAL_WARRIOR',
  MAGE: 'JOURNAL_MAGE',
  HUNTER: 'JOURNAL_HUNTER',
  TOOLMAKER: 'JOURNAL_TOOLMAKER',
  GUERRERO: 'JOURNAL_WARRIOR',
  MAGO: 'JOURNAL_MAGE',
  CAZADOR: 'JOURNAL_HUNTER',
  'FABRICANTE DE HERRAMIENTAS': 'JOURNAL_TOOLMAKER',
};

const JOURNAL_TYPE_ALIASES: Record<string, string[]> = {
  BLACKSMITH: ['BLACKSMITH', 'WARRIOR', 'GUERRERO'],
  IMBUER: ['IMBUER', 'MAGE', 'MAGO'],
  FLETCHER: ['FLETCHER', 'HUNTER', 'CAZADOR'],
  TINKER: ['TINKER', 'TOOLMAKER', 'FABRICANTE DE HERRAMIENTAS'],
};

function normalizeJournalKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function journalMatchesType(journalSubtitle: string, journalType: string) {
  const normalizedType = normalizeJournalKey(journalType);
  const normalizedSubtitle = normalizeJournalKey(journalSubtitle);
  const aliases = JOURNAL_TYPE_ALIASES[normalizedType] ?? [normalizedType];
  return aliases.includes(normalizedSubtitle);
}

function readExtraCosts(): number {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem(EXTRA_COSTS_KEY) || 0);
}

function getPlannerMaterialLabel(id: string, locale: 'es' | 'en'): string {
  const artifactMatch = id.match(/^T\d+_ARTEFACT_(.+?)(?:@\d+)?$/);
  if (artifactMatch) {
    return getArtifactNameByBaseId(artifactMatch[1], locale);
  }

  return getMaterialName(id, locale);
}

function formatCompact(value: number, localeCode: string): string {
  return Math.abs(value) >= 1000 ? formatSilver(value) : value.toLocaleString(localeCode);
}

function formatExactValue(value: number, localeCode: string): string {
  return Math.round(Math.abs(value)).toLocaleString(localeCode);
}

function formatUnroundedValue(value: number, localeCode: string): string {
  return Math.abs(value).toLocaleString(localeCode, {
    maximumFractionDigits: 20,
    useGrouping: true,
  });
}

function formatSignedExactValue(value: number, localeCode: string): string {
  const rounded = Math.round(value);
  const formatted = Math.abs(rounded).toLocaleString(localeCode);
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return formatted;
}

function getTierInfo(id: string) {
  const tierMatch = id.match(/^T(\d)/);
  const enchantMatch = id.match(/@(\d)/);
  const tier = tierMatch ? Number(tierMatch[1]) : 4;
  const enchant = enchantMatch ? Number(enchantMatch[1]) : 0;

  return {
    tier,
    enchant,
    label: `T${tier}.${enchant}`,
  };
}

function getCraftTierLabel(tier: number, enchant: number) {
  return enchant > 0 ? `${tier}.${enchant}` : `${tier}`;
}

function getCraftDisplayName(row: { item: Parameters<typeof getItemName>[0]; tier: number; enchant: number }, locale: 'es' | 'en') {
  return `${getItemName(row.item, locale)} ${getCraftTierLabel(row.tier, row.enchant)}`;
}

function getMaterialImageId(id: string) {
  const enchantMatch = id.match(/@(\d)/);
  if (enchantMatch && /(CLOTH|FIBER|METALBAR|PLANKS|LEATHER|STONEBLOCK)/.test(id)) {
    return id.replace(/@(\d)/, `_LEVEL${enchantMatch[1]}`);
  }
  return id;
}

function getJournalImageId(type: string, tier: number) {
  const journalBase = JOURNAL_IMG_MAP[type] || 'JOURNAL_WARRIOR';
  return `T${tier}_${journalBase}_EMPTY`;
}

function formatWholeQuantity(value: number, localeCode: string) {
  return Math.ceil(value).toLocaleString(localeCode);
}

function formatNumberInput(value: number, localeCode: string) {
  return value.toLocaleString(localeCode);
}

function FormattedPlannerInput({
  value,
  onChange,
  localeCode,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  localeCode: string;
  className: string;
}) {
  const [localValue, setLocalValue] = useState(() => formatNumberInput(value || 0, localeCode));

  return (
    <input
      type="text"
      className={className}
      value={localValue}
      onFocus={() => {
        setLocalValue(value ? String(value) : '');
      }}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '' || /^\d+$/.test(raw)) {
          setLocalValue(raw);
        }
      }}
      onBlur={() => {
        const parsed = parseInt(localValue, 10) || 0;
        onChange(parsed);
        setLocalValue(formatNumberInput(parsed, localeCode));
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
    />
  );
}

function getWeightForMaterial(id: string): number {
  if (isArtifactMaterial(id) || isSpecialIngredientMaterial(id)) {
    // Shards, Souls, Relics are 0.1, specific item artifacts are 2.0
    if (id.includes('SOUL') || id.includes('RUNE') || id.includes('RELIC') || id.includes('SHARD')) {
      return SHARD_WEIGHT;
    }
    return ARTIFACT_WEIGHT;
  }
  const tier = getTierInfo(id).tier;
  return MATERIAL_WEIGHTS[tier] ?? 0.1;
}

export default function Planner() {
  const { 
    plannerItems, updatePlannerItem, removePlannerItem, 
    calculatorPreferences, resources, artifactPrices, journals, specs,
    itemOverrides, allManualSellPrices, allMarketPrices, server
  } = useApp();
  const locale = calculatorPreferences.locale;
  const localeCode = getDisplayLocale(locale);
  const [activeTab, setActiveTab] = useState<'planificador' | 'materiales' | 'resumen'>('planificador');
  const [showAddModal, setShowAddModal] = useState(false);
  const [extraCosts, setExtraCosts] = useState(() => readExtraCosts());
  const [selectedMountIndex, setSelectedMountIndex] = useState(2);
  const [selectedBagIndex, setSelectedBagIndex] = useState(3);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(1);
  const [craftFameBonus, setCraftFameBonus] = useState(1);
  const [showCraftFame, setShowCraftFame] = useState(false);
  const [showWeight, setShowWeight] = useState(false);
  const [showMountDropdown, setShowMountDropdown] = useState(false);
  const [showBagDropdown, setShowBagDropdown] = useState(false);
  const [showFoodDropdown, setShowFoodDropdown] = useState(false);
  const planificadorRef = useRef<HTMLElement | null>(null);
  const materialesRef = useRef<HTMLElement | null>(null);
  const resumenRef = useRef<HTMLElement | null>(null);

  // Toggle helpers to ensure clean interaction
  const toggleCraftFame = () => setShowCraftFame(prev => !prev);

  // 1. Sync global resource prices into each planner item's snapshot
  useEffect(() => {
    plannerItems.forEach((item) => {
      const materials = getFallbackRecipe(item.item.id);

      const materialPricesSnapshot: Record<string, number> = {};
      let hasChanges = false;

      materials.forEach((mat) => {
        const currentPrice = resolvePrice(mat.id, resources, artifactPrices, {}, allMarketPrices);
        const snapshotPrice = item.materialPricesSnapshot?.[mat.id] ?? 0;

        materialPricesSnapshot[mat.id] = currentPrice;

        if (currentPrice !== snapshotPrice) {
          hasChanges = true;
        }
      });

      if (hasChanges) {
        updatePlannerItem(item.id, {
          materialsSnapshot: materials,
          materialPricesSnapshot,
        });
      }
    });
  }, [plannerItems, updatePlannerItem, resources, artifactPrices, allMarketPrices]);

  // 2. Fetch missing market prices for special ingredients if needed
  useEffect(() => {
    const syncSpecialMaterialPrices = async () => {
      for (const item of plannerItems) {
        const snapshot = Array.isArray(item.materialsSnapshot) ? item.materialsSnapshot : [];
        const materials = snapshot.length > 0 ? snapshot : getFallbackRecipe(item.item.id);

        const marketPricedMats = materials.filter(m => isArtifactLikeMaterial(m.id) || (!m.id.includes('METALBAR') && !m.id.includes('LEATHER') && !m.id.includes('PLANKS') && !m.id.includes('FIBER') && !m.id.includes('CLOTH')));
        if (marketPricedMats.length === 0) continue;

        const missingIds = marketPricedMats.map(m => m.id).filter(id => (item.materialPricesSnapshot?.[id] ?? 0) === 0);
        if (missingIds.length === 0) continue;

        try {
          const prices = await fetchPrices(missingIds, server, CITIES);
          if (prices && prices.length > 0) {
            const newSnapshot = { ...(item.materialPricesSnapshot || {}) };
            let updated = false;

            prices.forEach(p => {
              if (p.quality === 1 && (p.sell_price_min > 0 || p.buy_price_max > 0)) {
                const val = p.sell_price_min || p.buy_price_max;
                if (newSnapshot[p.item_id] !== val) {
                  newSnapshot[p.item_id] = val;
                  updated = true;
                }
              }
            });

            if (updated) {
              updatePlannerItem(item.id, { materialPricesSnapshot: newSnapshot });
            }
          }
        } catch (e) {
          console.error("Failed to fetch special material prices for planner", e);
        }
      }
    };

    void syncSpecialMaterialPrices();
  }, [plannerItems, updatePlannerItem, resources, artifactPrices, server]);

  const scrollToSection = (section: 'planificador' | 'materiales' | 'resumen') => {
    setActiveTab(section);

    const sectionMap = {
      planificador: planificadorRef,
      materiales: materialesRef,
      resumen: resumenRef,
    };

    sectionMap[section].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    localStorage.setItem(EXTRA_COSTS_KEY, String(extraCosts));
  }, [extraCosts]);

  const plannerRows = useMemo(() => {
    return plannerItems.map((pi) => {
      const materials = getFallbackRecipe(pi.item.id);
      const priceSnapshot = pi.materialPricesSnapshot || {};
      const plannerMarketPrices = { ...priceSnapshot, ...allMarketPrices };
      const salePrice = allManualSellPrices[pi.item.id] ?? pi.salePriceSnapshot;
      
      const calc = calculateCrafting({
        materials,
        resources,
        artifactPrices,
        priceOverrides: itemOverrides[pi.item.id] || {},
        marketPrices: plannerMarketPrices,
        salePrice,
        returnRate: pi.returnRate,
        taxRate: calculatorPreferences.tax, // Use global preference
        itemQuantity: pi.quantity,
      });

      const materialBreakdown = materials.map((mat) => {
        const unitPrice = resolvePrice(mat.id, resources, artifactPrices, itemOverrides[pi.item.id] || {}, plannerMarketPrices);
        const totalQty = getRequiredPurchaseQuantity(
          mat.quantity,
          pi.quantity,
          pi.returnRate,
          isReturnEligibleMaterial(mat.id)
        );
        return {
          ...mat,
          unitPrice,
          totalQty,
          buyQty: Math.ceil(totalQty),
          totalCost: unitPrice * totalQty,
        };
      });

      const journalProgress = getJournalProgress(pi.item, pi.tier, pi.enchant, pi.quantity);
      const realInversion = materialBreakdown.reduce((sum, mat) => sum + mat.totalCost, 0);
      
      // Theoretical Inversion (No buffer) — used for per-item profit and ROI to match Albion Printer
      const theoreticalInversion = materialBreakdown.reduce((sum, mat) => {
        const netQty = mat.quantity * pi.quantity * (isReturnEligibleMaterial(mat.id) ? (1 - pi.returnRate / 100) : 1);
        return sum + mat.unitPrice * netQty;
      }, 0);

      const rowRevenue = salePrice * pi.quantity;
      const rowTax = rowRevenue * (pi.taxRate / 100);
      const realProfit = rowRevenue - rowTax - realInversion;
      const theoreticalProfit = rowRevenue - rowTax - theoreticalInversion;

      return {
        ...pi,
        salePrice,
        calc,
        realInversion,
        theoreticalInversion,
        realProfit,
        theoreticalProfit,
        journalProgress,
        materialBreakdown,
        totalSaleValue: salePrice * pi.quantity,
        totalFocus: pi.useFocus ? getAdjustedFocusCost(pi.item, pi.tier, pi.enchant, specs) * pi.quantity : 0,
      };
    });
  }, [plannerItems, resources, artifactPrices, specs, calculatorPreferences.tax, allManualSellPrices, itemOverrides, allMarketPrices]);

  const activeRows = plannerRows.filter(row => !row.isDone);

  const materialTotals = useMemo(() => {
    const totals: Record<string, { 
      id: string; 
      quantity: number; 
      label: string; 
      tier: number; 
      enchant: number; 
      tierLabel: string; 
      isEligible: boolean 
    }> = {};

    activeRows.forEach((row) => {
      row.materialBreakdown.forEach((mat) => {
        const tierInfo = getTierInfo(mat.id);
        if (!totals[mat.id]) {
          totals[mat.id] = {
            id: mat.id,
            quantity: 0,
            label: getPlannerMaterialLabel(mat.id, locale),
            tier: tierInfo.tier,
            enchant: tierInfo.enchant,
            tierLabel: tierInfo.label,
            isEligible: isReturnEligibleMaterial(mat.id),
          };
        }
        totals[mat.id].quantity += mat.totalQty;
      });
    });

    return Object.values(totals)
      .map((entry) => {
        return {
          ...entry,
          buyQty: Math.ceil(entry.quantity),
        };
      })
      .sort((a, b) => b.tier - a.tier || b.enchant - a.enchant || a.label.localeCompare(b.label));
  }, [activeRows, locale]);

  const journalSummary = useMemo(() => {
    const entries: Record<
      string,
      {
        id: string;
        type: string;
        tier: number;
        totalFame: number;
        exactQuantity: number;
        fullQuantity: number;
        partialPercent: number;
        buyQuantity: number;
        buy: number;
        sell: number;
      }
    > = {};

    activeRows.forEach((row) => {
      const type = row.journalProgress.type;
      const journalId = `${type}-T${row.tier}`;
      const journalTable = journals.find(j => journalMatchesType(j.subtitle, type));
      const journalRow = journalTable?.rows.find(r => r.tier === `T${row.tier}`);

      if (!entries[journalId]) {
        entries[journalId] = {
          id: journalId,
          type,
          tier: row.tier,
          totalFame: 0,
          exactQuantity: 0,
          fullQuantity: 0,
          partialPercent: 0,
          buyQuantity: 0,
          buy: journalRow?.buy || 0,
          sell: journalRow?.sell || 0,
        };
      }

      entries[journalId].totalFame += row.journalProgress.totalFame;
    });

    const details = Object.values(entries).map((entry) => {
      const capacity = getJournalCapacity(entry.tier);
      const exactQuantity = capacity > 0 ? entry.totalFame / capacity : 0;
      const fullQuantity = Math.floor(exactQuantity);
      const partialPercent = (exactQuantity - fullQuantity) * 100;
      const buyQuantity = exactQuantity > 0 ? Math.ceil(exactQuantity) : 0;

      // Albion Printer: Apply tax to journal sell price for profit calculation
      const taxRate = calculatorPreferences.tax / 100;
      const netSellPrice = entry.sell * (1 - taxRate);
      const profitPerJournal = netSellPrice - entry.buy;
      const totalProfit = exactQuantity * profitPerJournal;

      return {
        ...entry,
        exactQuantity,
        fullQuantity,
        partialPercent,
        buyQuantity,
        calculatedProfit: totalProfit,
      };
    });

    const buyTotal = details.reduce((sum, entry) => sum + entry.buy * entry.buyQuantity, 0);
    const sellTotal = details.reduce((sum, entry) => sum + entry.sell * entry.fullQuantity, 0);
    
    // Profit shown in summary (Net of Tax)
    const profit = details.reduce((sum, entry) => sum + entry.calculatedProfit, 0);

    // Realized Profit = Revenue from FULL journals (Net of Tax) - Cost of ALL purchased journals
    const realizedProfit = details.reduce((sum, entry) => {
      const taxRate = calculatorPreferences.tax / 100;
      const netSell = entry.sell * (1 - taxRate);
      // Albion Printer: Net Journal Profit = (SellPrice * 0.935 - BuyPrice) * FullJournals
      return sum + (entry.fullQuantity * (netSell - entry.buy));
    }, 0);

    return {
      details,
      buyTotal,
      sellTotal,
      profit,
      realizedProfit,
    };
  }, [activeRows, journals, calculatorPreferences.tax]);

  const totalItemInvestment = activeRows.reduce((sum, row) => sum + row.realInversion, 0);

  // Item-only theoretical net profit (matches the 1,728,793 target)
  const itemOnlyNetProfit = activeRows.reduce((sum, row) => sum + row.calc.gananciaNeta, 0);

  const totalPlannerInvestment = totalItemInvestment + journalSummary.buyTotal;
  const totalExtraInvestment = totalPlannerInvestment + extraCosts;

  const totalFocus = activeRows.reduce((sum, row) => sum + row.totalFocus, 0);

  // Total Profit = ItemTheoreticalProfit + JournalRealizedProfit - ExtraCosts (matches 1,963,937)
  const totalNetProfit = itemOnlyNetProfit + journalSummary.realizedProfit - extraCosts;

  // Total Sale Value (Albion Printer formula): Total Profit + Total Investment
  const totalSaleValue = totalNetProfit + totalExtraInvestment;

  const roi = totalItemInvestment > 0 ? (itemOnlyNetProfit / totalItemInvestment) * 100 : 0;

  const rawMaterialWeight = activeRows.reduce((sum, row) => {
    return sum + row.materialBreakdown.reduce((innerSum, mat) => {
      if (isArtifactMaterial(mat.id) || isSpecialIngredientMaterial(mat.id)) return innerSum;
      const weight = getWeightForMaterial(mat.id);
      return innerSum + mat.totalQty * weight;
    }, 0);
  }, 0);

  const rawArtifactWeight = activeRows.reduce((sum, row) => {
    return sum + row.materialBreakdown.reduce((innerSum, mat) => {
      if (isArtifactMaterial(mat.id) || isSpecialIngredientMaterial(mat.id)) {
        const weight = getWeightForMaterial(mat.id);
        return innerSum + mat.totalQty * weight;
      }
      return innerSum;
    }, 0);
  }, 0);

  const journalWeight = journalSummary.details.reduce((sum, journal) => {
    return sum + journal.fullQuantity * (JOURNAL_WEIGHTS[journal.tier] ?? 0.1);
  }, 0);

  const transportWeight = rawMaterialWeight + rawArtifactWeight + journalWeight;
  const selectedMount = MOUNTS[selectedMountIndex] ?? MOUNTS[0];
  const selectedBag = BAG_OPTIONS[selectedBagIndex] ?? BAG_OPTIONS[0];
  const selectedFood = FOOD_OPTIONS[selectedFoodIndex] ?? FOOD_OPTIONS[0];
  const transportCapacity = (selectedMount.capacity + selectedBag.bonus) * (1 + selectedFood.bonus);
  const transportTrips = transportWeight > 0 ? Math.ceil(transportWeight / transportCapacity) : 0;
  const weightPercent = Math.min(100, (transportWeight / transportCapacity) * 100);

  // Group materials by type for the materials tab columns
  const groupedMaterials = useMemo(() => {
    const lingote: typeof materialTotals = [];
    const cuero: typeof materialTotals = [];
    const tablas: typeof materialTotals = [];
    const tela: typeof materialTotals = [];
    const artefactos: typeof materialTotals = [];
    const especiales: typeof materialTotals = [];

    for (const mat of materialTotals) {
      if (isArtifactMaterial(mat.id)) { artefactos.push(mat); continue; }
      if (isSpecialIngredientMaterial(mat.id)) { especiales.push(mat); continue; }
      const id = mat.id.toUpperCase();
      if (id.includes('METALBAR'))      lingote.push(mat);
      else if (id.includes('LEATHER'))  cuero.push(mat);
      else if (id.includes('PLANKS'))   tablas.push(mat);
      else if (id.includes('FIBER') || id.includes('CLOTH')) tela.push(mat);
    }
    return { lingote, cuero, tablas, tela, artefactos, especiales };
  }, [materialTotals]);

  // Craft Fame rows per active planner item
  const craftFameRows = activeRows.map((row) => ({
    id: row.id,
    item: row.item,
    tier: row.tier,
    enchant: row.enchant,
    quantity: row.quantity,
    totalFame: row.journalProgress.famePerItem * row.quantity * craftFameBonus,
  }));
  const totalCraftFame = craftFameRows.reduce((sum, r) => sum + r.totalFame, 0);

  // Black market rows
  const blackMarketRows = activeRows.filter((row) => row.blackMarket);

  if (plannerItems.length === 0 && !showAddModal) {
    return (
      <div className={styles.planner}>
        <div className={styles.topBar}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabActive}`}>{t(locale, 'planner')}</button>
            <button className={styles.tab}>{t(locale, 'materialsNeeded')}</button>
            <button className={styles.tab}>{t(locale, 'craftingSummary')}</button>
          </div>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <Plus size={16} strokeWidth={3} /> {t(locale, 'newCraft')}
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <div className={styles.iconWrap}>
              <Plus size={28} strokeWidth={2.5} color="#fc97b7" />
            </div>
            <h2 className={styles.emptyTitle}>{t(locale, 'emptyPlanner')}</h2>
            <p className={styles.emptySub}>{t(locale, 'emptyPlannerSubtitle')}</p>
          </div>
        </div>
        {showAddModal && <AddCraftModal onClose={() => setShowAddModal(false)} />}
      </div>
    );
  }

  return (
    <div className={styles.planner}>
      <div className={styles.topBar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'planificador' ? styles.tabActive : ''}`}
            onClick={() => scrollToSection('planificador')}
          >
            {t(locale, 'planner')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'materiales' ? styles.tabActive : ''}`}
            onClick={() => scrollToSection('materiales')}
          >
            {t(locale, 'materialsNeeded')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'resumen' ? styles.tabActive : ''}`}
            onClick={() => scrollToSection('resumen')}
          >
            {t(locale, 'craftingSummary')}
          </button>
        </div>

        <div className={styles.topStatus}>
          <div className={styles.focoBadge}>
            <div className={styles.focoIconWrap}><Zap size={14} fill="currentColor" /></div>
            <div className={styles.focoText}>
              <span className={styles.focoLabel}>{t(locale, 'focusUsed')}</span>
              <span className={styles.focoValue}>{formatCompact(totalFocus, localeCode)}</span>
            </div>
          </div>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <Plus size={16} strokeWidth={3} /> {t(locale, 'newCraft')}
          </button>
        </div>
      </div>

      <div className={styles.plannerContent}>
        <section ref={planificadorRef} className={styles.anchorSection}>
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <span className={styles.headerLabel}>{t(locale, 'item')}</span>
              <span className={styles.headerLabel}>{t(locale, 'quantity')}</span>
              <span className={styles.headerLabel}>{t(locale, 'materialsAndJournals')}</span>
              <span className={styles.headerLabel}>{t(locale, 'profit')}</span>
              <span className={styles.headerLabel}>{t(locale, 'focus')}</span>
              <span className={styles.headerLabel}>{t(locale, 'completed')}</span>
              <span />
            </div>

            {plannerRows.map((row) => {
              const journalType = getJournalType(row.item);
              return (
                <div key={row.id} className={styles.itemRow} style={{ opacity: row.isDone ? 0.5 : 1 }}>
                  <div className={styles.itemMain}>
                    <img src={getItemImageUrl(row.item.id)} alt="" className={styles.itemImg} />
                    <div className={styles.itemMeta}>
                      <span className={styles.itemName}>{getItemName(row.item, locale).toUpperCase()}</span>
                      <div className={styles.itemTags}>
                        <span className={styles.rowBadge}>T{row.tier}.{row.enchant}</span>
                        <span className={styles.rrEditBadge}>
                          RR
                          <input
                            type="number"
                            className={styles.rrEditInput}
                            value={row.returnRate}
                            min={0}
                            max={100}
                            step={0.1}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) updatePlannerItem(row.id, { returnRate: Math.min(100, Math.max(0, val)) });
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          %
                        </span>
                        {row.blackMarket && <span className={styles.marketBadge}>BM</span>}
                      </div>
                    </div>
                  </div>

                  <input
                    type="number"
                    className={styles.cantInput}
                    value={row.quantity}
                    onChange={(e) => updatePlannerItem(row.id, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  />

                  <div className={styles.matList}>
                    {row.materialBreakdown.slice(0, 3).map((mat) => (
                      <div key={mat.id} className={styles.matLine}>
                      {formatWholeQuantity(mat.totalQty, localeCode)} x {getPlannerMaterialLabel(mat.id, locale)} ({getTierInfo(mat.id).label})
                      </div>
                    ))}
                    <div className={styles.rrBadge}>
                      {Math.ceil(row.journalProgress.exactJournals)}x {getJournalDisplayName('', journalType, locale)} / {getJournalWorkerName(journalType, locale)} (T{row.tier})
                    </div>
                    <div className={styles.journalMini}>
                      {row.journalProgress.fullJournals} {t(locale, 'fullJournals').toLowerCase()} · {Math.round(row.journalProgress.partialFill * 100)}% {t(locale, 'partialJournal').toLowerCase()}
                    </div>
                  </div>

                  <div className={styles.profitCol}>
                    <span className={`${styles.profitValue} ${row.calc.gananciaNeta >= 0 ? styles.green : styles.red}`}>
                      {formatSignedExactValue(row.calc.gananciaNeta, localeCode)}
                    </span>
                    <span className={styles.profitSub}>
                      {row.salePrice > 0
                        ? `${formatCompact(row.salePrice, localeCode)} ${locale === 'es' ? 'c/u' : 'each'}`
                        : t(locale, 'noSalePrice')}
                    </span>
                  </div>

                  <div className={styles.toggleCol}>
                    <Zap size={14} color={row.useFocus ? '#fc97b7' : '#9a6f7e'} />
                    <span className={styles.toggleLabel}>{row.useFocus ? t(locale, 'on') : t(locale, 'off')}</span>
                  </div>

                  <div className={styles.doneCol}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={row.isDone}
                      onChange={(e) => updatePlannerItem(row.id, { isDone: e.target.checked })}
                    />
                  </div>

                  <button className={styles.deleteBtn} onClick={() => removePlannerItem(row.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section ref={materialesRef} className={styles.anchorSection}>
          <div className={styles.summaryRow}>
            <div className={styles.sumCard}>
              <div className={`${styles.sumIconWrap} ${styles.sumIconCyan}`}><Wallet size={20} /></div>
              <div className={styles.sumDetails}>
                <span className={styles.sumLabel}>{t(locale, 'investment')}</span>
                <span className={styles.sumValue}>{formatExactValue(totalItemInvestment, localeCode)}</span>
              </div>
            </div>
            <div className={styles.sumCard}>
              <div className={`${styles.sumIconWrap} ${styles.sumIconGreen}`}><LineChart size={20} /></div>
              <div className={styles.sumDetails}>
                <span className={styles.sumLabel}>{t(locale, 'netProfit')}</span>
                <span className={`${styles.sumValue} ${itemOnlyNetProfit >= 0 ? styles.green : styles.red}`}>
                  {formatSignedExactValue(itemOnlyNetProfit, localeCode)}
                </span>
              </div>
            </div>
            <div className={styles.sumCard}>
              <div className={`${styles.sumIconWrap} ${styles.sumIconPurple}`}><ReceiptText size={20} /></div>
              <div className={styles.sumDetails}>
                <span className={styles.sumLabel}>ROI</span>
                <span className={styles.sumValue}>{roi.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <Layers size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{t(locale, 'materialsNeeded')}</span>
            </div>
            <div className={styles.materialColumns}>
              {[
                { title: locale === 'es' ? 'CUERO' : 'LEATHER', items: groupedMaterials.cuero },
                { title: locale === 'es' ? 'TELA' : 'CLOTH', items: groupedMaterials.tela },
                { title: locale === 'es' ? 'TABLAS' : 'PLANKS', items: groupedMaterials.tablas },
                { title: locale === 'es' ? 'ACERO' : 'STEEL', items: groupedMaterials.lingote },
              ].filter(group => group.items.length > 0).map((group) => (
                <div key={group.title} className={styles.groupCard}>
                  <span className={group.title}>{group.title}</span>
                  <div className={styles.groupList}>
                    {group.items.map((mat) => (
                      <div key={mat.id} className={styles.groupRow}>
                        <div className={styles.groupInfo}>
                          <img src={getItemImageUrl(getMaterialImageId(mat.id))} className={styles.groupImg} alt="" />
                          <div className={styles.groupMeta}>
                            <span className={styles.groupName}>{mat.label}</span>
                            <span className={styles.groupTier}>{mat.tierLabel}</span>
                          </div>
                        </div>
                        <span className={styles.groupQty}>{formatWholeQuantity(mat.quantity, localeCode)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <Boxes size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{t(locale, 'artifactsNeeded')}</span>
            </div>
            <div className={styles.artifactGrid}>
              {groupedMaterials.artefactos.length > 0 ? groupedMaterials.artefactos.map((mat) => (
                <div key={mat.id} className={styles.artifactCard}>
                  <img src={getItemImageUrl(getMaterialImageId(mat.id))} className={styles.artifactImg} alt="" />
                  <div className={styles.artifactInfo}>
                    <span className={styles.artifactName}>{mat.label}</span>
                    <span className={styles.artifactTier}>({mat.tierLabel})</span>
                  </div>
                  <span className={styles.artifactQty}>{formatWholeQuantity(mat.quantity, localeCode)}x</span>
                </div>
              )) : (
                <div className={styles.panelEmpty}>{t(locale, 'noArtifactsNeeded')}</div>
              )}
            </div>
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <Boxes size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{locale === 'es' ? 'INGREDIENTES ESPECIALES' : 'SPECIAL INGREDIENTS'}</span>
            </div>
            <div className={styles.artifactGrid}>
              {groupedMaterials.especiales.length > 0 ? groupedMaterials.especiales.map((mat) => (
                <div key={mat.id} className={styles.artifactCard}>
                  <img src={getItemImageUrl(getMaterialImageId(mat.id))} className={styles.artifactImg} alt="" />
                  <div className={styles.artifactInfo}>
                    <span className={styles.artifactName}>{mat.label}</span>
                    <span className={styles.artifactTier}>({mat.tierLabel})</span>
                  </div>
                  <span className={styles.artifactQty}>{formatWholeQuantity(mat.quantity, localeCode)}x</span>
                </div>
              )) : (
                <div className={styles.panelEmpty}>{locale === 'es' ? 'SIN INGREDIENTES ESPECIALES' : 'NO SPECIAL INGREDIENTS REQUIRED'}</div>
              )}
            </div>
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <Book size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{t(locale, 'journalDetails')}</span>
            </div>
            <div className={styles.artifactGrid}>
              {journalSummary.details.length > 0 ? journalSummary.details.map((journal) => (
                <div key={journal.id} className={styles.artifactCard}>
                  <img src={getItemImageUrl(getJournalImageId(journal.type, journal.tier))} className={styles.artifactImg} alt="" />
                  <div className={styles.artifactInfo}>
                    <span className={styles.artifactName}>{getJournalDisplayName('', journal.type, locale)}</span>
                    <span className={styles.artifactTier}>(T{journal.tier})</span>
                  </div>
                  <span className={styles.artifactQty}>{journal.buyQuantity.toLocaleString(localeCode)}x</span>
                </div>
              )) : (
                <div className={styles.panelEmpty}>{t(locale, 'noJournalsRequired')}</div>
              )}
            </div>
          </div>

          <div className={styles.journalSummaryCard}>
            <div className={styles.sectionHeader}>
              <Book size={18} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{t(locale, 'journalSummary')}</span>
            </div>
            <div className={styles.journalSummaryLine}>
              <span>{t(locale, 'journalCostTotal')}</span>
              <strong>{formatExactValue(journalSummary.buyTotal, localeCode)}</strong>
            </div>
            <div className={styles.journalSummaryLine}>
              <span>{t(locale, 'journalNetProfit')}</span>
              <strong className={journalSummary.profit >= 0 ? styles.green : styles.red}>
                {formatSignedExactValue(journalSummary.profit, localeCode)}
              </strong>
            </div>
            {journalSummary.details.map((journal) => (
              <div key={journal.id} className={styles.journalSummaryLine}>
                <span>
                  {journal.exactQuantity.toLocaleString(localeCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x {getJournalDisplayName('', journal.type, locale)} / {getJournalWorkerName(journal.type, locale)} T{journal.tier}
                </span>
                <strong className={journal.calculatedProfit >= 0 ? styles.green : styles.red}>
                  {formatSignedExactValue(journal.calculatedProfit, localeCode)}
                </strong>
              </div>
            ))}
            <p className={styles.note}>{t(locale, 'journalSessionNote')}</p>
          </div>

          <div className={styles.collapsibleSection}>
            <div className={styles.sectionHeader} onClick={toggleCraftFame} style={{ cursor: 'pointer' }}>
              <Star size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>CRAFT FAME</span>
              <div className={styles.headerActions}>
                <select
                  className={styles.compactSelect}
                  value={craftFameBonus}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setCraftFameBonus(Number(e.target.value))}
                >
                  {CRAFT_FAME_BONUSES.map((bonus) => (
                    <option key={bonus.label} value={bonus.value}>{bonus.label}</option>
                  ))}
                </select>
                <div className={styles.toggleBtn}>
                  {showCraftFame ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>
            {showCraftFame && (
              <div className={styles.famePanel}>
                <div className={styles.transportTotal}>
                  <span>TOTAL FAME</span>
                  <strong>{formatExactValue(totalCraftFame, localeCode)}</strong>
                </div>
                <div className={styles.fameList}>
                  {craftFameRows.length > 0 ? craftFameRows.map((row) => (
                    <div key={row.id} className={styles.fameRow}>
                      <div className={styles.groupInfo}>
                        <img src={getItemImageUrl(row.item.id)} className={styles.groupImg} alt="" />
                        <div className={styles.groupMeta}>
                          <span className={styles.groupName}>{getCraftDisplayName(row, locale)}</span>
                          <span className={styles.groupTier}>{row.quantity.toLocaleString(localeCode)} craft(s)</span>
                        </div>
                      </div>
                      <span className={styles.groupQty}>{formatExactValue(row.totalFame, localeCode)}</span>
                    </div>
                  )) : (
                    <div className={styles.panelEmpty}>NO CRAFT FAME</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.collapsibleSection}>
            <div className={styles.sectionHeader} onClick={() => setShowWeight(!showWeight)} style={{ cursor: 'pointer' }}>
              <Weight size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>TRANSPORT WEIGHT</span>
              <button className={styles.toggleBtn} style={{ marginLeft: 'auto' }}>
                {showWeight ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {showWeight && (
              <div className={styles.transportPanel}>
                <div className={styles.weightCards}>
                  <div className={`${styles.sumCard} ${styles.weightSumCard}`}>
                    <div className={`${styles.sumIconWrap} ${styles.sumIconCyan}`}><Boxes size={22} /></div>
                    <div className={styles.sumDetails}>
                      <span className={styles.sumLabel}>MATERIALS</span>
                      <span className={styles.sumValue}>{rawMaterialWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG</span>
                    </div>
                  </div>
                  <div className={`${styles.sumCard} ${styles.weightSumCard}`}>
                    <div className={`${styles.sumIconWrap} ${styles.sumIconPurple}`}><Star size={22} /></div>
                    <div className={styles.sumDetails}>
                      <span className={styles.sumLabel}>ARTIFACTS</span>
                      <span className={styles.sumValue}>{rawArtifactWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG</span>
                    </div>
                  </div>
                  <div className={`${styles.sumCard} ${styles.weightSumCard}`}>
                    <div className={`${styles.sumIconWrap} ${styles.sumIconGreen}`}><Book size={22} /></div>
                    <div className={styles.sumDetails}>
                      <span className={styles.sumLabel}>JOURNALS</span>
                      <span className={styles.sumValue}>{journalWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG</span>
                    </div>
                  </div>
                  <div className={`${styles.sumCard} ${styles.weightSumCard} ${styles.weightSumTotal}`}>
                    <div className={`${styles.sumIconWrap} ${styles.weightSumTotalIcon}`}><Weight size={22} /></div>
                    <div className={styles.sumDetails}>
                      <span className={styles.sumLabel}>TOTAL</span>
                      <span className={styles.sumValue}>{transportWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG</span>
                    </div>
                  </div>
                </div>

                <div className={styles.transportControls}>
                  <div className={styles.controlGroup}>
                    <label>MOUNT</label>
                    <div className={styles.customSelect} onClick={() => setShowMountDropdown(!showMountDropdown)}>
                      <div className={styles.customSelectInner}>
                        {selectedMount.itemId && <img src={getItemImageUrl(selectedMount.itemId)} className={styles.selectImg} alt="" />}
                        <span>{selectedMount.name}</span>
                      </div>
                      <ChevronDown size={14} />
                      {showMountDropdown && (
                        <div className={styles.selectDropdown}>
                          {MOUNTS.map((mount, index) => (
                            <div key={mount.name} className={`${styles.selectOption} ${index === selectedMountIndex ? styles.selectOptionActive : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedMountIndex(index); setShowMountDropdown(false); }}>
                              <img src={getItemImageUrl(mount.itemId)} className={styles.optionImg} alt="" />
                              <div className={styles.optionMeta}>
                                <span className={styles.optionName}>{mount.name}</span>
                                <span className={styles.optionSub}>{mount.capacity.toLocaleString(localeCode)} kg</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.controlGroup}>
                    <label>BAG</label>
                    <div className={styles.customSelect} onClick={() => setShowBagDropdown(!showBagDropdown)}>
                      <div className={styles.customSelectInner}>
                        {selectedBag.itemId ? <img src={getItemImageUrl(selectedBag.itemId)} className={styles.selectImg} alt="" /> : <div className={styles.selectImgPlaceholder} />}
                        <span>{selectedBag.name}</span>
                      </div>
                      <ChevronDown size={14} />
                      {showBagDropdown && (
                        <div className={styles.selectDropdown}>
                          {BAG_OPTIONS.map((bag, index) => (
                            <div key={bag.name} className={`${styles.selectOption} ${index === selectedBagIndex ? styles.selectOptionActive : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedBagIndex(index); setShowBagDropdown(false); }}>
                              {bag.itemId ? <img src={getItemImageUrl(bag.itemId)} className={styles.optionImg} alt="" /> : <div className={styles.optionImgPlaceholder} />}
                              <div className={styles.optionMeta}>
                                <span className={styles.optionName}>{bag.name}</span>
                                <span className={styles.optionSub}>{bag.bonus > 0 ? `+${bag.bonus.toLocaleString(localeCode)} kg` : '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.controlGroup}>
                    <label>FOOD</label>
                    <div className={styles.customSelect} onClick={() => setShowFoodDropdown(!showFoodDropdown)}>
                      <div className={styles.customSelectInner}>
                        {selectedFood.itemId ? <img src={getItemImageUrl(selectedFood.itemId)} className={styles.selectImg} alt="" /> : <div className={styles.selectImgPlaceholder} />}
                        <span>{selectedFood.name}</span>
                      </div>
                      <ChevronDown size={14} />
                      {showFoodDropdown && (
                        <div className={styles.selectDropdown}>
                          {FOOD_OPTIONS.map((food, index) => (
                            <div key={food.name} className={`${styles.selectOption} ${index === selectedFoodIndex ? styles.selectOptionActive : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedFoodIndex(index); setShowFoodDropdown(false); }}>
                              {food.itemId ? <img src={getItemImageUrl(food.itemId)} className={styles.optionImg} alt="" /> : <div className={styles.optionImgPlaceholder} />}
                              <div className={styles.optionMeta}>
                                <span className={styles.optionName}>{food.name}</span>
                                <span className={styles.optionSub}>{food.bonus > 0 ? `+${(food.bonus * 100).toLocaleString(localeCode)}%` : '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.mountResultCompact}>
                  <div className={styles.mountResultText}>
                    <div className={styles.mountResultHeader}>
                      <span>{selectedMount.name}</span>
                      <div className={styles.tripsBadge}>
                        {transportTrips || 0} {locale === 'es' ? 'VIAJES' : 'TRIPS'}
                      </div>
                    </div>
                    <div className={styles.weightProgressContainer}>
                      <div className={styles.mountWeightLabel}>
                        {transportWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG / {transportCapacity.toLocaleString(localeCode, { maximumFractionDigits: 0 })} KG
                      </div>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${weightPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.mountImages}>
                    {selectedMount.itemId && (
                      <div className={styles.mountImgWrap}><img src={getItemImageUrl(selectedMount.itemId)} className={styles.squareImg} alt="" /></div>
                    )}
                    {selectedBag.itemId && (
                      <div className={styles.bagImgWrap}><img src={getItemImageUrl(selectedBag.itemId)} className={styles.squareImg} alt="" /></div>
                    )}
                    {selectedFood.itemId && (
                      <div className={styles.foodImgWrap}><img src={getItemImageUrl(selectedFood.itemId)} className={styles.squareImg} alt="" /></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section ref={resumenRef} className={styles.anchorSection}>
          <div>
            <div className={styles.sectionHeader}>
              <MoonStar size={18} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{t(locale, 'blackMarketTransport')}</span>
            </div>
            <div className={styles.artifactGrid}>
              {blackMarketRows.length > 0 ? blackMarketRows.map((row) => (
                <div key={row.id} className={styles.artifactCard}>
                  <img src={getItemImageUrl(row.item.id)} className={styles.artifactImg} alt="" />
                  <div className={styles.artifactInfo}>
                    <span className={styles.artifactName}>{getCraftDisplayName(row, locale)}</span>
                    <span className={styles.artifactTier}>
                      {row.quantity} {locale === 'es' ? 'u.' : 'units'} · {formatCompact(row.totalSaleValue, localeCode)}
                    </span>
                  </div>
                  <span className={styles.marketBadge}>BM</span>
                </div>
              )) : (
                <div className={styles.panelEmpty}>{t(locale, 'noBlackMarketItems')}</div>
              )}
            </div>
          </div>

          <div className={styles.finalSummary}>
            <div className={styles.sectionHeader}>
              <LineChart size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{t(locale, 'craftingSummary')}</span>
            </div>

            <div className={styles.finalRow}>
              <div className={styles.finalLeft}>
                <div className={styles.finalIcon}><Plus size={20} /></div>
                <div>
                  <div className={styles.finalLabel}>{t(locale, 'extraCosts')}</div>
                  <div className={styles.finalSub}>{t(locale, 'extraCostsHint')}</div>
                </div>
              </div>
              <FormattedPlannerInput
                className={styles.finalInput}
                value={extraCosts}
                localeCode={localeCode}
                onChange={setExtraCosts}
              />
            </div>

            <div className={styles.finalRow}>
              <div className={styles.finalLeft}>
                <Wallet size={24} color="#fc97b7" />
                <div className={styles.finalLabel}>{t(locale, 'totalInvestment')}</div>
              </div>
              <div className={styles.finalValue}>{formatExactValue(Math.round(totalExtraInvestment), localeCode)}</div>
            </div>

            <div className={styles.finalRow}>
              <div className={styles.finalLeft}>
                <LineChart size={24} color="#4f8f38" />
                <div className={styles.finalLabel}>{t(locale, 'totalProfit')}</div>
              </div>
              <div className={`${styles.finalValue} ${totalNetProfit >= 0 ? styles.green : styles.red}`}>
                {formatSignedExactValue(Math.round(totalNetProfit), localeCode)}
              </div>
            </div>

            <div className={styles.finalRow}>
              <div className={styles.finalLeft}>
                <CheckSquare size={24} color="#a06f11" />
                <div className={styles.finalLabel}>{t(locale, 'totalSaleValue')}</div>
              </div>
              <div className={`${styles.finalValue} ${styles.gold}`}>{formatExactValue(Math.round(totalSaleValue), localeCode)}</div>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && <AddCraftModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
