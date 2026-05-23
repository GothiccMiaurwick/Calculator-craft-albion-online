'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Package, Percent, Wallet } from 'lucide-react';
import { FlameIcon, SparkleIcon, ChefIcon } from './Icons';
import { AppView, useApp } from '@/lib/AppContext';
import { getDisplayLocale, t } from '@/lib/i18n';
import styles from './SpecialtyTools.module.css';

type ToolView = Extract<AppView, 'refiner' | 'enchanter' | 'cooking'>;

const RESOURCE_NAMES = {
  fiber: { es: 'Fibra / Tela', en: 'Fiber / Cloth' },
  ore: { es: 'Mineral / Lingote', en: 'Ore / Bar' },
  wood: { es: 'Madera / Tablas', en: 'Wood / Planks' },
  hide: { es: 'Piel / Cuero', en: 'Hide / Leather' },
  stone: { es: 'Piedra / Bloque', en: 'Stone / Block' },
};

const COOKING_PRESETS = {
  stew: { es: 'Estofado', en: 'Stew', ingredients: ['Carne', 'Harina', 'Zanahoria'] },
  pie: { es: 'Pastel', en: 'Pie', ingredients: ['Harina', 'Carne', 'Mantequilla'] },
  omelette: { es: 'Omelette', en: 'Omelette', ingredients: ['Huevo', 'Leche', 'Hierbas'] },
  salad: { es: 'Ensalada', en: 'Salad', ingredients: ['Repollo', 'Zanahoria', 'Hierbas'] },
};

function toNumber(value: string) {
  const trimmed = value.trim();
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed.replace(/\.(?=\d{3}(\D|$))/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, locale: 'es' | 'en') {
  return new Intl.NumberFormat(getDisplayLocale(locale), { maximumFractionDigits: 0 }).format(Math.round(value));
}

function formatPercent(value: number, locale: 'es' | 'en') {
  return new Intl.NumberFormat(getDisplayLocale(locale), { maximumFractionDigits: 1 }).format(value);
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.inputWrap}>
        <input value={value} onChange={(event) => onChange(event.target.value)} inputMode="decimal" />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'gold' }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong className={tone ? styles[tone] : undefined}>{value}</strong>
    </div>
  );
}

export default function SpecialtyTools({ view }: { view: ToolView }) {
  const { calculatorPreferences } = useApp();
  const locale = calculatorPreferences.locale;
  const [quantity, setQuantity] = useState('100');
  const [returnRate, setReturnRate] = useState(String(calculatorPreferences.returnRate));
  const [tax, setTax] = useState(String(calculatorPreferences.tax));

  const [resource, setResource] = useState<keyof typeof RESOURCE_NAMES>('ore');
  const [rawPrice, setRawPrice] = useState('800');
  const [previousPrice, setPreviousPrice] = useState('0');
  const [outputPrice, setOutputPrice] = useState('1200');

  const [baseItemPrice, setBaseItemPrice] = useState('10000');
  const [essencePrice, setEssencePrice] = useState('250');
  const [essenceAmount, setEssenceAmount] = useState('96');
  const [enchantedPrice, setEnchantedPrice] = useState('42000');

  const [dish, setDish] = useState<keyof typeof COOKING_PRESETS>('stew');
  const [ingredientA, setIngredientA] = useState('900');
  const [ingredientB, setIngredientB] = useState('650');
  const [ingredientC, setIngredientC] = useState('450');
  const [foodPrice, setFoodPrice] = useState('3200');

  const common = {
    quantity: toNumber(quantity),
    returnRate: toNumber(returnRate) / 100,
    tax: toNumber(tax) / 100,
  };

  const result = useMemo(() => {
    if (view === 'refiner') {
      const rawUnits = common.quantity;
      const previousUnits = previousPrice === '0' ? 0 : common.quantity * 2;
      const grossCost = rawUnits * toNumber(rawPrice) + previousUnits * toNumber(previousPrice);
      const returned = grossCost * common.returnRate;
      const investment = Math.max(0, grossCost - returned);
      const sale = common.quantity * toNumber(outputPrice);
      const netSale = sale * (1 - common.tax);
      const profit = netSale - investment;
      return { investment, netSale, profit, returned };
    }

    if (view === 'enchanter') {
      const essenceCost = common.quantity * toNumber(essenceAmount) * toNumber(essencePrice);
      const baseCost = common.quantity * toNumber(baseItemPrice);
      const investment = baseCost + essenceCost;
      const sale = common.quantity * toNumber(enchantedPrice);
      const netSale = sale * (1 - common.tax);
      const profit = netSale - investment;
      return { investment, netSale, profit, returned: essenceCost };
    }

    const ingredientCost = common.quantity * (toNumber(ingredientA) + toNumber(ingredientB) + toNumber(ingredientC));
    const returned = ingredientCost * common.returnRate;
    const investment = Math.max(0, ingredientCost - returned);
    const sale = common.quantity * toNumber(foodPrice);
    const netSale = sale * (1 - common.tax);
    const profit = netSale - investment;
    return { investment, netSale, profit, returned };
  }, [
    baseItemPrice,
    common.quantity,
    common.returnRate,
    common.tax,
    enchantedPrice,
    essenceAmount,
    essencePrice,
    foodPrice,
    ingredientA,
    ingredientB,
    ingredientC,
    outputPrice,
    previousPrice,
    rawPrice,
    view,
  ]);

  const margin = result.investment > 0 ? (result.profit / result.investment) * 100 : 0;
  const isProfit = result.profit >= 0;
  const adjustmentLabel =
    view === 'enchanter'
      ? locale === 'es' ? 'COSTO ENCANTAMIENTO' : 'ENCHANT COST'
      : locale === 'es' ? 'RETORNO ESTIMADO' : 'ESTIMATED RETURN';
  const title =
    view === 'refiner' ? t(locale, 'refiner') : view === 'enchanter' ? t(locale, 'enchanter') : t(locale, 'cooking');
  const icon =
    view === 'refiner' ? <FlameIcon size={22} /> : view === 'enchanter' ? <SparkleIcon size={22} /> : <ChefIcon size={22} />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <span className={styles.kicker}>{t(locale, 'synced')}</span>
          <h1>{title}</h1>
          <p>
            {locale === 'es'
              ? 'Calcula inversion, retorno, impuestos y ganancia neta con la misma paleta cozy del clon.'
              : 'Calculate investment, returns, taxes and net profit with the same cozy clone palette.'}
          </p>
        </div>
        <div className={styles.headerIcon}>{icon}</div>
      </header>

      <section className={styles.controls}>
        <Field label={t(locale, 'quantity')} value={quantity} onChange={setQuantity} />
        <Field label={t(locale, 'returnRate')} value={returnRate} onChange={setReturnRate} suffix="%" />
        <Field label={locale === 'es' ? 'IMPUESTO' : 'TAX'} value={tax} onChange={setTax} suffix="%" />
      </section>

      {view === 'refiner' && (
        <section className={styles.panel}>
          <div className={styles.sectionTitle}>
            <Package size={18} />
            <span>{locale === 'es' ? 'CADENA DE REFINADO' : 'REFINING CHAIN'}</span>
          </div>
          <div className={styles.segmented}>
            {Object.entries(RESOURCE_NAMES).map(([key, label]) => (
              <button
                key={key}
                className={resource === key ? styles.activeSegment : undefined}
                onClick={() => setResource(key as keyof typeof RESOURCE_NAMES)}
              >
                {label[locale]}
              </button>
            ))}
          </div>
          <div className={styles.grid}>
            <Field label={locale === 'es' ? 'PRECIO RECURSO ACTUAL' : 'CURRENT RESOURCE PRICE'} value={rawPrice} onChange={setRawPrice} />
            <Field label={locale === 'es' ? 'PRECIO PROCESADO ANTERIOR' : 'PREVIOUS REFINED PRICE'} value={previousPrice} onChange={setPreviousPrice} />
            <Field label={locale === 'es' ? 'PRECIO DE VENTA REFINADO' : 'REFINED SALE PRICE'} value={outputPrice} onChange={setOutputPrice} />
          </div>
        </section>
      )}

      {view === 'enchanter' && (
        <section className={styles.panel}>
          <div className={styles.sectionTitle}>
            <SparkleIcon size={18} />
            <span>{locale === 'es' ? 'MEJORA DE ENCANTAMIENTO' : 'ENCHANTMENT UPGRADE'}</span>
          </div>
          <div className={styles.flow}>
            <span>.0 / .1 / .2</span>
            <ArrowRight size={18} />
            <strong>{locale === 'es' ? 'OBJETO ENCANTADO' : 'ENCHANTED ITEM'}</strong>
          </div>
          <div className={styles.grid}>
            <Field label={locale === 'es' ? 'PRECIO ITEM BASE' : 'BASE ITEM PRICE'} value={baseItemPrice} onChange={setBaseItemPrice} />
            <Field label={locale === 'es' ? 'PRECIO RUNA / ALMA / RELIQUIA' : 'RUNE / SOUL / RELIC PRICE'} value={essencePrice} onChange={setEssencePrice} />
            <Field label={locale === 'es' ? 'CANTIDAD POR ITEM' : 'AMOUNT PER ITEM'} value={essenceAmount} onChange={setEssenceAmount} />
            <Field label={t(locale, 'salePrice')} value={enchantedPrice} onChange={setEnchantedPrice} />
          </div>
        </section>
      )}

      {view === 'cooking' && (
        <section className={styles.panel}>
          <div className={styles.sectionTitle}>
            <ChefIcon size={18} />
            <span>{locale === 'es' ? 'RECETA DE COCINA' : 'COOKING RECIPE'}</span>
          </div>
          <div className={styles.segmented}>
            {Object.entries(COOKING_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={dish === key ? styles.activeSegment : undefined}
                onClick={() => setDish(key as keyof typeof COOKING_PRESETS)}
              >
                {preset[locale]}
              </button>
            ))}
          </div>
          <div className={styles.grid}>
            {COOKING_PRESETS[dish].ingredients.map((ingredient, index) => (
              <Field
                key={ingredient}
                label={`${locale === 'es' ? 'INGREDIENTE' : 'INGREDIENT'} ${index + 1}: ${ingredient.toUpperCase()}`}
                value={index === 0 ? ingredientA : index === 1 ? ingredientB : ingredientC}
                onChange={index === 0 ? setIngredientA : index === 1 ? setIngredientB : setIngredientC}
              />
            ))}
            <Field label={t(locale, 'salePrice')} value={foodPrice} onChange={setFoodPrice} />
          </div>
        </section>
      )}

      <section className={styles.summary}>
        <Metric label={t(locale, 'investment')} value={formatNumber(result.investment, locale)} />
        <Metric label={adjustmentLabel} value={formatNumber(result.returned, locale)} tone="gold" />
        <Metric label={t(locale, 'totalSaleValue')} value={formatNumber(result.netSale, locale)} />
        <Metric label={t(locale, 'netProfit')} value={formatNumber(result.profit, locale)} tone={isProfit ? 'good' : 'bad'} />
        <Metric label={t(locale, 'profitMargin')} value={`${formatPercent(margin, locale)}%`} tone={isProfit ? 'good' : 'bad'} />
        <div className={styles.callout}>
          <Percent size={16} />
          <span>
            {locale === 'es'
              ? view === 'enchanter'
                ? 'El profit usa venta neta despues de impuesto y descuenta item base mas materiales de encanto.'
                : 'El profit usa venta neta despues de impuesto y descuenta el valor estimado del retorno.'
              : view === 'enchanter'
                ? 'Profit uses net sale after tax and subtracts the base item plus enchant materials.'
                : 'Profit uses net sale after tax and subtracts the estimated return-adjusted cost.'}
          </span>
        </div>
      </section>

      <section className={styles.auditStrip}>
        <Wallet size={16} />
        <span>
          {locale === 'es'
            ? 'Ajusta los precios con tus datos del mercado para igualar tus rutas de Albion Printer.'
            : 'Tune prices with your market data to match your Albion Printer routes.'}
        </span>
      </section>
    </div>
  );
}
