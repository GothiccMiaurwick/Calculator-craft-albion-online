'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { getCategoryName, getSubcategoryName, getTreeItemName, t } from '@/lib/i18n';
import { CATEGORIES, TreeItem } from '@/lib/items';
import Calculator from '@/components/Calculator';
import Planner from '@/components/Planner';
import SpecialtyTools from '@/components/SpecialtyTools';
import { CalcIcon, FlameIcon, SparkleIcon, ChefIcon, SearchIcon, CloseIcon } from '@/components/Icons';
import styles from './page.module.css';

const SAVED_TALLERES_KEY = 'saved_talleres';

interface SavedTaller {
  id: string;
  name: string;
  date: string;
}

const normalizeSearch = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

function getSavedTalleres(): SavedTaller[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_TALLERES_KEY) || '[]');
  } catch { return []; }
}

export default function Home() {
  const { selectedItem, currentView, setSelectedItem, setSelectedTreeItem, setCurrentView, setSidebarCollapsed, calculatorPreferences } = useApp();
  const locale = calculatorPreferences.locale;
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPlans, setRecentPlans] = useState<SavedTaller[]>([]);

  useEffect(() => {
    setRecentPlans(getSavedTalleres().toReversed().slice(0, 5));
  }, []);

  const searchableItems = useMemo(() => (
    CATEGORIES.flatMap((cat) =>
      cat.subcategories.flatMap((sub) =>
        sub.items.map((item) => ({
          item,
          categoryId: cat.id,
          subcategoryId: sub.id,
          name: getTreeItemName(item, locale),
          categoryName: getCategoryName(cat, locale),
          subcategoryName: getSubcategoryName(sub, locale),
          searchText: normalizeSearch([
            getTreeItemName(item, locale),
            item.name,
            item.id,
            item.tiers[4][0].baseId,
            getCategoryName(cat, locale),
            getSubcategoryName(sub, locale),
          ].join(' ')),
        }))
      )
    )
  ), [locale]);

  const searchResults = useMemo(() => {
    const q = normalizeSearch(searchQuery);
    if (!q) return [];
    return searchableItems.filter((e) => e.searchText.includes(q)).slice(0, 8);
  }, [searchQuery, searchableItems]);

  const selectItem = (item: TreeItem) => {
    setSelectedTreeItem(item);
    setSelectedItem(item.tiers[4][0]);
    setCurrentView('calculator');
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  const selectSearchResult = (entry: (typeof searchableItems)[number]) => {
    setSearchQuery('');
    selectItem(entry.item);
  };

  const selectPlan = (plan: SavedTaller) => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_TALLERES_KEY) || '[]');
      const found = saved.find((t: SavedTaller) => t.id === plan.id);
      if (found) {
        const { plannerItems, extraCosts, selectedMountIndex, selectedBagIndex, selectedFoodIndex, craftFameBonus } = found.data;
        if (plannerItems) {
          setCurrentView('planner');
        }
      }
    } catch {}
    setCurrentView('planner');
  };

  if (currentView === 'planner') {
    return <Planner />;
  }

  if (currentView === 'refiner' || currentView === 'enchanter' || currentView === 'cooking') {
    return <SpecialtyTools view={currentView} />;
  }

  if (selectedItem && currentView === 'calculator') {
    return <Calculator />;
  }

  return (
    <div className={styles.welcome}>
      <div className={styles.hero}>
        <div className={styles.logoWrap}>
          <img src="/iconPageGreatHammer.png" className={styles.heroImg} alt="" aria-hidden="true" />
        </div>

        <div className={styles.searchWrap}>
          <div className={styles.searchInputShell}>
            <SearchIcon size={17} />
            <input
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(locale, 'searchItem')}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className={styles.searchResults}>
              {searchResults.length > 0 ? searchResults.map((entry) => (
                <button
                  key={entry.item.id}
                  type="button"
                  className={styles.searchResult}
                  onClick={() => selectSearchResult(entry)}
                >
                  <span className={styles.searchResultName}>{entry.name}</span>
                  <span className={styles.searchResultMeta}>
                    {entry.categoryName} / {entry.subcategoryName}
                  </span>
                </button>
              )) : (
                <div className={styles.searchEmpty}>SIN RESULTADOS</div>
              )}
            </div>
          )}
        </div>

        <p className={styles.welcomeMsg}>{t(locale, 'welcomeMessage')}</p>

        <span className={styles.toolLabel}>Herramientas</span>
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={() => setCurrentView('calculator')}>
            <CalcIcon size={18} /> {t(locale, 'calculator')}
          </button>
          <button className={styles.btnSecondary} onClick={() => setCurrentView('refiner')}>
            <FlameIcon size={18} /> {t(locale, 'refiner')}
          </button>
          <button className={styles.btnSecondary} onClick={() => setCurrentView('enchanter')}>
            <SparkleIcon size={18} /> {t(locale, 'enchanter')}
          </button>
          <button className={styles.btnSecondary} onClick={() => setCurrentView('cooking')}>
            <ChefIcon size={18} /> {t(locale, 'cooking')}
          </button>
        </div>

        {recentPlans.length > 0 && (
          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>{t(locale, 'recentPlans')}</div>
            <div className={styles.recentList}>
              {recentPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={styles.recentPlan}
                  onClick={() => selectPlan(plan)}
                >
                  <span className={styles.recentPlanName}>{plan.name}</span>
                  <span className={styles.recentPlanDate}>
                    {new Date(plan.date).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className={styles.tagline}>&quot;crafted with love &lt;3&quot;</p>
      </div>
    </div>
  );
}
