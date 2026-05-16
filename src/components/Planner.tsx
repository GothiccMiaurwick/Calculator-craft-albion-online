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
const MATERIAL_WEIGHTS: Record<number, number> = { 4: 0.5, 5: 0.8, 6: 1.1, 7: 1.7, 8: 2.6 };
const JOURNAL_WEIGHTS: Record<number, number> = { 4: 0.3, 5: 0.5, 6: 0.8, 7: 1.1, 8: 1.7 };
const ARTIFACT_WEIGHT = 2;
const MOUNTS = [
  { name: 'Armored Horse', capacity: 325, itemId: 'T8_MOUNT_ARMORED_HORSE' },
  { name: 'Gallant Horse', capacity: 494, itemId: 'UNIQUE_MOUNT_GIANT_HORSE_ADC' },
  { name: 'Moose', capacity: 815, itemId: 'T6_MOUNT_GIANTSTAG_MOOSE' },
  { name: 'Spectral Direboar', capacity: 2130, itemId: 'UNIQUE_MOUNT_UNDEAD_DIREBOAR_ADC' },
  { name: 'Elite Wild Boar', capacity: 3185, itemId: 'T8_MOUNT_DIREBOAR_FW_LYMHURST_ELITE' },
  { name: 'Elite Bighorn Ram', capacity: 3200, itemId: 'T8_MOUNT_RAM_FW_MARTLOCK_ELITE' },
  { name: 'Elite Winter Bear', capacity: 4250, itemId: 'T8_MOUNT_DIREBEAR_FW_FORTSTERLING_ELITE' },
  { name: "Elder's Transport Ox", capacity: 5000, itemId: 'T8_MOUNT_OX' },
];
const BAG_OPTIONS = [
  { name: 'No bag', bonus: 0 },
  { name: 'T6 Bag', bonus: 432 },
  { name: 'T7 Bag', bonus: 664 },
  { name: 'T8 Bag', bonus: 1038 },
];
const FOOD_OPTIONS = [
  { name: 'No food', bonus: 0 },
  { name: 'Pork Pie', bonus: 0.3 },
  { name: 'Avalonian Pork Pie', bonus: 0.45 },
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

function formatSignedUnroundedValue(value: number, localeCode: string): string {
  const formatted = formatUnroundedValue(value, localeCode);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
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

export default function Planner() {
  const {
    plannerItems,
    removePlannerItem,
    updatePlannerItem,
    resources,
    artifactPrices,
    journals,
    specs,
    calculatorPreferences,
    server,
  } = useApp();
  const locale = calculatorPreferences.locale;
  const localeCode = getDisplayLocale(locale);
  const [activeTab, setActiveTab] = useState<'planificador' | 'materiales' | 'resumen'>('planificador');
  const [showAddModal, setShowAddModal] = useState(false);
  const [extraCosts, setExtraCosts] = useState(() => readExtraCosts());
  const [selectedMountIndex, setSelectedMountIndex] = useState(2);
  const [selectedBagIndex, setSelectedBagIndex] = useState(0);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(0);
  const [craftFameBonus, setCraftFameBonus] = useState(1);
  const planificadorRef = useRef<HTMLElement | null>(null);
  const materialesRef = useRef<HTMLElement | null>(null);
  const resumenRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    plannerItems.forEach((item) => {
      const hasPriceSnapshot = item.materialPricesSnapshot && Object.keys(item.materialPricesSnapshot).length > 0;
      const expectedFallback = getFallbackRecipe(item.item.id);
      const expectedSpecialIds = expectedFallback
        .filter((mat) => isSpecialIngredientMaterial(mat.id))
        .map((mat) => mat.id);
      const hasExpectedSpecialIds = expectedSpecialIds.every((id) =>
        item.materialsSnapshot.some((mat) => mat.id === id)
      );
      const needsShapeshifterMigration =
        item.item.baseId.includes('SHAPESHIFTER') &&
        expectedSpecialIds.length > 0 &&
        !hasExpectedSpecialIds;
      const expectedArtifactIds = expectedFallback
        .filter((mat) => isArtifactMaterial(mat.id))
        .map((mat) => mat.id);
      const currentArtifactIds = item.materialsSnapshot
        .filter((mat) => isArtifactMaterial(mat.id))
        .map((mat) => mat.id);
      const expectedCore = expectedFallback.map((mat) => `${mat.id}:${mat.quantity}`).sort();
      const currentCore = item.materialsSnapshot.map((mat) => `${mat.id}:${mat.quantity}`).sort();
      const needsRecipeQuantityMigration = JSON.stringify(expectedCore) !== JSON.stringify(currentCore);
      const needsArtifactIdMigration =
        expectedArtifactIds.length > 0 &&
        JSON.stringify(expectedArtifactIds) !== JSON.stringify(currentArtifactIds);

      if (hasPriceSnapshot && !needsShapeshifterMigration && !needsArtifactIdMigration && !needsRecipeQuantityMigration) {
        return;
      }

      const materials = needsShapeshifterMigration || needsArtifactIdMigration || needsRecipeQuantityMigration
        ? expectedFallback
        : Array.isArray(item.materialsSnapshot) && item.materialsSnapshot.length > 0
          ? item.materialsSnapshot
          : getFallbackRecipe(item.item.id);
      const materialPricesSnapshot = materials.reduce<Record<string, number>>((acc, mat) => {
        acc[mat.id] = resolvePrice(mat.id, resources, artifactPrices);
        return acc;
      }, {});

      const sameMaterials = JSON.stringify(item.materialsSnapshot) === JSON.stringify(materials);
      const samePriceSnapshot = JSON.stringify(item.materialPricesSnapshot || {}) === JSON.stringify(materialPricesSnapshot);
      if (sameMaterials && samePriceSnapshot) {
        return;
      }

      updatePlannerItem(item.id, {
        materialsSnapshot: materials,
        materialPricesSnapshot,
      });
    });
  }, [plannerItems, updatePlannerItem, resources, artifactPrices]);

  useEffect(() => {
    const syncSpecialMaterialPrices = async () => {
      for (const item of plannerItems) {
        const materials = Array.isArray(item.materialsSnapshot) ? item.materialsSnapshot : [];
        if (materials.length === 0) continue;

        const missingIds = materials
          .map((mat) => mat.id)
          .filter((id) => {
            const snapshotValue = item.materialPricesSnapshot?.[id];
            if (typeof snapshotValue === 'number' && snapshotValue > 0) return false;
            if (!isArtifactLikeMaterial(id)) return false;
            return resolvePrice(id, resources, artifactPrices) <= 0;
          });

        if (missingIds.length === 0) continue;

        try {
          const marketRows = await fetchPrices(Array.from(new Set(missingIds)), server, CITIES);
          const fetchedPrices = marketRows.reduce<Record<string, number>>((acc, row) => {
            if (row.quality !== 1) return acc;
            const candidate = row.sell_price_min || row.buy_price_max || 0;
            if (candidate > (acc[row.item_id] ?? 0)) {
              acc[row.item_id] = candidate;
            }
            return acc;
          }, {});

          if (Object.keys(fetchedPrices).length === 0) continue;

          updatePlannerItem(item.id, {
            materialPricesSnapshot: {
              ...(item.materialPricesSnapshot || {}),
              ...fetchedPrices,
            },
          });
        } catch (error) {
          console.error('Planner special material price sync failed:', error);
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
      const snapshot = Array.isArray(pi.materialsSnapshot) ? pi.materialsSnapshot : [];
      const materials = snapshot.length > 0 ? snapshot : getFallbackRecipe(pi.item.id);
      const priceSnapshot = pi.materialPricesSnapshot || {};
      const salePrice = typeof pi.salePriceSnapshot === 'number' ? pi.salePriceSnapshot : 0;
      const calc = calculateCrafting({
        materials,
        resources,
        artifactPrices,
        priceOverrides: priceSnapshot,
        marketPrices: priceSnapshot,
        salePrice,
        returnRate: pi.returnRate,
        taxRate: pi.taxRate,
        itemQuantity: pi.quantity,
      });

      const materialBreakdown = materials.map((mat) => {
        const unitPrice = priceSnapshot[mat.id] ?? resolvePrice(mat.id, resources, artifactPrices, {}, priceSnapshot);
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

      return {
        ...pi,
        salePrice,
        calc,
        journalProgress,
        materialBreakdown,
        totalSaleValue: salePrice * pi.quantity,
        totalFocus: pi.useFocus ? getAdjustedFocusCost(pi.item, pi.tier, pi.enchant, specs) * pi.quantity : 0,
      };
    });
  }, [plannerItems, resources, artifactPrices, specs]);

  const activeRows = plannerRows.filter(row => !row.isDone);

  const materialTotals = useMemo(() => {
    const totals: Record<string, { id: string; quantity: number; buyQty: number; label: string; tier: number; enchant: number; tierLabel: string }> = {};

    activeRows.forEach((row) => {
      row.materialBreakdown.forEach((mat) => {
        const tierInfo = getTierInfo(mat.id);
        if (!totals[mat.id]) {
          totals[mat.id] = {
            id: mat.id,
            quantity: 0,
            buyQty: 0,
            label: getPlannerMaterialLabel(mat.id, locale),
            tier: tierInfo.tier,
            enchant: tierInfo.enchant,
            tierLabel: tierInfo.label,
          };
        }
        totals[mat.id].quantity += mat.totalQty;
      });
    });

    return Object.values(totals)
      .map((entry) => ({
        ...entry,
        buyQty: Math.ceil(entry.quantity),
      }))
      .sort((a, b) => b.tier - a.tier || b.enchant - a.enchant || a.label.localeCompare(b.label));
  }, [activeRows, locale]);

  const groupedMaterials = useMemo(() => {
    const groups = {
      cuero: [] as typeof materialTotals,
      tela: [] as typeof materialTotals,
      tablas: [] as typeof materialTotals,
      lingote: [] as typeof materialTotals,
      artefactos: [] as typeof materialTotals,
      especiales: [] as typeof materialTotals,
      otros: [] as typeof materialTotals,
    };

    materialTotals.forEach((mat) => {
      if (isArtifactMaterial(mat.id)) groups.artefactos.push(mat);
      else if (isSpecialIngredientMaterial(mat.id)) groups.especiales.push(mat);
      else if (mat.id.includes('LEATHER')) groups.cuero.push(mat);
      else if (mat.id.includes('FIBER') || mat.id.includes('CLOTH')) groups.tela.push(mat);
      else if (mat.id.includes('PLANKS')) groups.tablas.push(mat);
      else if (mat.id.includes('METALBAR')) groups.lingote.push(mat);
      else groups.otros.push(mat);
    });

    return groups;
  }, [materialTotals]);

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

      // Net Journal Profit Formula (Santux):
      // Each journal (even partial) contributes to profit proportionally.
      // Profit per journal = (Sell Price * (1 - Tax)) - Buy Price
      const taxRate = calculatorPreferences.tax / 100;
      const netSellPrice = entry.sell * (1 - taxRate);
      const profitPerJournal = netSellPrice - entry.buy;
      // Santux Formula: Total profit per journal line includes partials to match the original tool's results.
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
    const profit = details.reduce((sum, entry) => sum + entry.calculatedProfit, 0);

    return {
      details,
      buyTotal,
      sellTotal,
      profit,
    };
  }, [activeRows, journals, calculatorPreferences.tax]);

  const totalInvestment = activeRows.reduce((sum, row) => sum + row.calc.inversion, 0);
  const totalProfit = activeRows.reduce((sum, row) => sum + row.calc.gananciaNeta, 0);
  const totalFocus = activeRows.reduce((sum, row) => sum + row.totalFocus, 0);
  const totalExtraInvestment = totalInvestment + journalSummary.buyTotal + extraCosts;
  const totalNetProfit = totalProfit + journalSummary.profit - extraCosts;
  const totalSaleValue = totalExtraInvestment + totalNetProfit;
  const roi = totalExtraInvestment > 0 ? (totalNetProfit / totalExtraInvestment) * 100 : 0;
  const blackMarketRows = activeRows.filter(row => row.blackMarket);
  const craftFameRows = activeRows.map((row) => {
    const famePerItem = getCraftingFameForItem(row.item, row.tier, row.enchant);
    const totalFame = famePerItem * row.quantity * craftFameBonus * (calculatorPreferences.usePremium ? 1.5 : 1);

    return {
      id: row.id,
      item: row.item,
      tier: row.tier,
      enchant: row.enchant,
      quantity: row.quantity,
      famePerItem,
      totalFame,
    };
  });
  const totalCraftFame = craftFameRows.reduce((sum, row) => sum + row.totalFame, 0);
  const materialWeight = materialTotals.reduce((sum, mat) => {
    return sum + Math.ceil(mat.quantity) * (MATERIAL_WEIGHTS[mat.tier] ?? 0);
  }, 0);
  const artifactWeight = [...groupedMaterials.artefactos, ...groupedMaterials.especiales].reduce((sum, mat) => {
    return sum + Math.ceil(mat.quantity) * ARTIFACT_WEIGHT;
  }, 0);
  const journalWeight = journalSummary.details.reduce((sum, journal) => {
    return sum + journal.buyQuantity * (JOURNAL_WEIGHTS[journal.tier] ?? 0);
  }, 0);
  const transportWeight = materialWeight + artifactWeight + journalWeight;
  const selectedMount = MOUNTS[selectedMountIndex] ?? MOUNTS[0];
  const selectedBag = BAG_OPTIONS[selectedBagIndex] ?? BAG_OPTIONS[0];
  const selectedFood = FOOD_OPTIONS[selectedFoodIndex] ?? FOOD_OPTIONS[0];
  const transportCapacity = (selectedMount.capacity + selectedBag.bonus) * (1 + selectedFood.bonus);
  const transportTrips = transportWeight > 0 ? Math.ceil(transportWeight / transportCapacity) : 0;

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
                        <span className={styles.rowBadge}>RR {row.returnRate.toFixed(1)}%</span>
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
                      {formatSignedUnroundedValue(row.calc.gananciaNeta, localeCode)}
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
                <span className={styles.sumValue}>{formatExactValue(totalInvestment, localeCode)}</span>
              </div>
            </div>
            <div className={styles.sumCard}>
              <div className={`${styles.sumIconWrap} ${styles.sumIconGreen}`}><LineChart size={20} /></div>
              <div className={styles.sumDetails}>
                <span className={styles.sumLabel}>{t(locale, 'netProfit')}</span>
                <span className={`${styles.sumValue} ${totalProfit >= 0 ? styles.green : styles.red}`}>
                  {formatSignedUnroundedValue(totalProfit, localeCode)}
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
              ].map((group) => (
                <div key={group.title} className={styles.groupCard}>
                  <span className={styles.groupTitle}>{group.title}</span>
                  <div className={styles.groupList}>
                    {group.items.length > 0 ? group.items.map((mat) => (
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
                    )) : (
                      <div className={styles.groupEmpty}>{t(locale, 'noMaterials')}</div>
                    )}
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

          <div>
            <div className={styles.sectionHeader}>
              <Star size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>CRAFT FAME</span>
              <select
                className={styles.compactSelect}
                value={craftFameBonus}
                onChange={(e) => setCraftFameBonus(Number(e.target.value))}
              >
                {CRAFT_FAME_BONUSES.map((bonus) => (
                  <option key={bonus.label} value={bonus.value}>{bonus.label}</option>
                ))}
              </select>
            </div>
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
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <Weight size={20} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>TRANSPORT WEIGHT</span>
            </div>
            <div className={styles.transportPanel}>
              <div className={styles.weightGrid}>
                <div className={styles.weightCard}>
                  <span>MATERIALS</span>
                  <strong>{materialWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG</strong>
                </div>
                <div className={styles.weightCard}>
                  <span>ARTIFACTS</span>
                  <strong>{artifactWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG</strong>
                </div>
                <div className={styles.weightCard}>
                  <span>JOURNALS</span>
                  <strong>{journalWeight.toLocaleString(localeCode, { maximumFractionDigits: 1 })} KG</strong>
                </div>
              </div>
              <div className={styles.transportControls}>
                <label>
                  MOUNT
                  <select value={selectedMountIndex} onChange={(e) => setSelectedMountIndex(Number(e.target.value))}>
                    {MOUNTS.map((mount, index) => (
                      <option key={mount.name} value={index}>{mount.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  BAG
                  <select value={selectedBagIndex} onChange={(e) => setSelectedBagIndex(Number(e.target.value))}>
                    {BAG_OPTIONS.map((bag, index) => (
                      <option key={bag.name} value={index}>{bag.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  FOOD
                  <select value={selectedFoodIndex} onChange={(e) => setSelectedFoodIndex(Number(e.target.value))}>
                    {FOOD_OPTIONS.map((food, index) => (
                      <option key={food.name} value={index}>{food.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.mountResult}>
                <img src={getItemImageUrl(selectedMount.itemId)} className={styles.groupImg} alt="" />
                <div>
                  <span>{selectedMount.name}</span>
                  <strong>{transportCapacity.toLocaleString(localeCode, { maximumFractionDigits: 0 })} KG</strong>
                </div>
                <div className={styles.tripsBadge}>
                  {transportTrips || 0} {locale === 'es' ? 'VIAJES' : 'TRIPS'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={resumenRef} className={styles.anchorSection}>
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
                {formatSignedUnroundedValue(journalSummary.profit, localeCode)}
              </strong>
            </div>
            {journalSummary.details.map((journal) => (
              <div key={journal.id} className={styles.journalSummaryLine}>
                <span>
                  {journal.exactQuantity.toLocaleString(localeCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x {getJournalDisplayName('', journal.type, locale)} / {getJournalWorkerName(journal.type, locale)} T{journal.tier}
                </span>
                <strong className={journal.calculatedProfit >= 0 ? styles.green : styles.red}>
                  {formatSignedUnroundedValue(journal.calculatedProfit, localeCode)}
                </strong>
              </div>
            ))}
            <p className={styles.note}>{t(locale, 'journalSessionNote')}</p>
          </div>

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
              <div className={styles.finalValue}>{formatExactValue(totalExtraInvestment, localeCode)}</div>
            </div>

            <div className={styles.finalRow}>
              <div className={styles.finalLeft}>
                <LineChart size={24} color="#4f8f38" />
                <div className={styles.finalLabel}>{t(locale, 'totalProfit')}</div>
              </div>
              <div className={`${styles.finalValue} ${totalNetProfit >= 0 ? styles.green : styles.red}`}>
                {formatSignedUnroundedValue(totalNetProfit, localeCode)}
              </div>
            </div>

            <div className={styles.finalRow}>
              <div className={styles.finalLeft}>
                <CheckSquare size={24} color="#a06f11" />
                <div className={styles.finalLabel}>{t(locale, 'totalSaleValue')}</div>
              </div>
              <div className={`${styles.finalValue} ${styles.gold}`}>{formatExactValue(totalSaleValue, localeCode)}</div>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && <AddCraftModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
