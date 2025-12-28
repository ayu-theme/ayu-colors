import type { ThemeRegistration } from 'shiki'

interface SyntaxColors {
  tag?: string
  func?: string
  entity?: string
  string?: string
  regexp?: string
  markup?: string
  keyword?: string
  special?: string
  comment?: string
  constant?: string
  operator?: string
}

// Helper to apply alpha to a hex color
function withAlpha(hex: string | undefined, alpha: number): string | undefined {
  if (!hex) return undefined
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Builds a Shiki theme from ayu syntax colors.
 * Maps semantic color tokens to TextMate scopes following the official ayu theme mappings.
 */
export function buildShikiTheme(
  syntaxColors: SyntaxColors,
  editorBg: string,
  editorFg: string
): ThemeRegistration {
  const { tag, func, entity, string, regexp, markup, keyword, special, comment, constant, operator } = syntaxColors

  return {
    name: 'ayu-dynamic',
    type: 'dark',
    colors: {
      'editor.background': editorBg,
      'editor.foreground': editorFg,
    },
    tokenColors: [
      // Default foreground
      {
        settings: {
          foreground: editorFg,
        },
      },

      // Comments
      {
        name: 'Comment',
        scope: ['comment'],
        settings: {
          fontStyle: 'italic',
          foreground: comment,
        },
      },

      // Strings
      {
        name: 'String',
        scope: ['string', 'constant.other.symbol'],
        settings: {
          foreground: string,
        },
      },
      {
        name: 'Regular Expressions and Escape Characters',
        scope: ['string.regexp', 'constant.character', 'constant.other'],
        settings: {
          foreground: regexp,
        },
      },

      // Numbers and constants
      {
        name: 'Number',
        scope: ['constant.numeric'],
        settings: {
          foreground: constant,
        },
      },
      {
        name: 'Built-in constants',
        scope: ['constant.language'],
        settings: {
          foreground: constant,
        },
      },

      // Variables
      {
        name: 'Variable',
        scope: ['variable', 'variable.parameter.function-call'],
        settings: {
          foreground: editorFg,
        },
      },
      {
        name: 'Member Variable',
        scope: ['variable.member'],
        settings: {
          foreground: markup,
        },
      },
      {
        name: 'Language variable',
        scope: ['variable.language'],
        settings: {
          fontStyle: 'italic',
          foreground: tag,
        },
      },

      // Keywords
      {
        name: 'Storage',
        scope: ['storage'],
        settings: {
          foreground: keyword,
        },
      },
      {
        name: 'Keyword',
        scope: ['keyword'],
        settings: {
          foreground: keyword,
        },
      },

      // Operators
      {
        name: 'Operators',
        scope: ['keyword.operator'],
        settings: {
          foreground: operator,
        },
      },

      // Punctuation
      {
        name: 'Separators like ; or ,',
        scope: ['punctuation.separator', 'punctuation.terminator'],
        settings: {
          foreground: withAlpha(editorFg, 0.7),
        },
      },
      {
        name: 'Punctuation',
        scope: ['punctuation.section'],
        settings: {
          foreground: editorFg,
        },
      },
      {
        name: 'Accessor',
        scope: ['punctuation.accessor'],
        settings: {
          foreground: operator,
        },
      },
      {
        name: 'JavaScript/TypeScript interpolation punctuation',
        scope: ['punctuation.definition.template-expression'],
        settings: {
          foreground: keyword,
        },
      },
      {
        name: 'Ruby interpolation punctuation',
        scope: ['punctuation.section.embedded'],
        settings: {
          foreground: keyword,
        },
      },
      {
        name: 'Interpolation text',
        scope: ['meta.embedded'],
        settings: {
          foreground: editorFg,
        },
      },

      // Types
      {
        name: 'Types fixes',
        scope: ['source.java storage.type', 'source.haskell storage.type', 'source.c storage.type'],
        settings: {
          foreground: entity,
        },
      },
      {
        name: 'Inherited class type',
        scope: ['entity.other.inherited-class'],
        settings: {
          foreground: tag,
        },
      },
      {
        name: 'Lambda arrow',
        scope: ['storage.type.function'],
        settings: {
          foreground: keyword,
        },
      },
      {
        name: 'Java primitive variable types',
        scope: ['source.java storage.type.primitive'],
        settings: {
          foreground: tag,
        },
      },

      // Functions
      {
        name: 'Function name',
        scope: ['entity.name.function'],
        settings: {
          foreground: func,
        },
      },
      {
        name: 'Function arguments',
        scope: ['variable.parameter', 'meta.parameter'],
        settings: {
          foreground: constant,
        },
      },
      {
        name: 'Function call',
        scope: ['variable.function', 'variable.annotation', 'meta.function-call.generic', 'support.function.go'],
        settings: {
          foreground: func,
        },
      },
      {
        name: 'Library function',
        scope: ['support.function', 'support.macro'],
        settings: {
          foreground: markup,
        },
      },

      // Imports and packages
      {
        name: 'Imports and packages',
        scope: ['entity.name.import', 'entity.name.package'],
        settings: {
          foreground: string,
        },
      },
      {
        name: 'Entity name',
        scope: ['entity.name'],
        settings: {
          foreground: entity,
        },
      },

      // Tags
      {
        name: 'Tag',
        scope: ['entity.name.tag', 'meta.tag.sgml'],
        settings: {
          foreground: tag,
        },
      },
      {
        name: 'JSX Component',
        scope: ['support.class.component'],
        settings: {
          foreground: entity,
        },
      },
      {
        name: 'Tag start/end',
        scope: ['punctuation.definition.tag.end', 'punctuation.definition.tag.begin', 'punctuation.definition.tag'],
        settings: {
          foreground: withAlpha(tag, 0.5),
        },
      },
      {
        name: 'Tag attribute',
        scope: ['entity.other.attribute-name'],
        settings: {
          foreground: func,
        },
      },
      {
        name: 'CSS pseudo-class',
        scope: ['entity.other.attribute-name.pseudo-class'],
        settings: {
          foreground: regexp,
        },
      },

      // Library types
      {
        name: 'Library constant',
        scope: ['support.constant'],
        settings: {
          fontStyle: 'italic',
          foreground: operator,
        },
      },
      {
        name: 'Library class/type',
        scope: ['support.type', 'support.class', 'source.go storage.type'],
        settings: {
          foreground: tag,
        },
      },

      // Decorators
      {
        name: 'Decorators/annotation',
        scope: ['meta.decorator variable.other', 'meta.decorator punctuation.decorator', 'storage.type.annotation', 'entity.name.function.decorator'],
        settings: {
          foreground: special,
        },
      },

      // Invalid
      {
        name: 'Invalid',
        scope: ['invalid'],
        settings: {
          foreground: '#D95757',
        },
      },

      // Ruby
      {
        name: 'Ruby class methods',
        scope: ['source.ruby variable.other.readwrite'],
        settings: {
          foreground: func,
        },
      },

      // CSS
      {
        name: 'CSS tag names',
        scope: ['source.css entity.name.tag', 'source.sass entity.name.tag', 'source.scss entity.name.tag', 'source.less entity.name.tag', 'source.stylus entity.name.tag'],
        settings: {
          foreground: entity,
        },
      },
      {
        name: 'CSS browser prefix',
        scope: ['source.css support.type', 'source.sass support.type', 'source.scss support.type', 'source.less support.type', 'source.stylus support.type'],
        settings: {
          foreground: comment,
        },
      },
      {
        name: 'CSS Properties',
        scope: ['support.type.property-name'],
        settings: {
          fontStyle: 'normal',
          foreground: tag,
        },
      },

      // Markup
      {
        name: 'Markup heading',
        scope: ['markup.heading', 'markup.heading entity.name'],
        settings: {
          fontStyle: 'bold',
          foreground: string,
        },
      },
      {
        name: 'Markup links',
        scope: ['markup.underline.link', 'string.other.link'],
        settings: {
          foreground: tag,
        },
      },
      {
        name: 'Markup Italic/Emphasis',
        scope: ['markup.italic', 'emphasis'],
        settings: {
          fontStyle: 'italic',
          foreground: markup,
        },
      },
      {
        name: 'Markup Bold',
        scope: ['markup.bold'],
        settings: {
          fontStyle: 'bold',
          foreground: markup,
        },
      },
      {
        name: 'Markup Underline',
        scope: ['markup.underline'],
        settings: {
          fontStyle: 'underline',
        },
      },
      {
        name: 'Markup Bold/italic',
        scope: ['markup.italic markup.bold', 'markup.bold markup.italic'],
        settings: {
          fontStyle: 'bold italic',
        },
      },
      {
        name: 'Markup Blockquote',
        scope: ['markup.quote'],
        settings: {
          foreground: regexp,
          fontStyle: 'italic',
        },
      },
      {
        name: 'Markup List Bullet',
        scope: ['markup.list punctuation.definition.list.begin'],
        settings: {
          foreground: func,
        },
      },
      {
        name: 'Markup Raw Inline',
        scope: ['text.html.markdown markup.inline.raw'],
        settings: {
          foreground: operator,
        },
      },
      {
        name: 'Markup strong',
        scope: ['markup.strong'],
        settings: {
          fontStyle: 'bold',
        },
      },

      // Punctuation (brackets, braces) - keep at end as fallback
      {
        name: 'Punctuation',
        scope: ['punctuation.definition.block', 'punctuation.definition.parameters', 'punctuation.definition.array', 'meta.brace'],
        settings: {
          foreground: editorFg,
        },
      },
    ],
  }
}
