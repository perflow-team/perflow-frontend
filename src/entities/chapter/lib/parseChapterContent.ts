import type { ContentBlock } from '@/entities/chapter/model/types'

// The backend returns chapter content as one plain-text string, with no
// heading markup, so every block is a paragraph. Each block records its
// absolute start offset in the original string so entity marks (which come
// as {start_offset, end_offset} against that same string) can be matched
// back to the right paragraph and position later.
export function parseChapterContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const lineRegex = /[^\n]+/g
  let match: RegExpExecArray | null

  while ((match = lineRegex.exec(content))) {
    const raw = match[0]
    const text = raw.trim()
    if (!text) continue
    const leadingWhitespace = raw.length - raw.trimStart().length
    blocks.push({ type: 'paragraph', text, start: match.index + leadingWhitespace })
  }

  return blocks
}
