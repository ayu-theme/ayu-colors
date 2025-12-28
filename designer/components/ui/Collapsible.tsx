'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import styles from './Collapsible.module.css'

interface CollapsibleProps {
  title: string
  badge?: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onToggle?: (open: boolean) => void
  children: ReactNode
}

export function Collapsible({
  title,
  badge,
  defaultOpen = true,
  open: controlledOpen,
  onToggle,
  children,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [children])

  const handleToggle = () => {
    const newOpen = !isOpen
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onToggle?.(newOpen)
  }

  return (
    <div className={styles.collapsible}>
      <button
        className={styles.trigger}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M4 3L8 6L4 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.title}>{title}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </button>
      <div
        className={styles.content}
        style={{
          height: isOpen ? height : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className={styles.inner}>
          {children}
        </div>
      </div>
    </div>
  )
}
