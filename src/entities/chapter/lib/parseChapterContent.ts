import type { ContentBlock } from '@/entities/chapter/model/types'

// The backend returns chapter content as one plain-text string. Split on
// blank/newlines into paragraph blocks — there's no heading markup from the
// API, so every block is a paragraph.
export function parseChapterContent(content: string): ContentBlock[] {
  return content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ type: 'paragraph', text }))
}
