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
            <defs>
              <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="20%" stop-color="#e0e0e0"/>
                <stop offset="40%" stop-color="#a0a0a0"/>
                <stop offset="50%" stop-color="#d8d8d8"/>
                <stop offset="65%" stop-color="#888888"/>
                <stop offset="80%" stop-color="#c0c0c0"/>
                <stop offset="100%" stop-color="#666666"/>
              </linearGradient>
              <radialGradient id="shine" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
                <stop offset="30%" stop-color="#ffffff" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <path d="M64 6 L78 48 L124 48 L88 76 L102 120 L64 94 L26 120 L40 76 L4 48 L50 48 Z"
                  fill="url(#chrome)" stroke="#777" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M64 6 L78 48 L124 48 L88 76 L102 120 L64 94 L26 120 L40 76 L4 48 L50 48 Z"
                  fill="url(#shine)"/>
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
