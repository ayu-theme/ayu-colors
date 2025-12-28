'use client'

import { type ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useThemeColors } from '../../hooks/useColors'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content sideOffset={8}>
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

interface ColorTooltipContentProps {
  oklchStr: string
  apca: string
}

export function ColorTooltipContent({ oklchStr, apca }: ColorTooltipContentProps) {
  const themeColors = useThemeColors()

  return (
    <div style={{
      padding: '4px 8px',
      borderRadius: 4,
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
      background: themeColors['ui.bg'],
      border: `1px solid ${themeColors['ui.line']}`,
      color: themeColors['editor.fg'],
    }}>
      {oklchStr} · Lc {apca}
    </div>
  )
}
