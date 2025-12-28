'use client'

import styles from './EmptyState.module.css'

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path
            d="M24 16V24M24 32V32.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className={styles.title}>No color selected</div>
      <div className={styles.description}>
        Click on a color swatch to edit it, or use <kbd className={styles.kbd}>↑</kbd> <kbd className={styles.kbd}>↓</kbd> to navigate
      </div>
    </div>
  )
}
