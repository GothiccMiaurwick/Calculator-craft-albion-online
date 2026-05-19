'use client';

import { useMemo, useState } from 'react';
import { X, Hash, LineChart, Zap, ChevronDown, MoonStar } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { CATEGORIES, TIERS, ENCHANTS, TreeItem } from '@/lib/items';
import { getFallbackRecipe } from '@/lib/fallbacks';
import { resolvePrice } from '@/lib/calcEngine';
import { getTreeItemName, t } from '@/lib/i18n';
import styles from './AddCraftModal.module.css';
import type { PlannerMaterialSnapshot, PlannerPriceSnapshot } from '@/lib/AppContext';

interface AddCraftModalProps {
  onClose: () => void;
  initialTreeItem?: TreeItem | null;
  initialTier?: number;
  initialEnchant?: number;
  initialSalePrice?: number;
  initialMaterialsSnapshot?: PlannerMaterialSnapshot[];
  initialMaterialPricesSnapshot?: PlannerPriceSnapshot;
  onAdded?: () => void;
}

export default function AddCraftModal({
  onClose,
  initialTreeItem,
  initialTier,
  initialEnchant,
  initialSalePrice,
  initialMaterialsSnapshot,
  initialMaterialPricesSnapshot,
  onAdded,
}: AddCraftModalProps) {
  const { addPlannerItem, selectedTreeItem, calculatorPreferences, resources, artifactPrices } = useApp();
  const locale = calculatorPreferences.locale;

  const allItems: TreeItem[] = useMemo(
    () => CATEGORIES.flatMap(cat => cat.subcategories.flatMap(sub => sub.items)),
    []
  );

  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(initialTreeItem ?? selectedTreeItem);
  const [tier, setTier] = useState(initialTier ?? 4);
  const [enchant, setEnchant] = useState(initialEnchant ?? 0);
  const [quantityInput, setQuantityInput] = useState('');
  const [returnRate, setReturnRate] = useState(calculatorPreferences.returnRate);
  const [useFocus, setUseFocus] = useState(calculatorPreferences.useFocus);
  const [blackMarket, setBlackMarket] = useState(calculatorPreferences.blackMarket);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const handleAdd = () => {
    if (!selectedItem) return;

    const finalItem = selectedItem.tiers[tier][enchant];
    const quantity = Math.max(1, parseInt(quantityInput, 10) || 1);
    const initialItemId =
      initialTreeItem && initialTier !== undefined && initialEnchant !== undefined
        ? initialTreeItem.tiers[initialTier][initialEnchant].id
        : null;
    const useInitialSnapshots = initialItemId === finalItem.id;
    const canonicalMaterials = getFallbackRecipe(finalItem.id);
    const initialPriceById =
      useInitialSnapshots && Array.isArray(initialMaterialsSnapshot)
        ? initialMaterialsSnapshot.reduce<PlannerPriceSnapshot>((acc, mat) => {
            acc[mat.id] = initialMaterialPricesSnapshot?.[mat.id] ?? resolvePrice(mat.id, resources, artifactPrices);
            return acc;
          }, {})
        : {};
    const materialsSnapshot = canonicalMaterials;
    const materialPricesSnapshot =
      useInitialSnapshots && initialMaterialPricesSnapshot && Object.keys(initialMaterialPricesSnapshot).length > 0
        ? materialsSnapshot.reduce<PlannerPriceSnapshot>((acc, mat) => {
            acc[mat.id] = initialPriceById[mat.id] ?? resolvePrice(mat.id, resources, artifactPrices);
            return acc;
          }, {})
        : materialsSnapshot.reduce<PlannerPriceSnapshot>((acc, mat) => {
            acc[mat.id] = resolvePrice(mat.id, resources, artifactPrices);
            return acc;
          }, {});

    addPlannerItem({
      item: finalItem,
      quantity,
      tier,
      enchant,
      salePriceSnapshot: useInitialSnapshots ? (initialSalePrice ?? 0) : 0,
      returnRate,
      useFocus,
      blackMarket,
      taxRate: calculatorPreferences.tax,
      materialsSnapshot,
      materialPricesSnapshot,
      isDone: false,
    });

    onAdded?.();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t(locale, 'addItemToPlanner')}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label={locale === 'es' ? 'Cerrar' : 'Close'}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>{t(locale, 'selectItem')}</label>
          <div className={styles.selectWrapper}>
            <button
              className={styles.selectBtn}
              onClick={() => setShowItemDropdown(!showItemDropdown)}
            >
              <span className={styles.selectedText}>
                {selectedItem ? getTreeItemName(selectedItem, locale).toUpperCase() : t(locale, 'selectItemPlaceholder')}
              </span>
              <ChevronDown size={18} className={styles.chevron} />
            </button>

            {showItemDropdown && (
              <div className={styles.dropdown}>
                {allItems.map(item => (
                  <div
                    key={item.id}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowItemDropdown(false);
                    }}
                  >
                    {getTreeItemName(item, locale)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>{t(locale, 'tier')}</label>
            <div className={styles.pills}>
              {TIERS.map(tierValue => (
                <button
                  key={tierValue}
                  className={`${styles.pill} ${tier === tierValue ? styles.pillActive : ''}`}
                  onClick={() => setTier(tierValue)}
                >
                  {tierValue}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.col}>
            <label className={styles.label}>{t(locale, 'enchant')}</label>
            <div className={styles.pills}>
              {ENCHANTS.map(enchantValue => (
                <button
                  key={enchantValue}
                  className={`${styles.pill} ${enchant === enchantValue ? styles.pillActive : ''}`}
                  onClick={() => setEnchant(enchantValue)}
                >
                  {enchantValue}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>{t(locale, 'quantity')}</label>
            <div className={styles.inputWrap}>
              <Hash size={16} className={styles.inputIcon} />
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={quantityInput}
                placeholder="1"
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '' || /^\d+$/.test(raw)) {
                    setQuantityInput(raw);
                  }
                }}
              />
            </div>
          </div>
          <div className={styles.col}>
            <label className={styles.label}>{t(locale, 'returnRate')} %</label>
            <div className={styles.inputWrap}>
              <LineChart size={16} className={styles.inputIcon} />
              <input
                type="number"
                className={styles.input}
                value={returnRate}
                step="0.1"
                onChange={(e) => setReturnRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className={styles.focusCard}>
          <div className={styles.focusLeft}>
            <div className={styles.focusIconWrap}>
              <Zap size={20} />
            </div>
            <div>
              <div className={styles.focusTitle}>{t(locale, 'useFocus')}</div>
              <div className={styles.focusSub}>{t(locale, 'useSavedConfiguration')}</div>
            </div>
          </div>
          <div
            className={`${styles.toggle} ${useFocus ? styles.toggleOn : ''}`}
            onClick={() => setUseFocus(!useFocus)}
          >
            <div className={styles.toggleCircle} />
          </div>
        </div>

        <div className={styles.focusCard}>
          <div className={styles.focusLeft}>
            <div className={styles.focusIconWrap}>
              <MoonStar size={18} />
            </div>
            <div>
              <div className={styles.focusTitle}>{t(locale, 'blackMarket')}</div>
              <div className={styles.focusSub}>{t(locale, 'markForBlackMarket')}</div>
            </div>
          </div>
          <div
            className={`${styles.toggle} ${blackMarket ? styles.toggleOn : ''}`}
            onClick={() => setBlackMarket(!blackMarket)}
          >
            <div className={styles.toggleCircle} />
          </div>
        </div>

        <div className={styles.cityButtons}>
          <button
            className={`${styles.cityBtn} ${!useFocus ? styles.cityBtnActive : ''}`}
            onClick={() => setUseFocus(false)}
          >
            {t(locale, 'cityWithoutFocus')}
          </button>
          <button
            className={`${styles.cityBtn} ${useFocus ? styles.cityBtnActive : ''}`}
            onClick={() => setUseFocus(true)}
          >
            {t(locale, 'cityWithFocus')}
          </button>
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleAdd}
          disabled={!selectedItem}
        >
          {t(locale, 'addCraft')}
        </button>
      </div>
    </div>
  );
}
