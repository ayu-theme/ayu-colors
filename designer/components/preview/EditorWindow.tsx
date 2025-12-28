'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'
import { CODE_SAMPLES, LANGUAGE_ORDER, type LanguageKey } from '../../lib/code-samples'
import { buildShikiTheme } from '../../lib/shiki-theme'
import type { ThemeColors } from '../../hooks/useColors'
import styles from './EditorWindow.module.css'

interface EditorWindowProps {
  syntaxColors: Record<string, string>
  themeColors: ThemeColors
}

// Map language keys to file extensions and colors
const FILE_INFO: Record<LanguageKey, { ext: string; colorKey: string; name: string }> = {
  typescript: { ext: 'ts', colorKey: 'func', name: 'index' },
  python: { ext: 'py', colorKey: 'string', name: 'main' },
  rust: { ext: 'rs', colorKey: 'keyword', name: 'lib' },
  go: { ext: 'go', colorKey: 'entity', name: 'main' },
  html: { ext: 'html', colorKey: 'tag', name: 'index' },
  css: { ext: 'css', colorKey: 'constant', name: 'styles' },
  shell: { ext: 'sh', colorKey: 'special', name: 'deploy' },
  json: { ext: 'json', colorKey: 'string', name: 'package' },
}

// Mock file colors for non-openable files
const MOCK_FILE_COLORS: Record<string, string> = {
  md: 'entity',
  yml: 'keyword',
  yaml: 'keyword',
  toml: 'special',
  lock: 'comment',
  gitignore: 'comment',
}

interface FileNode {
  type: 'file'
  name: string
  ext: string
  lang?: LanguageKey
}

interface FolderNode {
  type: 'folder'
  name: string
  expanded: boolean
  children: TreeNode[]
}

type TreeNode = FileNode | FolderNode

// File tree structure - openable files first, then mock files
const FILE_TREE: TreeNode[] = [
  // Openable source files
  { type: 'file', name: 'index', ext: 'ts', lang: 'typescript' },
  { type: 'file', name: 'main', ext: 'py', lang: 'python' },
  { type: 'file', name: 'lib', ext: 'rs', lang: 'rust' },
  { type: 'file', name: 'main', ext: 'go', lang: 'go' },
  { type: 'file', name: 'index', ext: 'html', lang: 'html' },
  { type: 'file', name: 'styles', ext: 'css', lang: 'css' },
  { type: 'file', name: 'deploy', ext: 'sh', lang: 'shell' },
  { type: 'file', name: 'package', ext: 'json', lang: 'json' },
  // Mock folders and files
  { type: 'folder', name: 'tests', expanded: false, children: [
    { type: 'file', name: 'test_main', ext: 'py' },
    { type: 'file', name: 'integration', ext: 'rs' },
  ]},
  { type: 'folder', name: '.github', expanded: false, children: [
    { type: 'file', name: 'ci', ext: 'yml' },
  ]},
  { type: 'file', name: 'README', ext: 'md' },
  { type: 'file', name: 'Cargo', ext: 'toml' },
  { type: 'file', name: '.gitignore', ext: 'gitignore' },
  { type: 'file', name: 'package-lock', ext: 'lock' },
]

// Cache the highlighter at module level
let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [],
      langs: LANGUAGE_ORDER.map(key => CODE_SAMPLES[key].lang),
    })
  }
  return highlighterPromise
}

export function EditorWindow({ syntaxColors, themeColors }: EditorWindowProps) {
  const uiBg = themeColors['ui.bg']
  const uiFg = themeColors['ui.fg']
  const uiLine = themeColors['ui.line']
  const editorBg = themeColors['editor.bg']
  const editorFg = themeColors['editor.fg']

  const [activeTab, setActiveTab] = useState<LanguageKey>('typescript')
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null)
  const [html, setHtml] = useState<string>('')
  const themeIdRef = useRef(0)

  // VCS colors
  const vcsAdded = syntaxColors?.string || '#7FD962'
  const vcsModified = syntaxColors?.keyword || '#59C2FF'
  const vcsDeleted = syntaxColors?.error || '#D95757'

  // Initialize highlighter
  useEffect(() => {
    getHighlighter().then(setHighlighter)
  }, [])

  // Build theme from current colors
  const theme = useMemo(
    () => buildShikiTheme(syntaxColors, editorBg, editorFg),
    [syntaxColors, editorBg, editorFg]
  )

  // Highlight code when theme, language, or highlighter changes
  useEffect(() => {
    if (!highlighter) return

    const themeId = `ayu-dynamic-${++themeIdRef.current}`
    const themedTheme = { ...theme, name: themeId }

    highlighter.loadTheme(themedTheme).then(() => {
      const sample = CODE_SAMPLES[activeTab]
      const result = highlighter.codeToHtml(sample.code, {
        lang: sample.lang,
        theme: themeId,
      })
      setHtml(result)
    })
  }, [highlighter, theme, activeTab])

  // Count lines for line numbers
  const lineCount = CODE_SAMPLES[activeTab].code.split('\n').length

  // Get open tabs (show a subset of languages as tabs)
  const openTabs: LanguageKey[] = ['typescript', 'python', 'rust', 'css']

  return (
    <div className={styles.window} style={{background: uiBg}}>
      {/* macOS Title Bar */}
      <div className={styles.titleBar} style={{  borderBottom: `1px solid ${uiLine}` }}>
        <div className={styles.trafficLights}>
          <span className={`${styles.trafficLight} ${styles.trafficLightRed}`} />
          <span className={`${styles.trafficLight} ${styles.trafficLightYellow}`} />
          <span className={`${styles.trafficLight} ${styles.trafficLightGreen}`} />
        </div>
        <span className={styles.windowTitle} style={{ color: uiFg }}>ayu-preview</span>
        <div className={styles.titleBarSpacer} />
      </div>

      <div className={styles.main}>
        {/* Sidebar */}
        <div className={styles.sidebar} style={{ borderRight: `1px solid ${uiLine}` }}>
          <div className={styles.sidebarHeader} style={{ color: uiFg }}>EXPLORER</div>
          <div className={styles.fileTree}>
            {FILE_TREE.map((item, i) => {
              if (item.type === 'folder') {
                return (
                  <div key={i}>
                    <div className={styles.folder} style={{ color: uiFg }}>
                      <span className={styles.folderIcon}>{item.expanded ? '▼' : '▶'}</span>
                      {item.name}
                    </div>
                    {item.expanded && item.children?.map((child, j) => {
                      if (child.type !== 'file') return null
                      const colorKey = child.lang ? FILE_INFO[child.lang].colorKey : MOCK_FILE_COLORS[child.ext] || 'comment'
                      return (
                        <div
                          key={j}
                          className={`${styles.file} ${styles.fileNested}`}
                          style={{ color: uiFg }}
                        >
                          <span className={styles.fileIcon} style={{ color: syntaxColors?.[colorKey] || uiFg }}>●</span>
                          {child.name}.{child.ext}
                        </div>
                      )
                    })}
                  </div>
                )
              }
              const isOpenable = !!item.lang
              const isActive = item.lang === activeTab
              const colorKey = item.lang ? FILE_INFO[item.lang].colorKey : MOCK_FILE_COLORS[item.ext] || 'comment'
              return isOpenable ? (
                <button
                  key={i}
                  className={styles.file}
                  style={{
                    color: isActive ? editorFg : uiFg,
                    background: isActive ? uiLine : 'transparent',
                  }}
                  onClick={() => setActiveTab(item.lang!)}
                >
                  <span className={styles.fileIcon} style={{ color: syntaxColors?.[colorKey] || uiFg }}>●</span>
                  {item.name}.{item.ext}
                </button>
              ) : (
                <div key={i} className={styles.file} style={{ color: uiFg }}>
                  <span className={styles.fileIcon} style={{ color: syntaxColors?.[colorKey] || uiFg }}>●</span>
                  {item.name === '.gitignore' ? item.name : `${item.name}.${item.ext}`}
                </div>
              )
            })}
          </div>
        </div>

        {/* Editor Area */}
        <div className={styles.editorArea}>
          {/* Tab Bar */}
          <div className={styles.tabBar} style={{ '--tab-bar-line-color': uiLine } as React.CSSProperties}>
            {openTabs.map(lang => (
              <button
                key={lang}
                className={`${styles.tab} ${activeTab === lang ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(lang)}
                style={{
                  background: activeTab === lang ? editorBg : 'transparent',
                  color: activeTab === lang ? editorFg : uiFg,
                  borderTop: activeTab === lang ? `2px solid ${syntaxColors?.keyword || '#E6B450'}` : '2px solid transparent',
                  borderRight: `1px solid ${uiLine}`,
                }}
              >
                <span
                  className={styles.tabIcon}
                  style={{ color: syntaxColors?.[FILE_INFO[lang].colorKey] || uiFg }}
                >
                  ●
                </span>
                {CODE_SAMPLES[lang].label.toLowerCase()}.{FILE_INFO[lang].ext}
                <span className={styles.tabClose} style={{ color: uiFg }}>×</span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className={styles.editor} style={{ background: editorBg }}>
            <div className={styles.editorContent}>
              <div className={styles.lineNumbers} style={{ color: themeColors['editor.lineNumber.normal'] }}>
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className={styles.lineNumber}>{i + 1}</div>
                ))}
              </div>
              <div
                className={styles.codeArea}
                style={{ color: editorFg }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar} style={{  borderTop: `1px solid ${uiLine}` }}>
        <div className={styles.statusLeft}>
          <span className={styles.statusItem} style={{ color: uiFg }}>
            <span style={{ color: syntaxColors?.keyword || '#E6B450' }}>●</span>
            main
          </span>
          <span className={styles.vcsStatus}>
            <span style={{ color: vcsAdded }}>+12</span>
            <span style={{ color: vcsModified }}>~3</span>
            <span style={{ color: vcsDeleted }}>-2</span>
          </span>
        </div>
        <div className={styles.statusCenter} style={{ color: uiFg }}>
          {CODE_SAMPLES[activeTab].label}
        </div>
        <div className={styles.statusRight} style={{ color: uiFg }}>
          Ln 1, Col 1
        </div>
      </div>
    </div>
  )
}
