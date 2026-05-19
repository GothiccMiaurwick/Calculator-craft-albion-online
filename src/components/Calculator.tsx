'use client';

import { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import { useApp } from '@/lib/AppContext';
import { TIERS, ENCHANTS, CITIES, SERVERS, getItemImageUrl, CATEGORIES, normalizeId } from '@/lib/items';
import { fetchPrices, fetchItemMaterials } from '@/lib/api';
import { calculateCrafting, isArtifactLikeMaterial, resolvePrice, getResourceField } from '@/lib/calcEngine';
import { getAdjustedFocusCost, getCraftingSpecBonus, getExpectedSalePriceFromQualities, type QualityPriceMap } from '@/lib/craftingSpecs';
import { getFallbackRecipe } from '@/lib/fallbacks';
import { getCategoryNameById, getDisplayLocale, getItemName, getMaterialName, getServerName, getTreeItemName, t } from '@/lib/i18n';
import { Trophy, Filter, Target, Zap, ChevronDown, Wind } from 'lucide-react';
import styles from './Calculator.module.css';
import AddCraftModal from './AddCraftModal';

// --- Formatting Helpers ---
const formatNumber = (val: number, localeCode: string, decimals = 0) => {
  if (!val && val !== 0) return '';
  return val.toLocaleString(localeCode, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Precision helpers — DISPLAY ONLY, never used inside calculations
const round2 = (n: number) => Number(n.toFixed(2));

type ReturnRateMode = 'city' | 'cityFocus' | 'hideout';

const DAILY_BONUSES = [0, 10, 20];
const HIDEOUT_QUALITIES = [1, 2, 3, 4, 5, 6];
const HIDEOUT_POWERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const HIDEOUT_RETURN_RATES: Record<number, Record<number, number>> = {
  1: { 1: 1, 2: 9.71, 3: 16.32, 4: 21.41, 5: 25.37, 6: 28.44, 7: 31.27, 8: 33.44, 9: 36.31 },
  2: { 1: 5.66, 2: 13.61, 3: 19.68, 4: 24.39, 5: 28.06, 6: 30.92, 7: 33.55, 8: 35.59, 9: 38.27 },
  3: { 1: 9.91, 2: 17.18, 3: 22.78, 4: 27.14, 5: 30.56, 6: 33.22, 7: 35.69, 8: 37.6, 9: 40.12 },
  4: { 1: 13.79, 2: 20.48, 3: 25.65, 4: 29.7, 5: 32.89, 6: 35.38, 7: 37.69, 8: 39.49, 9: 41.86 },
  5: { 1: 17.36, 2: 23.52, 3: 28.32, 4: 32.09, 5: 35.06, 6: 37.4, 7: 39.58, 8: 41.26, 9: 43.5 },
  6: { 1: 20.63, 2: 26.34, 3: 30.8, 4: 34.32, 5: 37.11, 6: 39.3, 7: 41.35, 8: 42.94, 9: 45.05 },
};
const HIDEOUT_FOCUS_RETURN_RATES: Record<number, Record<number, number>> = {
  1: { 1: 37.5, 2: 41.09, 3: 43.98, 4: 46.31, 5: 48.19, 6: 49.69, 7: 51.1, 8: 52.21, 9: 53.7 },
  2: { 1: 39.39, 2: 42.78, 3: 45.5, 4: 47.71, 5: 49.39, 6: 50.92, 7: 52.27, 8: 53.33, 9: 54.75 },
  3: { 1: 41.18, 2: 44.37, 3: 46.95, 4: 49.04, 5: 50.74, 6: 52.1, 7: 53.38, 8: 54.39, 9: 55.75 },
  4: { 1: 42.86, 2: 45.87, 3: 48.32, 4: 50.31, 5: 51.92, 6: 53.22, 7: 54.44, 8: 55.41, 9: 56.71 },
  5: { 1: 44.44, 2: 47.3, 3: 49.62, 4: 51.52, 5: 53.05, 6: 54.29, 7: 55.46, 8: 56.38, 9: 57.63 },
  6: { 1: 45.95, 2: 48.65, 3: 50.86, 4: 52.66, 5: 54.13, 6: 55.31, 7: 56.43, 8: 57.31, 9: 58.51 },
};

function applyDailyBonus(returnRate: number, dailyBonus: number) {
  if (dailyBonus === 0) return returnRate;
  const efficiency = (returnRate / (100 - returnRate)) * 100 + dailyBonus;
  return Number(((efficiency / (100 + efficiency)) * 100).toFixed(2));
}

function getHideoutReturnRate(quality: number, power: number, hideoutFocus: boolean, dailyBonus: number) {
  const table = hideoutFocus ? HIDEOUT_FOCUS_RETURN_RATES : HIDEOUT_RETURN_RATES;
  return applyDailyBonus(table[quality]?.[power] ?? 24.8, dailyBonus);
}

function getConfiguredReturnRate(mode: ReturnRateMode, quality: number, power: number, hideoutFocus: boolean, dailyBonus: number) {
  if (mode === 'cityFocus') return applyDailyBonus(47.9, dailyBonus);
  if (mode === 'hideout') return getHideoutReturnRate(quality, power, hideoutFocus, dailyBonus);
  return applyDailyBonus(24.8, dailyBonus);
}
// --- Local Database Pricing: delegated to calcEngine.ts ---
// resolvePrice(id, resources) is imported from '@/lib/calcEngine'

// --- Custom Hook for Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Custom Hook for Number Animations ---
// easeOutQuart: fast start, smooth deceleration — more premium feel than cubic.
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function useAnimatedNumber(target: number, duration = 400) {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  const startValueRef = useRef(target);
  // useRef so the frame ID persists across renders and can be cancelled reliably.
  // A plain `let` would reset on every render, making cancelAnimationFrame a no-op.
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === prevTarget.current) return;

    // Cancel any in-flight animation before starting a new one.
    // This prevents overlapping animations, jitter, and race conditions.
    cancelAnimationFrame(frameRef.current);

    // Snapshot the current display value as the start point once.
    // `value` is intentionally NOT in the deps array — adding it would
    // cause every intermediate frame to re-trigger this effect (drift/accumulation).
    startValueRef.current = value;
    prevTarget.current = target;

    const endValue = target;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setValue(startValueRef.current + (endValue - startValueRef.current) * easeOutQuart(progress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]); // `value` intentionally excluded — see comment above

  return value;
}

// --- Formatted Input Component ---
interface FormattedInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

// memo: prevents re-render when parent state (returnRate, tier, etc.) changes
// but this input's own `value` and `onChange` props are identical.
const FormattedInput = memo(function FormattedInput({ value, onChange, className, style }: FormattedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState('');

  // When value changes from parent (e.g. database change), update local if not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatNumber(value, 'es-CO'));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number without dots for editing
    setLocalValue(value === 0 ? '' : value.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow digits for raw entry
    if (val === '' || /^\d+$/.test(val)) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseInt(localValue, 10) || 0;
    // Flush to parent ONLY on blur
    onChange(num);
    // Reformat local value
    setLocalValue(formatNumber(num, 'es-CO'));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      className={className}
      style={style}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
});

/**
 * Speculative Price ID Collector
 * Gathers the current item and its materials for a single parallel fetch.
 */
const getInitialMarketIds = (itemId: string, tier: number, enchant: number) => {
  const fallbackMats = getFallbackRecipe(itemId);
  return Array.from(new Set([itemId, ...fallbackMats.map(m => m.id)]));
};

export default function Calculator() {
  const {
    selectedItem,
    setSelectedItem,
    selectedTreeItem,
    server,
    setServer,
    resources,
    artifactPrices,
    specs,
    calculatorPreferences,
    setCalculatorPreferences,
  } = useApp();
  const locale = calculatorPreferences.locale;
  const localeCode = getDisplayLocale(locale);
  const [tier, setTier] = useState(4);
  const [enchant, setEnchant] = useState(0);
  const [tax, setTax] = useState(calculatorPreferences.tax);
  const [blackMarket, setBlackMarket] = useState(calculatorPreferences.blackMarket);
  const [usePremium, setUsePremium] = useState(calculatorPreferences.usePremium);
  const [returnRate, setReturnRate] = useState(calculatorPreferences.returnRate);
  const [returnRateMode, setReturnRateMode] = useState<ReturnRateMode>(calculatorPreferences.returnRateMode ?? 'city');
  const [hideoutQuality, setHideoutQuality] = useState(calculatorPreferences.hideoutQuality ?? 5);
  const [hideoutPower, setHideoutPower] = useState(calculatorPreferences.hideoutPower ?? 5);
  const [hideoutFocus, setHideoutFocus] = useState(calculatorPreferences.hideoutFocus ?? false);
  const [dailyBonus, setDailyBonus] = useState(calculatorPreferences.dailyBonus ?? 0);
  const [useFocus, setUseFocus] = useState(calculatorPreferences.useFocus);
  const [efficiencyRr, setEfficiencyRr] = useState(52.7);
  const [minMargin, setMinMargin] = useState(30);

  // 16ms ≈ 1 frame — main card feels instant, heavy bestCrafts memo still batched.
  const debouncedReturnRate = useDebounce(returnRate, 16);
  const debouncedEfficiencyRr = useDebounce(efficiencyRr, 16);

  const { 
    itemOverrides, setItemOverrides,
    allManualSellPrices, setAllManualSellPrices,
    allMarketPrices, setAllMarketPrices,
    allMarketQualityPrices, setAllMarketQualityPrices,
    setResources, setArtifactPrices
  } = useApp();
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);


  // Dynamic Materials State
  const [currentMats, setCurrentMats] = useState<any[]>([]);

  const handleMaterialPriceChange = useCallback((matId: string, val: number) => {
    const normId = normalizeId(matId);
    
    if (isArtifactLikeMaterial(normId)) {
      setArtifactPrices(prev => ({
        ...prev,
        [normId]: val
      }));
    } else {
      const field = getResourceField(normId);
      if (field) {
        const parts = normId.split('_');
        const tierPrefix = parts[0]; // e.g. "T5"
        let enchant = 0;
        if (normId.includes('@')) enchant = parseInt(normId.split('@')[1], 10) || 0;
        const targetTier = `${tierPrefix}.${enchant}`; // e.g. "T5.1"
        
        setResources(prev => prev.map(row => {
          if (row.tier === targetTier) {
            return { ...row, [field]: val };
          }
          return row;
        }));
      }
    }

    // Keep itemOverrides to avoid breaking any other local logic, though redundant now
    if (selectedItem) {
      setItemOverrides(prev => ({
        ...prev,
        [selectedItem.id]: {
          ...(prev[selectedItem.id] || {}),
          [matId]: val
        }
      }));
    }
  }, [setArtifactPrices, setResources, setItemOverrides, selectedItem]);
  const commitFocusedInput = () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  };

  const handlePlannerItemAdded = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // SPECULATIVE HYDRATION: Populate fallback mats instantly when selection changes
  useEffect(() => {
    if (selectedItem) {
      setCurrentMats(getFallbackRecipe(selectedItem.id));
    }
  }, [selectedItem?.id]);

  const fetchData = useCallback(async () => {
    if (!selectedItem || !selectedTreeItem) return;
    
    // NOT set global loading=true at the start to prevent blocking local price rendering

    try {
      const initialIds = getInitialMarketIds(selectedItem.id, tier, enchant);
      
      const [apiMaterials, marketData] = await Promise.all([
        fetchItemMaterials(selectedItem.id),
        fetchPrices(initialIds, server, CITIES)
      ]);

      let extraMarketData: Awaited<ReturnType<typeof fetchPrices>> = [];
      if (apiMaterials && apiMaterials.length > 0) {
        setCurrentMats(apiMaterials);
        const missingIds = Array.from(
          new Set(
            apiMaterials
              .map((mat) => mat.id)
              .filter((id) => !initialIds.includes(id))
          )
        );

        if (missingIds.length > 0) {
          extraMarketData = await fetchPrices(missingIds, server, CITIES);
        }
      }
      
      const mergedMarketData = [...(marketData || []), ...(extraMarketData || [])];

      if (mergedMarketData.length > 0) {
        const marketMap = mergedMarketData.reduce<Record<string, number>>((acc, row) => {
          if (row.quality !== 1) return acc;
          const candidate = row.sell_price_min || row.buy_price_max || 0;
          const current = acc[row.item_id] ?? 0;
          if (candidate > current) {
            acc[row.item_id] = candidate;
          }
          return acc;
        }, {});

        const qualityMarketMap = mergedMarketData.reduce<Record<string, QualityPriceMap>>((acc, row) => {
          const candidate = row.sell_price_min || row.buy_price_max || 0;
          if (candidate <= 0 || row.quality < 1 || row.quality > 5) return acc;

          const qualityKey = row.quality as 1 | 2 | 3 | 4 | 5;
          const itemMap = acc[row.item_id] ?? {};
          const current = itemMap[qualityKey] ?? 0;
          if (candidate > current) {
            itemMap[qualityKey] = candidate;
          }
          acc[row.item_id] = itemMap;
          return acc;
        }, {});

        setAllMarketPrices(prev => ({ ...prev, ...marketMap }));
        setAllMarketQualityPrices(prev => ({ ...prev, ...(qualityMarketMap as any) }));
      }
    } catch (error) {
      console.error("Fetch Data Failed:", error);
    }
  }, [selectedItem, selectedTreeItem, server, tier, enchant]);

  const handleTierChange = (t: number) => {
    commitFocusedInput();
    setTier(t);
    if (selectedTreeItem) {
      const item = selectedTreeItem.tiers[t][enchant];
      setSelectedItem(item);
    }
  };

  const handleEnchantChange = (e: number) => {
    commitFocusedInput();
    setEnchant(e);
    if (selectedTreeItem) {
      const item = selectedTreeItem.tiers[tier][e];
      setSelectedItem(item);
    }
  };

  useEffect(() => {
    if (selectedTreeItem) {
      setTier(4);
      setEnchant(0);
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCalculatorPreferences(prev => ({
      ...prev,
      tax,
      usePremium,
      returnRate,
      returnRateMode,
      hideoutQuality,
      hideoutPower,
      hideoutFocus,
      dailyBonus,
      useFocus,
      blackMarket,
    }));
  }, [tax, usePremium, returnRate, returnRateMode, hideoutQuality, hideoutPower, hideoutFocus, dailyBonus, useFocus, blackMarket, setCalculatorPreferences]);

  useEffect(() => {
    const nextRate = getConfiguredReturnRate(returnRateMode, hideoutQuality, hideoutPower, hideoutFocus, dailyBonus);
    setReturnRate(round2(nextRate));
    setUseFocus(returnRateMode === 'cityFocus' || (returnRateMode === 'hideout' && hideoutFocus));
  }, [returnRateMode, hideoutQuality, hideoutPower, hideoutFocus, dailyBonus]);

  const effectiveMarketSellPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return getExpectedSalePriceFromQualities(
      selectedItem,
      specs,
      allMarketQualityPrices[selectedItem.id],
      allMarketPrices[selectedItem.id] ?? 0,
    );
  }, [selectedItem, specs, allMarketQualityPrices, allMarketPrices]);

  useEffect(() => {
    if (!selectedItem) return;

    const persisted = allManualSellPrices[selectedItem.id];
    if (typeof persisted === 'number') {
      setSellPrice(persisted);
      return;
    }

    setSellPrice(0);
  }, [selectedItem?.id, allManualSellPrices, effectiveMarketSellPrice]);

  const results = useMemo(() => {
    if (!selectedItem || currentMats.length === 0) {
      return { 
        investment: 0, 
        profit: 0, 
        margin: 0, 
        valorActualTotal: 0,
        totalCost: 0, 
        returnValue: 0, 
        resultsTax: 0 
      };
    }

    const overrides = itemOverrides[selectedItem.id] || {};
    const calc = calculateCrafting({
      materials:      currentMats,
      resources,
      artifactPrices,
      priceOverrides: overrides,
      marketPrices:   allMarketPrices,
      salePrice:      Number(sellPrice) || 0,
      returnRate:     Number(returnRate),
      taxRate:        Number(tax),
    });

    return { 
      investment:       calc.inversion, 
      profit:           calc.gananciaNeta, 
      margin:           calc.margenGanancia,
      totalCost:        calc.rawTotalCost, 
      returnValue:      calc.returnValue, 
      resultsTax:       calc.taxAmount 
    };
  }, [selectedItem, currentMats, resources, artifactPrices, itemOverrides, sellPrice, returnRate, tax]);

  const bestCrafts = useMemo(() => {
    if (!selectedItem) return [];

    return CATEGORIES
      .flatMap(c => c.subcategories)
      .find(s => s.id === selectedItem.subcategory)
      ?.items.map(tree => tree.tiers[tier][enchant])
      .map(item => {
        // Resolve sale price prioritizing manual entries (NULLISH COALESCING)
        const itemPrice =
          allManualSellPrices[item.id] ??
          getExpectedSalePriceFromQualities(item, specs, allMarketQualityPrices[item.id], allMarketPrices[item.id] ?? 0);
        
        if (itemPrice <= 0) return null;

        // Use Fallback Recipe for siblings to ensure consistency and speed
        const siblingMats = getFallbackRecipe(item.id);

        // Independent Row Calculation
        const overrides = itemOverrides[item.id] || {};
        const r = calculateCrafting({
          materials:  siblingMats,
          resources,
          artifactPrices,
          priceOverrides: overrides,
          marketPrices: allMarketPrices,
          salePrice:  itemPrice,
          returnRate: Number(debouncedReturnRate),
          taxRate:    Number(tax),
        });

        const rowMargin = Number(r.margenGanancia);
        const rowProfit = Number(r.gananciaNeta);
        const threshold = Number(minMargin);

        // AUDIT LOG
        if (item.id.includes('MACE')) {
          console.log("BEST_CRAFT_FILTER_AUDIT:", {
            id: item.id,
            manualPrice: allManualSellPrices[item.id],
            apiPrice: allMarketPrices[item.id],
            resolvedPrice: itemPrice,
            margin: rowMargin,
            threshold: threshold,
            passed: rowMargin >= threshold
          });
        }

        return { 
          item, 
          profit: rowProfit, 
          margin: rowMargin,
          isValid: r.inversion > 0
        };
      })
      .filter((a): a is any => a !== null && a.isValid)
      .filter(a => a.margin >= Number(minMargin))
      .sort((a, b) => b.profit - a.profit || b.margin - a.margin) || [];
  }, [selectedItem, resources, artifactPrices, itemOverrides, debouncedReturnRate, tier, enchant, allMarketPrices, allMarketQualityPrices, allManualSellPrices, tax, minMargin, specs]);

  const efficiencyAnalysis = useMemo(() => {
    if (!selectedItem) return [];

    // DYNAMIC BASELINE UTILITIES
    const getEff = (rr: number) => rr / (100 - rr);
    const fromEff = (eff: number) => (eff / (1 + eff)) * 100;
    
    // Derived Pairing
    let rrBase = debouncedEfficiencyRr;
    let rrFocus = fromEff(getEff(debouncedEfficiencyRr) + 0.6); // Target: ~50% bonus efficiency
    
    if (useFocus) {
      // If UI is in Focus Mode, the slider represents RR_focus
      rrFocus = debouncedEfficiencyRr;
      rrBase = fromEff(Math.max(0, getEff(debouncedEfficiencyRr) - 0.6));
    }

    return CATEGORIES
      .flatMap(c => c.subcategories)
      .find(s => s.id === selectedItem.subcategory)
      ?.items.map(tree => tree.tiers[tier][enchant])
      .map(item => {
        const itemPrice =
          allManualSellPrices[item.id] ??
          getExpectedSalePriceFromQualities(item, specs, allMarketQualityPrices[item.id], allMarketPrices[item.id] ?? 0);
        if (itemPrice <= 0) return null;

        const siblingMats = getFallbackRecipe(item.id);

        const overrides = itemOverrides[item.id] || {};

        // 1. Calculate Profit Without Focus
        const rBase = calculateCrafting({
          materials:  siblingMats,
          resources,
          artifactPrices,
          priceOverrides: overrides,
          marketPrices: allMarketPrices,
          salePrice:  itemPrice,
          returnRate: rrBase,
          taxRate:    Number(tax),
        });

        // 2. Calculate Profit With Focus
        const rFocus = calculateCrafting({
          materials:  siblingMats,
          resources,
          artifactPrices,
          priceOverrides: overrides,
          marketPrices: allMarketPrices,
          salePrice:  itemPrice,
          returnRate: rrFocus,
          taxRate:    Number(tax),
        });

        // 3. Efficiency Metrics
        const addedValue = rFocus.gananciaNeta - rBase.gananciaNeta;
        const focusCost = getAdjustedFocusCost(item, tier, enchant, specs);
        const silverPerFocus = addedValue / focusCost;

        return { 
          item, 
          efficiency: silverPerFocus, 
          profitDelta: addedValue,
          isValid: rFocus.inversion > 0
        };
      })
      .filter((a): a is any => a !== null && a.isValid)
      // RANKING: Silver per Focus Desc
      .sort((a, b) => b.efficiency - a.efficiency) || [];
  }, [selectedItem, resources, artifactPrices, itemOverrides, debouncedEfficiencyRr, useFocus, tier, enchant, allMarketPrices, allMarketQualityPrices, allManualSellPrices, tax, specs]);

  const { investment, profit, margin } = results;
  const isProfitable = profit > 0;
  const currentSpecBonus = selectedItem ? getCraftingSpecBonus(selectedItem, specs) : null;
  const currentFocusCost = selectedItem ? getAdjustedFocusCost(selectedItem, tier, enchant, specs) : 0;

  // Real-time animation hooks
  const animInvestment = useAnimatedNumber(investment);
  const animProfit = useAnimatedNumber(profit);
  const animMargin = useAnimatedNumber(margin);

  // Format Helpers
  const formatVal = (val: number, isProfit = false) => {
    const clean = round2(val);
    const absStr = formatNumber(Math.abs(clean), localeCode);
    if (isProfit && clean > 0) return `+${absStr}`;
    if (clean < 0) return `-${absStr}`;
    return absStr;
  };

  if (!selectedItem || !selectedTreeItem) {
    return null;
  }

  const currentCardState = profit > 0 ? styles.cardProfit : profit < 0 ? styles.cardLoss : '';
  const breadcrumb = `${getCategoryNameById(selectedItem.category, locale)} › ${getTreeItemName(selectedTreeItem, locale)}`;

  return (
    <>
    <div className={styles.wrapper}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.homeIcon}>🏠</span>
          <span className={styles.breadcrumb}>{breadcrumb}</span>
          <span className={styles.syncedBadge}><span className={styles.dot} /> {t(locale, 'synced')}</span>
        </div>
        <div className={styles.topRight}>
          <select
            className={styles.serverSelect}
            value={server}
            onChange={(e) => {
              commitFocusedInput();
              setServer(e.target.value as any);
            }}
          >
            {SERVERS.map((s) => <option key={s.id} value={s.id}>{getServerName(s.id, locale)}</option>)}
          </select>
          <button 
            className={`${styles.addPlanBtn} ${saved ? styles.addPlanSaved : ''}`}
            onClick={() => {
              commitFocusedInput();
              setShowAddModal(true);
            }}
          >
            {saved ? `✓ ${t(locale, 'added')}` : `+ ${t(locale, 'addToPlanner')}`}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── Left Column ── */}
        <div className={styles.leftCol}>
          <div className={styles.tierRow}>
            <span className={styles.selectorLabel}>{t(locale, 'tier')}</span>
            {TIERS.map((t) => (
              <button
                key={t}
                className={`${styles.pill} ${tier === t ? styles.pillActive : ''}`}
                onClick={() => handleTierChange(t)}
              >{t}</button>
            ))}
            <span className={styles.selectorLabel} style={{ marginLeft: '1rem' }}>{t(locale, 'enchant')}</span>
            {ENCHANTS.map((e) => (
              <button
                key={e}
                className={`${styles.pill} ${enchant === e ? styles.pillActive : ''}`}
                onClick={() => handleEnchantChange(e)}
              >{e}</button>
            ))}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>⚡ {t(locale, 'crafting')}</span>
              <button
                type="button"
                className={`${styles.marketToggle} ${blackMarket ? styles.marketToggleActive : ''}`}
                onClick={() => setBlackMarket(prev => !prev)}
              >
                <span className={styles.marketToggleDot} />
                <span>{t(locale, 'blackMarket')}</span>
              </button>
            </div>

            <div className={styles.craftingGrid}>
              {/* Columna Izquierda: Materiales y Precio de Venta */}
              <div className={styles.materialsCol}>
                {(() => {
                  const { matBlock, matLabel, matBadge, matInput, overrideYellow } = styles;
                                    
                  // RENDER ONLY DYNAMIC MATERIALS
                  return currentMats.filter(m => !isArtifactLikeMaterial(m.id)).map((mat) => {
                    const itemOvr = itemOverrides[selectedItem.id] || {};
                    const isOverridden = itemOvr[mat.id] !== undefined;
                    const overrides = itemOverrides[selectedItem.id] || {};
                    const unitPrice = overrides[mat.id] !== undefined ? Number(overrides[mat.id]) || 0 : resolvePrice(mat.id, resources, artifactPrices, {}, allMarketPrices);
                    
                    const totalPerMat = unitPrice * mat.quantity;
                    
                    return (
                      <div key={mat.id} className={matBlock}>
                        <div className={matLabel}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <span>{getMaterialName(mat.id, locale)} <span className={matBadge}>×{mat.quantity}</span></span>
                            <span style={{ fontSize: '11px', color: '#fc97b7', fontWeight: 'bold' }}>
                              → {formatNumber(totalPerMat, localeCode)}
                            </span>
                          </div>
                        </div>
                        <FormattedInput
                          className={`${matInput} ${isOverridden ? overrideYellow : ''}`}
                          value={unitPrice}
                          onChange={(val) => handleMaterialPriceChange(mat.id, val)}
                        />
                      </div>
                    );
                  });
                })()}

                <div className={styles.matBlock}>
                <div className={styles.matLabel}>
                  <span>{t(locale, 'salePrice')}</span>
                  <span className={styles.matBadge}>$</span>
                </div>
                <FormattedInput
                    className={styles.matInput}
                    value={sellPrice || 0}
                    onChange={(val) => {
                      setSellPrice(val);
                      if (selectedItem) {
                        setAllManualSellPrices(prev => ({ ...prev, [selectedItem.id]: val }));
                      }
                    }}
                  />
                  {selectedItem && !(allManualSellPrices[selectedItem.id] > 0) && currentSpecBonus && (
                    <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.7 }}>
                      {locale === 'es'
                        ? `Precio esperado por calidad/spec: ${formatNumber(effectiveMarketSellPrice, localeCode)}`
                        : `Expected quality/spec price: ${formatNumber(effectiveMarketSellPrice, localeCode)}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Artefacto (Si lo hay) */}
              {currentMats.some(m => isArtifactLikeMaterial(m.id)) && (
                <div className={styles.artifactCol}>
                  {(() => {
                                        const { matBlock, matBlockArtifact, matLabel, matBadge, matInput, overrideYellow } = styles;

                    return currentMats.filter(m => isArtifactLikeMaterial(m.id)).map((mat) => {
                      const itemOvr = itemOverrides[selectedItem.id] || {};
                      const isOverridden = itemOvr[mat.id] !== undefined;
                      const overrides = itemOverrides[selectedItem.id] || {};
                      const unitPrice = overrides[mat.id] !== undefined ? Number(overrides[mat.id]) || 0 : resolvePrice(mat.id, resources, artifactPrices, {}, allMarketPrices);
                      const totalPerMat = unitPrice * mat.quantity;
                      
                      return (
                        <div key={mat.id} className={`${matBlock} ${matBlockArtifact}`}>
                          <div className={matLabel}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <span style={{ color: '#ffd700' }}>{getMaterialName(mat.id, locale)} <span className={matBadge}>×{mat.quantity}</span></span>
                              <span style={{ fontSize: '11px', color: '#ffd700', fontWeight: 'bold' }}>
                                → {formatNumber(totalPerMat, localeCode)}
                              </span>
                            </div>
                          </div>
                          <FormattedInput
                            className={`${matInput} ${isOverridden ? overrideYellow : ''}`}
                            value={unitPrice}
                            style={{ color: isOverridden ? '#fbbf24' : '#ffd700' }}
                            onChange={(val) => handleMaterialPriceChange(mat.id, val)}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            <div className={styles.taxRow}>
              <button
                className={`${styles.taxBtn} ${usePremium ? styles.taxActive : ''}`}
                onClick={() => {
                  setUsePremium(true);
                  setTax(6.5);
                }}
              >{t(locale, 'taxWithPremium')} · 6.5%</button>
              <button
                className={`${styles.taxBtn} ${!usePremium ? styles.taxActive : ''}`}
                onClick={() => {
                  setUsePremium(false);
                  setTax(10.5);
                }}
              >{t(locale, 'taxWithoutPremium')} · 10.5%</button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.optHeaderLeft}>
                <Wind size={14} color="#fc97b7" />
                <span className={styles.cardTitle}>{t(locale, 'returnRate')}</span>
              </div>
              <div className={styles.optHeaderRight}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <div className={styles.optSliderValue}>{returnRate.toFixed(1)} <span style={{ opacity: 0.5 }}>%</span></div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    {useFocus
                      ? `${t(locale, 'focus')}: ${formatNumber(currentFocusCost, localeCode, 1)}`
                      : `${t(locale, 'focus')}: 0`}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.focusToggleCenter}>
              <button
                className={`${styles.focusBtn} ${returnRateMode === 'city' ? styles.focusBtnActive : ''}`}
                onClick={() => setReturnRateMode('city')}
              >{t(locale, 'cityWithoutFocus')}</button>
              <button
                className={`${styles.focusBtn} ${returnRateMode === 'cityFocus' ? styles.focusBtnActive : ''}`}
                onClick={() => setReturnRateMode('cityFocus')}
              >{t(locale, 'cityWithFocus')}</button>
              <button
                className={`${styles.focusBtn} ${returnRateMode === 'hideout' ? styles.focusBtnActive : ''}`}
                onClick={() => setReturnRateMode('hideout')}
              >HIDEOUT</button>
            </div>

            {returnRateMode === 'hideout' && (
              <div className={styles.hideoutPanel}>
                <div className={styles.hideoutRow}>
                  <span className={styles.optLabel}>QUALITY</span>
                  <div className={styles.hideoutPills}>
                    {HIDEOUT_QUALITIES.map((quality) => (
                      <button
                        key={quality}
                        className={`${styles.miniPill} ${hideoutQuality === quality ? styles.miniPillActive : ''}`}
                        onClick={() => setHideoutQuality(quality)}
                      >
                        Q{quality}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.hideoutRow}>
                  <span className={styles.optLabel}>POWER</span>
                  <div className={styles.hideoutPills}>
                    {HIDEOUT_POWERS.map((power) => (
                      <button
                        key={power}
                        className={`${styles.miniPill} ${hideoutPower === power ? styles.miniPillActive : ''}`}
                        onClick={() => setHideoutPower(power)}
                      >
                        {power}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.hideoutRow}>
                  <span className={styles.optLabel}>{t(locale, 'focus')}</span>
                  <button
                    className={`${styles.miniPill} ${hideoutFocus ? styles.miniPillActive : ''}`}
                    onClick={() => setHideoutFocus(prev => !prev)}
                  >
                    {hideoutFocus ? t(locale, 'on') : t(locale, 'off')}
                  </button>
                </div>
              </div>
            )}

            <div className={styles.dailyBonusRow}>
              <span className={styles.optLabel}>DAILY BONUS</span>
              <div className={styles.hideoutPills}>
                {DAILY_BONUSES.map((bonus) => (
                  <button
                    key={bonus}
                    className={`${styles.miniPill} ${dailyBonus === bonus ? styles.miniPillActive : ''}`}
                    onClick={() => setDailyBonus(bonus)}
                  >
                    {bonus === 0 ? 'NONE' : `+${bonus}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sliderContainer}>
              <input
                type="range"
                className={styles.slider}
                min={24.8}
                max={62}
                step={0.1}
                value={returnRate}
                onChange={(e) => {
                  setReturnRate(parseFloat(e.target.value));
                  setReturnRateMode('hideout');
                }}
              />
              <div className={styles.sliderLabels}>
                <span>1%</span>
                <span>20%</span>
                <span>40%</span>
                <span>62%</span>
              </div>
            </div>

            {currentSpecBonus && (
              <div style={{ marginTop: '0.9rem', fontSize: '11px', opacity: 0.75 }}>
                {locale === 'es'
                  ? `Spec general: ${currentSpecBonus.generalLevel} · spec subrama total: ${currentSpecBonus.sharedItemLevels} · eficiencia total de foco: ${formatNumber(currentSpecBonus.totalFocusEfficiency, localeCode)}`
                  : `General spec: ${currentSpecBonus.generalLevel} · branch spec total: ${currentSpecBonus.sharedItemLevels} · total focus efficiency: ${formatNumber(currentSpecBonus.totalFocusEfficiency, localeCode)}`}
              </div>
            )}
          </div>

          {/* ── Section: Mejores para Craftear ── */}
          <div className={styles.optCard}>
            <div className={styles.optHeader}>
              <div className={styles.optHeaderLeft}>
                <Trophy size={14} />
                <span className={styles.optTitle}>{t(locale, 'bestToCraft')}: {getTreeItemName(selectedTreeItem, locale).toUpperCase()}</span>
              </div>
              <div className={styles.optHeaderRight}>
                <span className={styles.optLabel}>{t(locale, 'minimumMargin', { value: minMargin })}</span>
                <div className={styles.optBadge}>{locale === 'es' ? 'FILTRO: T7+' : 'FILTER: T7+'}</div>
              </div>
            </div>
            
            <div className={styles.optBody}>
              {bestCrafts.length > 0 ? (
                <div className={styles.resList}>
                  {bestCrafts.map((res, i) => (
                    <div
                      key={res.item.id}
                      className={styles.resRow}
                      onClick={() => {
                        commitFocusedInput();
                        setSelectedItem(res.item);
                      }}
                    >
                      <div className={styles.resInfo}>
                        <img 
                          src={getItemImageUrl(res.item.id)} 
                          className={styles.resImg} 
                          alt="" 
                          onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                        />
                        <div className={styles.resNameContainer}>
                          <span className={styles.resName}>{getItemName(res.item, locale)}</span>
                          <span className={styles.resRank}>{t(locale, 'rank', { value: i + 1 })}</span>
                        </div>
                      </div>
                      <div className={styles.resStats}>
                        <span className={res.margin > 0 ? styles.green : styles.red}>{formatNumber(res.margin, localeCode, 1)}% <span style={{ opacity: 0.5, fontSize: '9px' }}>{t(locale, 'margin')}</span></span>
                        <span className={styles.resProfit}>{formatNumber(res.profit, localeCode)} <span style={{ opacity: 0.5 }}>S</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyStateContainer}>
                  <Filter size={32} className={styles.emptyIcon} />
                  <div className={styles.emptyText}>{t(locale, 'noResultsOverMargin', { value: minMargin })}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Section: Eficiencia por Foco ── */}
          <div className={styles.optCard}>
            <div className={styles.optHeader}>
              <div className={styles.optHeaderLeft}>
                <Target size={14} />
                <span className={styles.optTitle}>{t(locale, 'focusEfficiency')}: {getTreeItemName(selectedTreeItem, locale).toUpperCase()}</span>
              </div>
              <div className={styles.optHeaderRight}>
                  <button 
                    className={styles.btnRecalcular} 
                    onClick={() => fetchData()}
                    disabled={loading}
                  >
                    {loading ? t(locale, 'loading') : t(locale, 'recalculate')}
                  </button>
                  <div className={styles.optBadge} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {t(locale, 'silverPerFocus')} <ChevronDown size={10} />
                  </div>
              </div>
            </div>

            {/* Slider Tasa de Retorno */}
            <div className={styles.optSliderRow}>
              <span className={styles.optLabel}>{t(locale, 'returnRate')}</span>
              <input 
                type="range" 
                min="20" 
                max="60" 
                step="0.1" 
                value={efficiencyRr}
                onChange={(e) => setEfficiencyRr(parseFloat(e.target.value))}
                className={styles.slider} 
              />
              <div className={styles.optSliderValue}>{efficiencyRr.toFixed(1)} <span style={{ opacity: 0.5 }}>%</span></div>
            </div>
            
            <div className={styles.optBody}>
              {efficiencyAnalysis.length > 0 ? (
                <div className={styles.resList}>
                  {efficiencyAnalysis.map((res, i) => (
                    <div
                      key={res.item.id}
                      className={styles.resRow}
                      onClick={() => {
                        commitFocusedInput();
                        setSelectedItem(res.item);
                      }}
                    >
                      <div className={styles.resInfo}>
                        <img 
                          src={getItemImageUrl(res.item.id)} 
                          className={styles.resImg} 
                          alt="" 
                          onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                        />
                        <div className={styles.resNameContainer}>
                          <span className={styles.resName}>{getItemName(res.item, locale)}</span>
                          <span className={styles.resRank}>{t(locale, 'rank', { value: i + 1 })}</span>
                        </div>
                      </div>
                      <div className={styles.resStats}>
                        <span className={styles.resEffVal}>{formatNumber(res.efficiency, localeCode, 1)} <span style={{ opacity: 0.5, fontSize: '10px' }}>{t(locale, 'silverPerFocus')}</span></span>
                        <span className={styles.resDeltaBadge}>+{formatNumber(res.profitDelta, localeCode)} {locale === 'es' ? 'EXTRA' : 'EXTRA'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyStateContainer}>
                  <Zap size={32} className={styles.emptyIcon} />
                  <div className={styles.emptyText}>{t(locale, 'noProfitableCombinations')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className={styles.rightPanel}>
          <div className={`${styles.statCard} ${currentCardState}`}>
            {/* Image Section (Top) */}
            <div className={styles.itemImgHeader}>
              <img
                src={getItemImageUrl(selectedItem.id)}
                alt={getTreeItemName(selectedTreeItem, locale)}
                className={styles.itemImg}
                onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
              />
            </div>

            {/* Stats Section (Bottom) */}
            <div className={styles.statLabel}>{t(locale, 'investment')}</div>
            <div
              key={Math.round(investment)}
              className={`${styles.statValue} ${styles.cyan} ${styles.statAnimate}`}
            >
              {formatVal(animInvestment)}
            </div>

            <div className={styles.statDivider} />
            
            <div className={styles.statLabel}>{t(locale, 'netProfit')}</div>
            <div
              key={`p${Math.round(profit)}`}
              className={`${styles.statValue} ${isProfitable ? styles.green : styles.red} ${styles.statAnimate}`}
            >
              {formatVal(animProfit, true)}
            </div>

            <div className={styles.statDivider} />
            
            <div className={styles.statLabel}>{t(locale, 'profitMargin')}</div>
            <div
              key={`m${Math.round(margin * 10)}`}
              className={`${styles.statValue} ${styles.statSmall} ${isProfitable ? styles.green : styles.red} ${styles.statAnimate}`}
            >
              {formatNumber(animMargin, localeCode, 1)}%
            </div>

            {/* Progress Bar (Full Width Bottom) */}
            <div className={styles.marginBar}>
              <div
                className={`${styles.marginFill} ${isProfitable ? styles.marginGreen : styles.marginRed}`}
                style={{ width: `${Math.min(Math.abs(animMargin), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
      {showAddModal && (
        <AddCraftModal
          onClose={() => setShowAddModal(false)}
          initialTreeItem={selectedTreeItem}
          initialTier={tier}
          initialEnchant={enchant}
          initialSalePrice={sellPrice}
          initialMaterialsSnapshot={currentMats}
          initialMaterialPricesSnapshot={currentMats.reduce<Record<string, number>>((acc, mat) => {
            const overrides = selectedItem ? itemOverrides[selectedItem.id] || {} : {};
            acc[mat.id] = overrides[mat.id] !== undefined ? Number(overrides[mat.id]) || 0 : resolvePrice(mat.id, resources, artifactPrices, {}, allMarketPrices);
            return acc;
          }, {})}
          onAdded={handlePlannerItemAdded}
        />
      )}
    </>
  );
}
