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
          <img src="/iconPage.png" className={styles.starIcon} alt="" aria-hidden="true" />
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
