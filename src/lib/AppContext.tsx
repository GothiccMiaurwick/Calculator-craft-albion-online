'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlbionItem, TreeItem, Server } from '@/lib/items';
import { getFallbackRecipe } from '@/lib/fallbacks';
import type { Locale } from '@/lib/i18n';

export interface PlannerMaterialSnapshot {
  id: string;
  quantity: number;
}

export type PlannerPriceSnapshot = Record<string, number>;

export interface PlannerItem {
  id: string;
  item: AlbionItem;
  quantity: number;
  tier: number;
  enchant: number;
  salePriceSnapshot: number;
  returnRate: number;
  useFocus: boolean;
  blackMarket: boolean;
  taxRate: number;
  materialsSnapshot: PlannerMaterialSnapshot[];
  materialPricesSnapshot: PlannerPriceSnapshot;
  isDone: boolean;
}

export type QualityPriceMap = Record<number, number>;

export interface CalculatorPreferences {
  tax: number;
  usePremium: boolean;
  returnRate: number;
  returnRateMode: 'city' | 'cityFocus' | 'hideout';
  hideoutQuality: number;
  hideoutPower: number;
  hideoutFocus: boolean;
  dailyBonus: number;
  useFocus: boolean;
  blackMarket: boolean;
  locale: Locale;
}

export type AppView = 'calculator' | 'planner' | 'refiner' | 'enchanter' | 'cooking';

export type ResourceRow = {
  tier: string;
  tela: number;
  lingote: number;
  tablas: number;
  cuero: number;
};

export type JournalRow = { tier: string; buy: number; sell: number };
export type JournalType = { name: string; subtitle: string; icon: string; rows: JournalRow[] };

export interface ArtifactPrice {
  id: string;
  name: string;
  tier: number;
  category: string;
  price: number;
}

const MARKET_PRICES_KEY = 'albion_market_prices_v2';

const STORAGE_KEYS = {
  planner: 'planner_items',
  resources: 'manual_resources_v2_albion_printer_match',
  journals: 'manual_journals_v2_albion_printer_match',
  specs: 'manual_specs',
  artifacts: 'manual_artifacts',
  calculatorPrefs: 'calculator_preferences',
  sidebarCollapsed: 'sidebar_collapsed',
} as const;

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizePlannerItems(items: PlannerItem[]): PlannerItem[] {
  return items.map((item) => ({
    ...item,
    salePriceSnapshot: typeof item.salePriceSnapshot === 'number' ? item.salePriceSnapshot : 0,
    returnRate: typeof item.returnRate === 'number' ? item.returnRate : 24.8,
    useFocus: Boolean(item.useFocus),
    blackMarket: Boolean(item.blackMarket),
    taxRate: typeof item.taxRate === 'number' ? item.taxRate : 6.5,
    materialsSnapshot:
      Array.isArray(item.materialsSnapshot) && item.materialsSnapshot.length > 0
        ? item.materialsSnapshot
        : getFallbackRecipe(item.item.id),
    materialPricesSnapshot:
      item.materialPricesSnapshot && typeof item.materialPricesSnapshot === 'object'
        ? item.materialPricesSnapshot
        : {},
  }));
}

// --- Initial Data ---
const INITIAL_RESOURCES: ResourceRow[] = [
  { tier: 'T4.0', tela: 287, lingote: 282, tablas: 289, cuero: 315 },
  { tier: 'T4.1', tela: 406, lingote: 564, tablas: 330, cuero: 479 },
  { tier: 'T4.2', tela: 1900, lingote: 2700, tablas: 1300, cuero: 2043 },
  { tier: 'T4.3', tela: 8800, lingote: 6800, tablas: 7000, cuero: 8150 },
  { tier: 'T4.4', tela: 39900, lingote: 42000, tablas: 40000, cuero: 42000 },
  { tier: 'T5.0', tela: 1009, lingote: 1024, tablas: 836, cuero: 1337 },
  { tier: 'T5.1', tela: 1845, lingote: 1933, tablas: 1294, cuero: 1850 },
  { tier: 'T5.2', tela: 4300, lingote: 6900, tablas: 4500, cuero: 5900 },
  { tier: 'T5.3', tela: 19100, lingote: 27000, tablas: 23500, cuero: 24000 },
  { tier: 'T5.4', tela: 100000, lingote: 109000, tablas: 120000, cuero: 97000 },
  { tier: 'T6.0', tela: 3237, lingote: 3135, tablas: 2939, cuero: 4842 },
  { tier: 'T6.1', tela: 6150, lingote: 7200, tablas: 4850, cuero: 8800 },
  { tier: 'T6.2', tela: 20000, lingote: 25000, tablas: 18900, cuero: 24500 },
  { tier: 'T6.3', tela: 43000, lingote: 86000, tablas: 76000, cuero: 80100 },
  { tier: 'T6.4', tela: 285000, lingote: 316000, tablas: 315000, cuero: 300000 },
  { tier: 'T7.0', tela: 9000, lingote: 7960, tablas: 10300, cuero: 15000 },
  { tier: 'T7.1', tela: 21000, lingote: 22500, tablas: 16900, cuero: 28000 },
  { tier: 'T7.2', tela: 46000, lingote: 75000, tablas: 60000, cuero: 77100 },
  { tier: 'T7.3', tela: 215000, lingote: 250000, tablas: 236000, cuero: 230000 },
  { tier: 'T7.4', tela: 890000, lingote: 722000, tablas: 940000, cuero: 862000 },
  { tier: 'T8.0', tela: 26800, lingote: 28200, tablas: 32000, cuero: 35200 },
  { tier: 'T8.1', tela: 56800, lingote: 79000, tablas: 56000, cuero: 85000 },
  { tier: 'T8.2', tela: 195000, lingote: 240000, tablas: 213000, cuero: 233000 },
  { tier: 'T8.3', tela: 650000, lingote: 650000, tablas: 650000, cuero: 700000 },
  { tier: 'T8.4', tela: 3050000, lingote: 3000000, tablas: 3050000, cuero: 3000000 },
];

const INITIAL_JOURNALS: JournalType[] = [
  {
    name: 'Blacksmith Journal', subtitle: 'WARRIOR', icon: 'Book',
    rows: [
      { tier: 'T4', buy: 2250, sell: 2950 },
      { tier: 'T5', buy: 5000, sell: 9100 },
      { tier: 'T6', buy: 8800, sell: 21500 },
      { tier: 'T7', buy: 16100, sell: 46000 },
      { tier: 'T8', buy: 22250, sell: 140000 },
    ],
  },
  {
    name: 'Imbuer Journal', subtitle: 'MAGE', icon: 'Book',
    rows: [
      { tier: 'T4', buy: 2400, sell: 4600 },
      { tier: 'T5', buy: 5000, sell: 9900 },
      { tier: 'T6', buy: 7850, sell: 23900 },
      { tier: 'T7', buy: 12150, sell: 55000 },
      { tier: 'T8', buy: 23000, sell: 140000 },
    ],
  },
  {
    name: 'Fletcher Journal', subtitle: 'HUNTER', icon: 'Book',
    rows: [
      { tier: 'T4', buy: 2900, sell: 3950 },
      { tier: 'T5', buy: 5000, sell: 11300 },
      { tier: 'T6', buy: 6600, sell: 27500 },
      { tier: 'T7', buy: 11500, sell: 80000 },
      { tier: 'T8', buy: 26000, sell: 185000 },
    ],
  },
  {
    name: 'Tinker Journal', subtitle: 'TOOLMAKER', icon: 'Book',
    rows: [
      { tier: 'T4', buy: 0, sell: 0 },
      { tier: 'T5', buy: 0, sell: 0 },
      { tier: 'T6', buy: 0, sell: 0 },
      { tier: 'T7', buy: 0, sell: 0 },
      { tier: 'T8', buy: 0, sell: 0 },
    ],
  },
];

const INITIAL_CALCULATOR_PREFERENCES: CalculatorPreferences = {
  tax: 6.5,
  usePremium: true,
  returnRate: 24.8,
  returnRateMode: 'city',
  hideoutQuality: 5,
  hideoutPower: 5,
  hideoutFocus: false,
  dailyBonus: 0,
  useFocus: false,
  blackMarket: false,
  locale: 'es',
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

function findStoredJournal(stored: JournalType[], canonical: JournalType, canonicalIndex: number) {
  const canonicalKey = normalizeJournalKey(canonical.name.replace(/\s+Journal$/i, ''));
  const aliases = JOURNAL_TYPE_ALIASES[canonicalKey] ?? [canonicalKey];

  return stored.find((entry) => {
    const subtitle = normalizeJournalKey(entry.subtitle);
    const name = normalizeJournalKey(entry.name);
    return aliases.includes(subtitle) || aliases.some(alias => name.includes(alias));
  }) ?? stored[canonicalIndex];
}

function normalizeJournals(stored: JournalType[]): JournalType[] {
  if (!Array.isArray(stored)) return INITIAL_JOURNALS;

  return INITIAL_JOURNALS.map((canonical, index) => {
    const storedMatch = findStoredJournal(stored, canonical, index);
    return {
      ...canonical,
      rows: storedMatch?.rows ?? canonical.rows,
    };
  });
}

interface AppContextType {
  selectedItem: AlbionItem | null;
  setSelectedItem: (item: AlbionItem | null) => void;
  selectedTreeItem: TreeItem | null;
  setSelectedTreeItem: (item: TreeItem | null) => void;
  server: Server;
  setServer: (s: Server) => void;
  currentView: AppView;
  setCurrentView: (v: AppView) => void;
  plannerItems: PlannerItem[];
  addPlannerItem: (item: Omit<PlannerItem, 'id'>) => void;
  removePlannerItem: (id: string) => void;
  updatePlannerItem: (id: string, updates: Partial<PlannerItem>) => void;
  resources: ResourceRow[];
  setResources: React.Dispatch<React.SetStateAction<ResourceRow[]>>;
  journals: JournalType[];
  setJournals: React.Dispatch<React.SetStateAction<JournalType[]>>;
  artifactPrices: Record<string, number>;
  setArtifactPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  specs: Record<string, number>;
  setSpecs: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  calculatorPreferences: CalculatorPreferences;
  setCalculatorPreferences: React.Dispatch<React.SetStateAction<CalculatorPreferences>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  itemOverrides: Record<string, Record<string, number>>;
  setItemOverrides: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>;
  allManualSellPrices: Record<string, number>;
  setAllManualSellPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  allMarketPrices: Record<string, number>;
  setAllMarketPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  allMarketQualityPrices: Record<string, QualityPriceMap>;
  setAllMarketQualityPrices: React.Dispatch<React.SetStateAction<Record<string, QualityPriceMap>>>;
}

const AppContext = createContext<AppContextType>({
  selectedItem: null,
  setSelectedItem: () => {},
  selectedTreeItem: null,
  setSelectedTreeItem: () => {},
  server: 'west',
  setServer: () => {},
  currentView: 'calculator',
  setCurrentView: () => {},
  plannerItems: [],
  addPlannerItem: () => {},
  removePlannerItem: () => {},
  updatePlannerItem: () => {},
  resources: INITIAL_RESOURCES,
  setResources: () => INITIAL_RESOURCES,
  journals: INITIAL_JOURNALS,
  setJournals: () => INITIAL_JOURNALS,
  artifactPrices: {},
  setArtifactPrices: () => ({}),
  specs: {},
  setSpecs: () => ({}),
  calculatorPreferences: INITIAL_CALCULATOR_PREFERENCES,
  setCalculatorPreferences: () => INITIAL_CALCULATOR_PREFERENCES,
  sidebarCollapsed: false,
  setSidebarCollapsed: () => false,
  itemOverrides: {},
  setItemOverrides: () => {},
  allManualSellPrices: {},
  setAllManualSellPrices: () => {},
  allMarketPrices: {},
  setAllMarketPrices: () => {},
  allMarketQualityPrices: {},
  setAllMarketQualityPrices: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<AlbionItem | null>(null);
  const [selectedTreeItem, setSelectedTreeItem] = useState<TreeItem | null>(null);
  const [server, setServer] = useState<Server>('west');
  const [currentView, setCurrentView] = useState<AppView>('calculator');
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>(INITIAL_RESOURCES);
  const [journals, setJournals] = useState<JournalType[]>(INITIAL_JOURNALS);
  const [artifactPrices, setArtifactPrices] = useState<Record<string, number>>({});
  const [specs, setSpecs] = useState<Record<string, number>>({});
  const [calculatorPreferences, setCalculatorPreferences] = useState<CalculatorPreferences>(INITIAL_CALCULATOR_PREFERENCES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [itemOverrides, setItemOverrides] = useState<Record<string, Record<string, number>>>({});
  const [allManualSellPrices, setAllManualSellPrices] = useState<Record<string, number>>({});
  const [allMarketPrices, setAllMarketPrices] = useState<Record<string, number>>({});
  const [allMarketQualityPrices, setAllMarketQualityPrices] = useState<Record<string, QualityPriceMap>>({});
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  useEffect(() => {
    setPlannerItems(normalizePlannerItems(readStoredValue(STORAGE_KEYS.planner, [] as PlannerItem[])));
    setResources(readStoredValue(STORAGE_KEYS.resources, INITIAL_RESOURCES));
    setJournals(normalizeJournals(readStoredValue(STORAGE_KEYS.journals, INITIAL_JOURNALS)));
    setArtifactPrices(readStoredValue(STORAGE_KEYS.artifacts, {}));
    setSpecs(readStoredValue(STORAGE_KEYS.specs, {}));
    setCalculatorPreferences({
      ...INITIAL_CALCULATOR_PREFERENCES,
      ...readStoredValue(STORAGE_KEYS.calculatorPrefs, INITIAL_CALCULATOR_PREFERENCES),
    });
    setSidebarCollapsed(readStoredValue(STORAGE_KEYS.sidebarCollapsed, false));
    setAllMarketPrices(readStoredValue(MARKET_PRICES_KEY, {}));
    
    const manualData = readStoredValue('albion_calculator_manual_data_v2_albion_printer_match', { overrides: {}, sellPrices: {} });
    setItemOverrides(manualData.overrides || {});
    setAllManualSellPrices(manualData.sellPrices || {});

    setHasHydratedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(STORAGE_KEYS.planner, JSON.stringify(plannerItems));
  }, [hasHydratedStorage, plannerItems]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(STORAGE_KEYS.resources, JSON.stringify(resources));
  }, [hasHydratedStorage, resources]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(STORAGE_KEYS.journals, JSON.stringify(journals));
  }, [hasHydratedStorage, journals]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(STORAGE_KEYS.specs, JSON.stringify(specs));
  }, [hasHydratedStorage, specs]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(STORAGE_KEYS.artifacts, JSON.stringify(artifactPrices));
  }, [hasHydratedStorage, artifactPrices]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(STORAGE_KEYS.calculatorPrefs, JSON.stringify(calculatorPreferences));
  }, [calculatorPreferences, hasHydratedStorage]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, JSON.stringify(sidebarCollapsed));
  }, [hasHydratedStorage, sidebarCollapsed]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem('albion_calculator_manual_data_v2_albion_printer_match', JSON.stringify({
      overrides: itemOverrides,
      sellPrices: allManualSellPrices
    }));
  }, [hasHydratedStorage, itemOverrides, allManualSellPrices]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(MARKET_PRICES_KEY, JSON.stringify(allMarketPrices));
  }, [hasHydratedStorage, allMarketPrices]);

  const addPlannerItem = useCallback((item: Omit<PlannerItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).slice(2, 11) };
    setPlannerItems(prev => [...prev, newItem]);
  }, []);

  const removePlannerItem = useCallback((id: string) => {
    setPlannerItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updatePlannerItem = useCallback((id: string, updates: Partial<PlannerItem>) => {
    setPlannerItems(prev => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.id !== id) return item;

        const merged = { ...item, ...updates };
        const same = Object.keys(updates).every((key) => {
          const typedKey = key as keyof PlannerItem;
          return JSON.stringify(item[typedKey]) === JSON.stringify(merged[typedKey]);
        });

        if (same) return item;
        changed = true;
        return merged;
      });

      return changed ? next : prev;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      selectedItem, setSelectedItem,
      selectedTreeItem, setSelectedTreeItem,
      server, setServer,
      currentView, setCurrentView,
      plannerItems, addPlannerItem, removePlannerItem, updatePlannerItem,
      resources, setResources,
      journals, setJournals,
      artifactPrices, setArtifactPrices,
      specs, setSpecs,
      calculatorPreferences, setCalculatorPreferences,
      sidebarCollapsed, setSidebarCollapsed,
      itemOverrides, setItemOverrides,
      allManualSellPrices, setAllManualSellPrices,
      allMarketPrices, setAllMarketPrices,
      allMarketQualityPrices, setAllMarketQualityPrices,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
