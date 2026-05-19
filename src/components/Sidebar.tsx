'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, TreeItem, Subcategory } from '@/lib/items';
import { AppView, useApp } from '@/lib/AppContext';
import { getCategoryName, getSubcategoryName, getTreeItemName, t } from '@/lib/i18n';
import {
  Sword,
  CircleUser,
  Layers,
  Wind,
  Shield,
  ShoppingBag,
  Database,
  Settings,
  Hammer,
  PanelLeftClose,
  PanelLeftOpen,
  Languages,
  Search,
  X,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const ICON_MAP: Record<string, ReactNode> = {
  Sword: <Sword size={18} />,
  CircleUser: <CircleUser size={18} />,
  Layers: <Layers size={18} />,
  Wind: <Wind size={18} />,
  Shield: <Shield size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
};

const normalizeSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export default function Sidebar() {
  const {
    setSelectedItem,
    setSelectedTreeItem,
    selectedTreeItem,
    currentView,
    setCurrentView,
    calculatorPreferences,
    setCalculatorPreferences,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useApp();
  const router = useRouter();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const didApplyInitialMobileCollapse = useRef(false);

  const locale = calculatorPreferences.locale;
  const searchPlaceholder = locale === 'es' ? 'Buscar objeto...' : 'Search item...';
  const noSearchResults = locale === 'es' ? 'SIN RESULTADOS' : 'NO RESULTS';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (didApplyInitialMobileCollapse.current) return;

    if (window.innerWidth <= 768 && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
    didApplyInitialMobileCollapse.current = true;
  }, [setSidebarCollapsed, sidebarCollapsed]);

  const searchableItems = useMemo(() => (
    CATEGORIES.flatMap((cat) => (
      cat.subcategories.flatMap((sub) => (
        sub.items.map((item) => {
          const localizedName = getTreeItemName(item, locale);
          const categoryName = getCategoryName(cat, locale);
          const subcategoryName = getSubcategoryName(sub, locale);

          return {
            item,
            categoryId: cat.id,
            subcategoryId: sub.id,
            name: localizedName,
            categoryName,
            subcategoryName,
            searchText: normalizeSearch([
              localizedName,
              item.name,
              item.id,
              item.tiers[4][0].baseId,
              categoryName,
              subcategoryName,
            ].join(' ')),
          };
        })
      ))
    ))
  ), [locale]);

  const searchResults = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    if (!query) return [];

    return searchableItems
      .filter((entry) => entry.searchText.includes(query))
      .slice(0, 8);
  }, [searchQuery, searchableItems]);

  const toggleCat = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
    setExpandedSub(null);
  };

  const toggleSub = (id: string) => {
    setExpandedSub(expandedSub === id ? null : id);
  };

  const selectItem = (item: TreeItem) => {
    setSelectedTreeItem(item);
    setSelectedItem(item.tiers[4][0]);
    setCurrentView('calculator');
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  const selectSearchResult = (entry: (typeof searchableItems)[number]) => {
    setExpandedCat(entry.categoryId);
    setExpandedSub(entry.subcategoryId);
    setSearchQuery('');
    selectItem(entry.item);
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
    if (window.location.pathname !== '/') {
      router.push('/');
    }
  };

  if (sidebarCollapsed) {
    return (
      <aside className={styles.sidebarCollapsed}>
        <button
          className={styles.collapseBtn}
          onClick={() => setSidebarCollapsed(false)}
          aria-label={t(locale, 'expandSidebar')}
          title={t(locale, 'expandSidebar')}
        >
          <PanelLeftOpen size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <Hammer size={28} strokeWidth={3} fill="currentColor" />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>ALBION PRINTER</span>
          <span className={styles.brandVersion}>V1.17</span>
        </div>
        <button
          className={styles.headerAction}
          onClick={() => setSidebarCollapsed(true)}
          aria-label={t(locale, 'collapseSidebar')}
          title={t(locale, 'collapseSidebar')}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${currentView === 'calculator' ? styles.tabActive : ''}`}
          onClick={() => navigateTo('calculator')}
        >
          {t(locale, 'calculator')}
        </button>
        <button
          className={`${styles.tab} ${currentView === 'planner' ? styles.tabActive : ''}`}
          onClick={() => navigateTo('planner')}
        >
          {t(locale, 'planner')}
        </button>
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.searchInputShell}>
          <Search size={15} />
          <input
            className={styles.searchInput}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearchQuery('')}
              aria-label={locale === 'es' ? 'Limpiar busqueda' : 'Clear search'}
              title={locale === 'es' ? 'Limpiar busqueda' : 'Clear search'}
            >
              <X size={13} />
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
              <div className={styles.searchEmpty}>{noSearchResults}</div>
            )}
          </div>
        )}
      </div>

      <div className={styles.categoryLabel}>{t(locale, 'chooseItemToCraft')}</div>

      <div className={styles.categoryList}>
        {CATEGORIES.map((cat) => {
          const isExpanded = expandedCat === cat.id;
          return (
            <div key={cat.id} className={styles.catWrapper}>
              <button
                type="button"
                className={`${styles.catRow} ${isExpanded ? styles.catRowActive : ''}`}
                onClick={() => toggleCat(cat.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.catLeft}>
                  <span className={styles.catIcon}>{ICON_MAP[cat.icon] || cat.icon}</span>
                  <span className={styles.catName}>{getCategoryName(cat, locale)}</span>
                </div>
                <span className={styles.catArrow}>{isExpanded ? 'v' : '>'}</span>
              </button>

              {isExpanded && cat.subcategories.map((sub: Subcategory) => {
                const isSubExpanded = expandedSub === sub.id;
                return (
                  <div key={sub.id} className={styles.subWrapper}>
                    <button
                      type="button"
                      className={`${styles.subRow} ${isSubExpanded ? styles.subRowActive : ''}`}
                      onClick={() => toggleSub(sub.id)}
                      aria-expanded={isSubExpanded}
                    >
                      <span>{getSubcategoryName(sub, locale)}</span>
                      <span className={styles.catArrow}>{isSubExpanded ? 'v' : '>'}</span>
                    </button>

                    {isSubExpanded && sub.items.map((item: TreeItem) => (
                      <button
                        type="button"
                        key={item.id}
                        className={`${styles.itemRow} ${selectedTreeItem?.id === item.id ? styles.itemRowActive : ''}`}
                        onClick={() => selectItem(item)}
                        aria-current={selectedTreeItem?.id === item.id ? 'page' : undefined}
                      >
                        {getTreeItemName(item, locale)}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.footerBtnMain}
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth <= 768) {
              setSidebarCollapsed(true);
            }
            router.push('/database');
          }}
        >
          <Database size={18} /> {t(locale, 'database')}
        </button>
        <button className={styles.footerBtnGray} onClick={() => setSettingsOpen(prev => !prev)}>
          <Settings size={18} /> {t(locale, 'settings')}
        </button>

        {settingsOpen && (
          <div className={styles.settingsPanel}>
            <div className={styles.settingsHeader}>{t(locale, 'calculatorSettings')}</div>

            <div className={styles.settingsBlock}>
              <div className={styles.settingsLabel}>
                <Languages size={14} />
                <span>{t(locale, 'interfaceLanguage')}</span>
              </div>
              <div className={styles.modeSwitch}>
                <button
                  className={`${styles.modeBtn} ${locale === 'es' ? styles.modeBtnActive : ''}`}
                  onClick={() => setCalculatorPreferences(prev => ({ ...prev, locale: 'es' }))}
                >
                  {t(locale, 'spanish')}
                </button>
                <button
                  className={`${styles.modeBtn} ${locale === 'en' ? styles.modeBtnActive : ''}`}
                  onClick={() => setCalculatorPreferences(prev => ({ ...prev, locale: 'en' }))}
                >
                  {t(locale, 'english')}
                </button>
              </div>
            </div>

            <div className={styles.settingsBlock}>
              <div className={styles.settingsLabel}>
                <PanelLeftClose size={14} />
                <span>{t(locale, 'navigationMode')}</span>
              </div>
              <div className={styles.modeSwitch}>
                <button
                  className={`${styles.modeBtn} ${!sidebarCollapsed ? styles.modeBtnActive : ''}`}
                  onClick={() => setSidebarCollapsed(false)}
                >
                  {t(locale, 'expandedSidebar')}
                </button>
                <button
                  className={styles.modeBtn}
                  onClick={() => setSidebarCollapsed(true)}
                >
                  {t(locale, 'compactSidebar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
