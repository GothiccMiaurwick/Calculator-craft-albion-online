'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import styles from './page.module.css';

import { SPECS_DATA } from '@/lib/specsData';
import { SwordIcon, HelmetIcon, ChestIcon, BootIcon, ShieldIcon, BagIcon, ShirtIcon, BookIcon } from '@/components/Icons';
import { getItemImageUrl } from '@/lib/items';
import { useApp } from '@/lib/AppContext';
import type { ResourceRow } from '@/lib/AppContext';
import { ARTIFACT_BASE_DATA } from '@/lib/artifacts';
import { getArtifactCategoryName, getArtifactNameByBaseId, getDisplayLocale, getItemNameByBaseId, getJournalDisplayName, getJournalWorkerName, getResourceLabel, translateLooseUiLabel } from '@/lib/i18n';

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
  },
} as const;

function getTierColor(tier: string): string {
  if (tier.startsWith('T4')) return '#fc97b7';
  if (tier.startsWith('T5')) return '#f97316';
  if (tier.startsWith('T6')) return '#a06f11';
  if (tier.startsWith('T7')) return '#eab308';
  return '#ffffff';
}

function fmt(n: number, localeCode: string) {
  if (n === 0) return '';
  return n.toLocaleString(localeCode);
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

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(fmt(value, localeCode));
    }
  }, [value, isFocused, localeCode]);

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
      value={localValue}
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
  } = useApp();
  const locale = calculatorPreferences.locale;
  const localeCode = getDisplayLocale(locale);
  const dbText = DB_TEXT[locale];
  const [tab, setTab] = useState<'recursos' | 'diarios' | 'artefactos' | 'specs'>('recursos');
  const [specsSearch, setSpecsSearch] = useState('');
  const [artifactSearch, setArtifactSearch] = useState('');
  const [expandedSubcats, setExpandedSubcats] = useState<Record<string, boolean>>({});

  const filteredArtifacts = useMemo(() => {
    return ARTIFACT_BASE_DATA
      .map((art) => {
        const categoryLabel = getArtifactCategoryName(art.category, locale);
        const linkedNameEs = getItemNameByBaseId(art.id, 'es');
        const linkedNameEn = getItemNameByBaseId(art.id, 'en');
        const displayName = getArtifactNameByBaseId(art.id, locale);
        const linkedDisplayName = locale === 'en' ? linkedNameEn : linkedNameEs;
        const searchCandidates = [
          art.name,
          displayName,
          art.id,
          categoryLabel,
          linkedNameEs,
          linkedNameEn,
        ];

        return {
          ...art,
          categoryLabel,
          displayName,
          linkedDisplayName,
          linkedNameEs,
          linkedNameEn,
          searchScore: getSearchScore(artifactSearch, searchCandidates),
          matches: searchCandidates.some((candidate) => matchesLooseSearch(artifactSearch, candidate)),
        };
      })
      .filter((art) => art.matches)
      .sort((a, b) => a.searchScore - b.searchScore || a.displayName.localeCompare(b.displayName));
  }, [artifactSearch, locale]);

  const artifactSuggestions = useMemo(() => {
    if (!artifactSearch.trim()) return [];
    return filteredArtifacts.slice(0, 8);
  }, [artifactSearch, filteredArtifacts]);

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
        <div>
          <h1 className={styles.title}>{dbText.title}</h1>
          <p className={styles.subtitle}>{dbText.subtitle}</p>
        </div>
        <div className={styles.tabGroup}>
          <button
            className={`${styles.tabBtn} ${tab === 'recursos' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('recursos')}
          >{dbText.resources}</button>
          <button
            className={`${styles.tabBtn} ${tab === 'artefactos' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('artefactos')}
          >{dbText.artifacts}</button>
          <button
            className={`${styles.tabBtn} ${tab === 'diarios' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('diarios')}
          >{dbText.journals}</button>
          <button
            className={`${styles.tabBtn} ${tab === 'specs' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('specs')}
          >{dbText.specs}</button>
        </div>
      </div>

      {tab === 'recursos' && (
        <div className={styles.tableWrap}>
          {artifactSuggestions.length > 0 && (
            <div className={styles.autocompleteList}>
              {artifactSuggestions.map((art) => (
                <button
                  key={`artifact-suggestion-${art.id}`}
                  type="button"
                  className={styles.autocompleteItem}
                  onClick={() => setArtifactSearch(art.linkedNameEn)}
                >
                  <img
                    src={getItemImageUrl(`T8_ARTEFACT_${art.id}`)}
                    alt={art.displayName}
                    className={styles.autocompleteImg}
                  />
                  <div className={styles.autocompleteMeta}>
                    <span className={styles.autocompleteTitle}>{art.displayName}</span>
                    <span className={styles.autocompleteSub}>
                      {art.linkedDisplayName}{art.linkedNameEs !== art.linkedNameEn ? ` · ${locale === 'en' ? art.linkedNameEs : art.linkedNameEn}` : ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {artifactSuggestions.length > 0 && (
            <div className={styles.autocompleteList}>
              {artifactSuggestions.map((art) => (
                <button
                  key={`artifact-suggestion-artifacts-${art.id}`}
                  type="button"
                  className={styles.autocompleteItem}
                  onClick={() => setArtifactSearch(art.linkedNameEn)}
                >
                  <img
                    src={getItemImageUrl(`T8_ARTEFACT_${art.id}`)}
                    alt={art.displayName}
                    className={styles.autocompleteImg}
                  />
                  <div className={styles.autocompleteMeta}>
                    <span className={styles.autocompleteTitle}>{art.displayName}</span>
                    <span className={styles.autocompleteSub}>
                      {art.linkedDisplayName}
                      {art.linkedDisplayName !== art.displayName ? ` · ${art.linkedDisplayName}` : ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>{dbText.level}</th>
                {(['tela', 'lingote', 'tablas', 'cuero'] as const).map(field => (
                  <th key={field} className={styles.th}>
                    <div className={styles.thContent}>
                      <img
                        src={getItemImageUrl(`T4_${RESOURCE_IMG_MAP[field]}`)}
                        alt={field}
                        className={styles.headerImg}
                      />
                      <span>{getResourceLabel(field, locale)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((row, i) => (
                <tr key={row.tier} className={styles.tr}>
                  <td className={styles.tdTier} style={{ color: getTierColor(row.tier) }}>
                    {row.tier}
                  </td>
                  {(['tela', 'lingote', 'tablas', 'cuero'] as const).map((field) => (
                    <td key={field} className={styles.tdInput}>
                      <PriceInput
                        className={styles.priceInput}
                        value={row[field]}
                        onChange={(val) => updateResource(i, field, val)}
                        placeholder="0"
                        localeCode={localeCode}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className={styles.tableWrap}>
          <div className={styles.specsInfo} style={{ marginBottom: '1.5rem' }}>
            <span className={styles.specsInfoIcon}>💎</span>
            {dbText.artifactInfo}
          </div>

          <input
            type="text"
            className={styles.specsSearch}
            placeholder={`🔍 ${dbText.artifactSearch}`}
            value={artifactSearch}
            onChange={(e) => setArtifactSearch(e.target.value)}
            style={{ marginBottom: '1.5rem' }}
          />

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: '300px' }}>{dbText.artifactColumn}</th>
                <th className={styles.th}>T4</th>
                <th className={styles.th}>T5</th>
                <th className={styles.th}>T6</th>
                <th className={styles.th}>T7</th>
                <th className={styles.th}>T8</th>
              </tr>
            </thead>
            <tbody>
              {filteredArtifacts.map((art) => (
                <tr key={art.id} className={styles.tr}>
                  <td className={styles.tdArtifactInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={getItemImageUrl(`T8_ARTEFACT_${art.id}`)}
                        alt={art.displayName}
                        className={styles.artifactRoundImg}
                      />
                      <div>
                        <div className={styles.artifactName}>{art.displayName}</div>
                        <div className={styles.artifactCat}>{art.linkedDisplayName}</div>
                        <div className={styles.artifactCat}>{getArtifactCategoryName(art.category, locale)}</div>
                      </div>
                    </div>
                  </td>
                  {[4, 5, 6, 7, 8].map(tierValue => {
                    const fullId = `T${tierValue}_ARTEFACT_${art.id}`;
                    return (
                      <td key={tierValue} className={styles.tdInput}>
                        <PriceInput
                          className={styles.priceInput}
                          value={artifactPrices[fullId] || 0}
                          onChange={(val) => updateArtifactPrice(fullId, val)}
                          placeholder="0"
                          localeCode={localeCode}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
  );
}
