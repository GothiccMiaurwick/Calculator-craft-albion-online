'use client';

import { useState, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';
import { Check, Download, Globe2, Plus, Search, X } from 'lucide-react';
import styles from './page.module.css';

import { SPECS_DATA } from '@/lib/specsData';
import { SwordIcon, HelmetIcon, ChestIcon, BootIcon, ShieldIcon, BagIcon, ShirtIcon, BookIcon } from '@/components/Icons';
import { getItemImageUrl, CITIES } from '@/lib/items';
import { useApp } from '@/lib/AppContext';
import type { ResourceRow } from '@/lib/AppContext';
import { ARTIFACT_BASE_DATA } from '@/lib/artifacts';
import { getArtifactCategoryName, getArtifactNameByBaseId, getDisplayLocale, getItemNameByBaseId, getJournalDisplayName, getJournalWorkerName, getResourceLabel, translateLooseUiLabel } from '@/lib/i18n';
import { fetchPrices } from '@/lib/api';

const ICON_MAP: Record<string, ReactNode> = {
  Sword: <SwordIcon size={22} />,
  CircleUser: <HelmetIcon size={22} />,
  Layers: <ChestIcon size={22} />,
  Wind: <BootIcon size={22} />,
  Shield: <ShieldIcon size={22} />,
  ShoppingBag: <BagIcon size={22} />,
  Shirt: <ShirtIcon size={22} />,
  Book: <BookIcon size={20} />
};

const RESOURCE_IMG_MAP: Record<string, string> = {
  tela: 'CLOTH',
  lingote: 'METALBAR',
  tablas: 'PLANKS',
  cuero: 'LEATHER'
};

const RESOURCE_OPTIONS = [
  { id: 'tela', api: 'CLOTH', labelEs: 'TELA', labelEn: 'CLOTH', city: 'Lymhurst' },
  { id: 'lingote', api: 'METALBAR', labelEs: 'LINGOTE', labelEn: 'BAR', city: 'Thetford' },
  { id: 'tablas', api: 'PLANKS', labelEs: 'TABLAS', labelEn: 'PLANKS', city: 'Fort Sterling' },
  { id: 'cuero', api: 'LEATHER', labelEs: 'CUERO', labelEn: 'LEATHER', city: 'Martlock' },
] as const;

const SERVER_OPTIONS = [
  { id: 'west', label: 'AMERICA' },
  { id: 'europe', label: 'EUROPE' },
  { id: 'east', label: 'ASIA' },
] as const;

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
  'FABRICANTE DE HERRAMIENTAS': 'JOURNAL_TOOLMAKER'
};

const DB_TEXT = {
  es: {
    title: 'BASE DE DATOS',
    subtitle: 'Actualiza los precios del mercado aqui. Recomendamos hacerlo una o dos veces al mes para mantener tus calculos precisos.',
    resources: 'RECURSOS',
    artifacts: 'ARTEFACTOS',
    journals: 'DIARIOS',
    specs: 'SPECS DE CRAFTEO',
    level: 'NIVEL',
    buy: 'COMPRAR',
    sell: 'VENDER',
    artifactInfo: 'Precios manuales para artefactos especificos. Se usaran en lugar del precio generico si estan configurados.',
    artifactSearch: 'Buscar artefacto...',
    artifactColumn: 'ARTEFACTO',
    specsSearch: 'Buscar por categoria (p. ej. Hachas, espadas...)',
    specsInfo: 'Coloca tus specs de crafteo aqui (0-100).',
    lvl: 'LVL',
    getPrices: 'GET PRICES',
    getPricesTitle: 'GET PRICES',
    server: 'SERVER',
    city: 'Ciudad',
    smartCityHint: 'ciudad de refinado',
    searchPrices: 'SEARCH PRICES',
    updateDatabase: 'UPDATE DATABASE',
    cancel: 'CANCEL',
    foundPrices: 'FOUND PRICES',
    noPrices: 'No se encontraron precios para este recurso.',
  },
  en: {
    title: 'DATABASE',
    subtitle: 'Update market prices here. We recommend doing it once or twice per month to keep your calculations accurate.',
    resources: 'RESOURCES',
    artifacts: 'ARTIFACTS',
    journals: 'JOURNALS',
    specs: 'CRAFTING SPECS',
    level: 'LEVEL',
    buy: 'BUY',
    sell: 'SELL',
    artifactInfo: 'Manual prices for specific artifacts. They will be used instead of the generic price when configured.',
    artifactSearch: 'Search artifact...',
    artifactColumn: 'ARTIFACT',
    specsSearch: 'Search by category (for example Axes, Swords...)',
    specsInfo: 'Set your crafting specs here (0-100).',
    lvl: 'LVL',
    getPrices: 'GET PRICES',
    getPricesTitle: 'GET PRICES',
    server: 'SERVER',
    city: 'City',
    smartCityHint: 'refining city',
    searchPrices: 'SEARCH PRICES',
    updateDatabase: 'UPDATE DATABASE',
    cancel: 'CANCEL',
    foundPrices: 'FOUND PRICES',
    noPrices: 'No prices found for this resource.',
  },
} as const;

function getTierColor(tier: string): string {
  const num = parseInt(tier.replace('T', ''), 10);
  return getTierGroupColor(num);
}

function getTierGroupColor(tierGroup: number): string {
  if (tierGroup === 4) return '#2f8cff';
  if (tierGroup === 5) return '#f97316';
  if (tierGroup === 6) return '#d9a808';
  if (tierGroup === 7) return '#eab308';
  if (tierGroup === 8) return '#a08060';
  return '#ffffff';
}

function fmt(n: number, localeCode: string) {
  if (n === 0) return '';
  return n.toLocaleString(localeCode);
}

function getResourceItemId(tier: string, resourceApi: string) {
  const m = tier.match(/T(\d+)\.(\d+)/);
  if (!m) return `T4_${resourceApi}`;
  const [, tierN, enchantN] = m;
  const suffix = enchantN === '0' ? '' : `_LEVEL${enchantN}@${enchantN}`;
  return `T${tierN}_${resourceApi}${suffix}`;
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesLooseSearch(query: string, haystack: string) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedHaystack = normalizeSearchText(haystack);

  if (!normalizedQuery) return true;
  if (normalizedHaystack.includes(normalizedQuery)) return true;

  const queryParts = normalizedQuery.split(/\s+/).filter(Boolean);
  return queryParts.every((part) => normalizedHaystack.includes(part));
}

function getSearchScore(query: string, candidates: string[]) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeSearchText(candidate);
    if (!normalizedCandidate) continue;

    if (normalizedCandidate === normalizedQuery) {
      bestScore = Math.min(bestScore, 0);
      continue;
    }

    if (normalizedCandidate.startsWith(normalizedQuery)) {
      bestScore = Math.min(bestScore, 1);
      continue;
    }

    if (normalizedCandidate.split(/\s+/).some((part) => part.startsWith(normalizedQuery))) {
      bestScore = Math.min(bestScore, 2);
      continue;
    }

    if (normalizedCandidate.includes(normalizedQuery)) {
      bestScore = Math.min(bestScore, 3);
      continue;
    }

    const queryParts = normalizedQuery.split(/\s+/).filter(Boolean);
    if (queryParts.every((part) => normalizedCandidate.includes(part))) {
      bestScore = Math.min(bestScore, 4);
    }
  }

  return bestScore;
}

interface PriceInputProps {
  value: number;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  localeCode: string;
}

function PriceInput({ value, onChange, placeholder, className, style, localeCode }: PriceInputProps) {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalValue(value === 0 ? '' : value.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || /^\d+$/.test(raw)) {
      setLocalValue(raw);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseInt(localValue, 10) || 0;
    onChange(num.toString());
    setLocalValue(fmt(num, localeCode));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      className={className}
      style={style}
      value={isFocused ? localValue : fmt(value, localeCode)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
}

export default function DatabasePage() {
  const {
    resources,
    setResources,
    journals,
    setJournals,
    specs,
    setSpecs,
    artifactPrices,
    setArtifactPrices,
    calculatorPreferences,
    server,
    setAllMarketPrices,
  } = useApp();
  const locale = calculatorPreferences.locale;
  const localeCode = getDisplayLocale(locale);
  const dbText = DB_TEXT[locale];
  const [tab, setTab] = useState<'recursos' | 'diarios' | 'artefactos' | 'specs'>('recursos');
  const [specsSearch, setSpecsSearch] = useState('');
  const [expandedSubcats, setExpandedSubcats] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [pricesModalOpen, setPricesModalOpen] = useState(false);
  const [selectedPriceResource, setSelectedPriceResource] = useState<(typeof RESOURCE_OPTIONS)[number]['id']>('tela');
  const [selectedPriceServer, setSelectedPriceServer] = useState(server);
  const [priceResults, setPriceResults] = useState<Record<string, number>>({});
  const [priceSearchDone, setPriceSearchDone] = useState(false);
  const [artifactLoading, setArtifactLoading] = useState(false);
  const [artifactDone, setArtifactDone] = useState(false);

  async function fetchArtifactPrices() {
    setArtifactLoading(true);
    setArtifactDone(false);
    try {
      const allIds = ARTIFACT_BASE_DATA.flatMap((art) =>
        [4, 5, 6, 7, 8].map((t) => `T${t}_ARTEFACT_${art.id}`)
      );
      const chunkSize = 40;
      const nextPrices: Record<string, number> = {};
      for (let i = 0; i < allIds.length; i += chunkSize) {
        const chunk = allIds.slice(i, i + chunkSize);
        const prices = await fetchPrices(chunk, server, CITIES);
        for (const fullId of chunk) {
          const matches = prices.filter(
            (p) => p.item_id === fullId && p.sell_price_min > 0
          );
          if (matches.length > 0) {
            nextPrices[fullId] = Math.min(...matches.map((p) => p.sell_price_min));
          }
        }
      }
      setArtifactPrices((prev) => ({ ...prev, ...nextPrices }));
      setAllMarketPrices((prev) => ({ ...prev, ...nextPrices }));
      setArtifactDone(true);
    } catch (e) {
      console.error('Failed to fetch artifact prices', e);
    } finally {
      setArtifactLoading(false);
    }
  }
  const selectedResourceOption = RESOURCE_OPTIONS.find((option) => option.id === selectedPriceResource) ?? RESOURCE_OPTIONS[0];
  const selectedPriceCity = selectedResourceOption.city;

  async function searchResourcePrices() {
    setLoading(true);
    setPriceSearchDone(false);
    setPriceResults({});

    try {
      const resourceApi = selectedResourceOption.api;
      const ids = resources.map((row) => {
        return getResourceItemId(row.tier, resourceApi);
      }).filter(Boolean);

      const prices = await fetchPrices(ids, selectedPriceServer, [selectedPriceCity]);
      const nextResults: Record<string, number> = {};

      for (const row of resources) {
        const apiId = getResourceItemId(row.tier, resourceApi);
        const matches = prices.filter((p) => p.item_id === apiId && p.city === selectedPriceCity && p.sell_price_min > 0);

        if (matches.length > 0) {
          nextResults[row.tier] = Math.min(...matches.map((p) => p.sell_price_min));
        }
      }

      setPriceResults(nextResults);
      setPriceSearchDone(true);
    } catch (e) {
      console.error('Failed to fetch selected resource prices', e);
      setPriceSearchDone(true);
    } finally {
      setLoading(false);
    }
  }

  function updateResourceDatabaseFromResults() {
    const newResources = resources.map((row) => {
      const value = priceResults[row.tier];
      return value ? { ...row, [selectedPriceResource]: value } : row;
    });
    setResources(newResources);

    setAllMarketPrices(prev => {
      const next = { ...prev };
      const apiType = selectedResourceOption.api;
      for (const row of newResources) {
        const apiId = getResourceItemId(row.tier, apiType);
        const value = priceResults[row.tier];
        if (value) next[apiId] = value;
      }
      return next;
    });

    setPricesModalOpen(false);
  }

  const resourceRowsByTier = useMemo(() => {
    return resources.reduce<Record<string, ResourceRow[]>>((groups, row) => {
      const tierGroup = row.tier.split('.')[0];
      groups[tierGroup] = [...(groups[tierGroup] ?? []), row];
      return groups;
    }, {});
  }, [resources]);

  const priceResultRows = useMemo(() => {
    return resources
      .map((row) => ({ row, value: priceResults[row.tier] }))
      .filter((entry): entry is { row: ResourceRow; value: number } => typeof entry.value === 'number' && entry.value > 0);
  }, [priceResults, resources]);

  const toggleSubcat = (name: string) => {
    setExpandedSubcats(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const updateSpec = (name: string, value: string) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    if (num > 100) num = 100;
    if (num < 0) num = 0;
    setSpecs(prev => ({ ...prev, [name]: num }));
  };

  const updateResource = (
    idx: number,
    field: keyof Omit<ResourceRow, 'tier'>,
    value: string
  ) => {
    setResources(prev =>
      prev.map((r, i) => i === idx ? { ...r, [field]: parseInt(value, 10) || 0 } : r)
    );
  };

  const updateJournal = (
    jIdx: number,
    rIdx: number,
    field: 'buy' | 'sell',
    value: string
  ) => {
    setJournals(prev =>
      prev.map((j, ji) =>
        ji !== jIdx ? j : {
          ...j,
          rows: j.rows.map((r, ri) =>
            ri !== rIdx ? r : { ...r, [field]: parseInt(value, 10) || 0 }
          ),
        }
      )
    );
  };

  const updateArtifactPrice = (id: string, value: string) => {
    setArtifactPrices({
      ...artifactPrices,
      [id]: parseInt(value, 10) || 0
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{dbText.title}</h1>
            <button className={styles.getPricesBtn} onClick={() => setPricesModalOpen(true)}>
              <Globe2 size={12} />
              {dbText.getPrices}
            </button>
          </div>
          <p className={styles.subtitle}>{dbText.subtitle}</p>
        </div>
        <div className={styles.tabGroup}>
          <button
            className={clsx(styles.tabBtn, tab === 'recursos' && styles.tabBtnActive)}
            onClick={() => setTab('recursos')}
          >{dbText.resources}</button>
          <button
            className={clsx(styles.tabBtn, tab === 'artefactos' && styles.tabBtnActive)}
            onClick={() => setTab('artefactos')}
          >{dbText.artifacts}</button>
          <button
            className={clsx(styles.tabBtn, tab === 'diarios' && styles.tabBtnActive)}
            onClick={() => setTab('diarios')}
          >{dbText.journals}</button>
          <button
            className={clsx(styles.tabBtn, tab === 'specs' && styles.tabBtnActive)}
            onClick={() => setTab('specs')}
          >{dbText.specs}</button>
        </div>
      </div>

      <div className={styles.dbContent}>
      {tab === 'recursos' && (
        <div className={styles.resourceSections}>
          {Object.entries(resourceRowsByTier).map(([tierGroup, tierRows]) => {
            const tierNumber = Number(tierGroup.replace('T', ''));

            return (
              <section key={tierGroup} className={styles.resourceTierSection}>
                <h2 className={styles.tierHeading} style={{ color: getTierGroupColor(tierNumber) }}>
                  TIER {tierNumber}
                </h2>
                <div className={styles.resourceGrid}>
                  {tierRows.flatMap((row) => (
                    (['tela', 'lingote', 'tablas', 'cuero'] as const).map((field) => {
                      const resourceIndex = resources.findIndex((resourceRow) => resourceRow.tier === row.tier);
                      const label = getResourceLabel(field, locale);
                      const itemId = getResourceItemId(row.tier, RESOURCE_IMG_MAP[field]);

                      return (
                        <div key={`${row.tier}-${field}`} className={styles.resourceCard}>
                          <div className={styles.resourceCardLabel} style={{ color: getTierColor(row.tier) }}>
                            {label} {row.tier}
                          </div>
                          <div className={styles.resourceCardBody}>
                            <img
                              src={getItemImageUrl(itemId)}
                              alt={`${label} ${row.tier}`}
                              className={styles.resourceImg}
                            />
                            <PriceInput
                              className={styles.resourcePriceInput}
                              value={row[field]}
                              onChange={(val) => updateResource(resourceIndex, field, val)}
                              placeholder="0"
                              localeCode={localeCode}
                            />
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === 'diarios' && (
        <div className={styles.journalList}>
          {journals.map((journal, jIdx) => (
            <div key={journal.name} className={styles.journalCard}>
              <div className={styles.journalHeader}>
                <img
                  src={getItemImageUrl(`T4_${JOURNAL_IMG_MAP[journal.subtitle] || 'JOURNAL_WARRIOR'}_EMPTY`)}
                  alt={getJournalDisplayName(journal.name, journal.subtitle, locale)}
                  className={styles.journalIconImg}
                />
                <div>
                  <div className={styles.journalName}>{getJournalDisplayName(journal.name, journal.subtitle, locale)}</div>
                  <div className={styles.journalSub}>{getJournalWorkerName(journal.subtitle, locale)}</div>
                </div>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>{dbText.level}</th>
                    <th className={styles.th}>{dbText.buy}</th>
                    <th className={styles.th}>{dbText.sell}</th>
                  </tr>
                </thead>
                <tbody>
                  {journal.rows.map((row, rIdx) => (
                    <tr key={row.tier} className={styles.tr}>
                      <td className={styles.tdTier} style={{ color: getTierColor(row.tier) }}>
                        {row.tier}
                      </td>
                      <td className={styles.tdInput}>
                        <PriceInput
                          className={styles.priceInput}
                          value={row.buy}
                          onChange={(val) => updateJournal(jIdx, rIdx, 'buy', val)}
                          placeholder="0"
                          localeCode={localeCode}
                        />
                      </td>
                      <td className={styles.tdInput}>
                        <PriceInput
                          className={styles.priceInput}
                          value={row.sell}
                          onChange={(val) => updateJournal(jIdx, rIdx, 'sell', val)}
                          placeholder="0"
                          localeCode={localeCode}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {tab === 'artefactos' && (
        <div className={styles.resourceSections}>
          {[4, 5, 6, 7, 8].map((tierValue) => (
            <section key={tierValue} className={styles.resourceTierSection}>
              <h2 className={styles.tierHeading} style={{ color: getTierGroupColor(tierValue) }}>
                TIER {tierValue}
              </h2>
              <div className={styles.resourceGrid}>
                {ARTIFACT_BASE_DATA.map((art) => {
                  const fullId = `T${tierValue}_ARTEFACT_${art.id}`;
                  const displayName = getArtifactNameByBaseId(art.id, locale);
                  return (
                    <div key={fullId} className={styles.resourceCard}>
                      <div className={styles.resourceCardLabel} style={{ color: getTierGroupColor(tierValue) }}>
                        {displayName}
                      </div>
                      <div className={styles.resourceCardBody}>
                        <img
                          src={getItemImageUrl(`T8_ARTEFACT_${art.id}`)}
                          alt={displayName}
                          className={styles.resourceImg}
                        />
                        <PriceInput
                          className={styles.resourcePriceInput}
                          value={artifactPrices[fullId] || 0}
                          onChange={(val) => updateArtifactPrice(fullId, val)}
                          placeholder="0"
                          localeCode={localeCode}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'specs' && (
        <div className={styles.specsContainer}>
          <input
            type="text"
            className={styles.specsSearch}
            placeholder={`🔍 ${dbText.specsSearch}`}
            value={specsSearch}
            onChange={(e) => setSpecsSearch(e.target.value)}
          />
          <div className={styles.specsInfo}>
            <span className={styles.specsInfoIcon}>🎯</span>
            {dbText.specsInfo}
          </div>

          <div className={styles.specsList}>
            {SPECS_DATA.filter(cat =>
              cat.name.toLowerCase().includes(specsSearch.toLowerCase()) ||
              cat.subcategories.some(sub => sub.name.toLowerCase().includes(specsSearch.toLowerCase()) ||
                sub.items.some(item => item.name.toLowerCase().includes(specsSearch.toLowerCase())))
            ).map((cat) => (
              <div key={cat.name} className={styles.specsCategory}>
                <div className={styles.specsCatHeader}>
                  <span className={styles.specsCatIcon}>{ICON_MAP[cat.icon] || cat.icon}</span>
                  {translateLooseUiLabel(cat.name, locale)}
                </div>

                <div className={styles.specsGrid}>
                  {cat.subcategories.map(sub => {
                    if (specsSearch && !cat.name.toLowerCase().includes(specsSearch.toLowerCase()) &&
                      !sub.name.toLowerCase().includes(specsSearch.toLowerCase()) &&
                      !sub.items.some(it => it.name.toLowerCase().includes(specsSearch.toLowerCase()))) {
                      return null;
                    }

                    const isExpanded = specsSearch ? true : !!expandedSubcats[sub.name];

                    return (
                      <div
                        key={sub.name}
                        className={isExpanded ? styles.specsSubCard : styles.specsSubCardCollapsed}
                      >
                        <div
                          className={isExpanded ? styles.specsSubHeader : styles.specsSubHeaderCollapsed}
                          onClick={() => toggleSubcat(sub.name)}
                          style={{ cursor: 'pointer' }}
                        >
                          {translateLooseUiLabel(sub.name, locale)}
                          <span className={styles.specsSubArrow} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>{'>'}</span>
                        </div>

                        {isExpanded && (
                          <>
                            <div className={styles.specsRowMain}>
                              <span className={styles.specsItemMain}>{translateLooseUiLabel(sub.general.name, locale)}</span>
                              <div className={styles.specsInputWrap}>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={specs[sub.general.name] || 0}
                                  onChange={(e) => updateSpec(sub.general.name, e.target.value)}
                                  className={styles.specsInputMain}
                                />
                                <span className={styles.specsLvlMain}>{dbText.lvl}</span>
                              </div>
                            </div>

                            {sub.items.map(item => (
                              <div key={item.name} className={styles.specsRow}>
                                <span className={styles.specsItem}>{translateLooseUiLabel(item.name, locale)}</span>
                                <div className={styles.specsInputWrap}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={specs[item.name] || 0}
                                    onChange={(e) => updateSpec(item.name, e.target.value)}
                                    className={styles.specsInput}
                                  />
                                  <span className={styles.specsLvl}>{dbText.lvl}</span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {pricesModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="get-prices-title">
          <div className={styles.pricesModal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <Globe2 size={22} className={styles.modalTitleIcon} />
                <h2 id="get-prices-title" className={styles.modalTitle}>{dbText.getPricesTitle}</h2>
              </div>
              <button className={styles.iconButton} onClick={() => setPricesModalOpen(false)} aria-label="Close get prices">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.optionBlock}>
                <div className={styles.optionLabel}>{dbText.resources}</div>
                <div className={styles.resourcePicker}>
                  {RESOURCE_OPTIONS.map((option) => {
                    const active = selectedPriceResource === option.id;
                    const label = locale === 'en' ? option.labelEn : option.labelEs;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={clsx(styles.pickerCard, active && styles.pickerCardActive)}
                        onClick={() => {
                          setSelectedPriceResource(option.id);
                          setPriceResults({});
                          setPriceSearchDone(false);
                        }}
                      >
                        <img
                          src={getItemImageUrl(`T8_${option.api}`)}
                          alt={label}
                          className={styles.pickerImg}
                        />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className={styles.cityNote}>
                  {dbText.city}: <strong>{selectedPriceCity}</strong>
                  <span>{dbText.smartCityHint}</span>
                </div>
              </div>

              <div className={styles.optionBlock}>
                <div className={styles.optionLabel}>{dbText.server}</div>
                <div className={styles.serverPicker}>
                  {SERVER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={clsx(styles.serverBtn, selectedPriceServer === option.id && styles.serverBtnActive)}
                      onClick={() => {
                        setSelectedPriceServer(option.id);
                        setPriceResults({});
                        setPriceSearchDone(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className={styles.searchPricesBtn} onClick={searchResourcePrices} disabled={loading}>
                {loading ? <Download size={16} /> : <Search size={16} />}
                {loading ? 'LOADING...' : dbText.searchPrices}
              </button>

              <button
                className={styles.searchPricesBtn}
                onClick={fetchArtifactPrices}
                disabled={artifactLoading}
                style={{ marginTop: '0.5rem' }}
              >
                <img
                  src={getItemImageUrl('T8_ARTEFACT_2H_KNUCKLES_KEEPER')}
                  alt=""
                  style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }}
                />
                {artifactLoading ? 'LOADING...' : (locale === 'es' ? 'TRAER PRECIOS DE ARTEFACTOS' : 'GET ARTIFACT PRICES')}
              </button>

              {artifactDone && (
                <div className={styles.resultsBlock} style={{ marginTop: '0.5rem' }}>
                  <div className={styles.resultsHeader}>
                    <span className={styles.resultsStatus}>
                      <Check size={14} />
                      {locale === 'es' ? 'Precios de artefactos guardados.' : 'Artifact prices saved.'}
                    </span>
                  </div>
                </div>
              )}

              {priceSearchDone && (
                <div className={styles.resultsBlock}>
                  <div className={styles.resultsHeader}>
                    <span className={styles.resultsStatus}>
                      {priceResultRows.length > 0 && <Check size={14} />}
                      {priceResultRows.length > 0
                        ? `${dbText.foundPrices} - ${selectedPriceCity}`
                        : dbText.noPrices}
                    </span>
                    {priceResultRows.length > 0 && <span>{priceResultRows.length} entries</span>}
                  </div>

                  {priceResultRows.length > 0 && (
                    <div className={styles.resultsList}>
                      {priceResultRows.map(({ row, value }) => {
                        const selectedOption = RESOURCE_OPTIONS.find((option) => option.id === selectedPriceResource)!;
                        const label = locale === 'en' ? selectedOption.labelEn : selectedOption.labelEs;
                        const itemId = getResourceItemId(row.tier, selectedOption.api);

                        return (
                          <div key={row.tier} className={styles.resultRow}>
                            <div className={styles.resultItem}>
                              <img src={getItemImageUrl(itemId)} alt={`${label} ${row.tier}`} className={styles.resultImg} />
                              <div>
                                <div className={styles.resultTier}>{row.tier}</div>
                                <div className={styles.resultLabel}>{label}</div>
                              </div>
                            </div>
                            <strong>{fmt(value, localeCode)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setPricesModalOpen(false)}>
                {dbText.cancel}
              </button>
              <button
                className={styles.updateDbBtn}
                onClick={updateResourceDatabaseFromResults}
                disabled={priceResultRows.length === 0 || loading}
              >
                <Plus size={16} />
                {dbText.updateDatabase}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
