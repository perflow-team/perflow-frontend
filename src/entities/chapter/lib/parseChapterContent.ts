import type { ContentBlock } from '@/entities/chapter/model/types'

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
