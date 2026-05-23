'use client';

import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import Calculator from '@/components/Calculator';
import Planner from '@/components/Planner';
import SpecialtyTools from '@/components/SpecialtyTools';
import styles from './page.module.css';

export default function Home() {
  const { selectedItem, currentView, calculatorPreferences, setCurrentView } = useApp();
  const locale = calculatorPreferences.locale;

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
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.homeIcon}>⌂</span>
          <span className={styles.topTitle}>{t(locale, 'pleaseSelectItemToCraft')}</span>
        </div>
        <span className={styles.synced}><span className={styles.dot} /> {t(locale, 'synced')}</span>
      </div>

      <div className={styles.hero}>
        <div className={styles.logoWrap}>
          <svg className={styles.starIcon} viewBox="0 0 128 128" aria-hidden="true">
            <path d="M64 2 C72 44 78 50 84 56 C100 72 126 64 126 64 C126 64 100 72 84 88 C78 94 72 100 64 126 C56 100 50 94 44 88 C28 72 2 64 2 64 C2 64 28 72 44 56 C50 50 56 44 64 2 Z" fill="#FC97B7" stroke="#402934" stroke-width="5" stroke-linejoin="round"/>
            <polygon points="64,52 76,64 64,76 52,64" fill="#D1F985"/>
          </svg>
        </div>
        <h1 className={styles.logoTitle}>Mochi Craft</h1>
        <div className={styles.divider} />
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={() => setCurrentView('calculator')}>{t(locale, 'calculator')}</button>
          <button className={styles.btnSecondary} onClick={() => setCurrentView('refiner')}>{t(locale, 'refiner')}</button>
          <button className={styles.btnSecondary} onClick={() => setCurrentView('enchanter')}>{t(locale, 'enchanter')}</button>
          <button className={styles.btnSecondary} onClick={() => setCurrentView('cooking')}>{t(locale, 'cooking')}</button>
        </div>
        <p className={styles.tagline}>&quot;crafted with love &lt;3&quot;</p>
      </div>
    </div>
  );
}
