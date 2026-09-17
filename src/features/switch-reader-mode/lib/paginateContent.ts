import type { ContentBlock } from '@/entities/chapter/model/types'

// Measure with the reader's actual font and width. Split oversized paragraphs
// at grapheme boundaries so no text or source offsets are lost between pages.
export function paginateContent(
  content: ContentBlock[],
  pageHeight: number,
  measure: (blockIndex: number, text: string) => number,
  gap = 12,
): ContentBlock[][] {
  if (pageHeight <= 0) return [[]]
  const pages: ContentBlock[][] = []
  let page: ContentBlock[] = []
  let height = 0
  const finishPage = () => {
    if (page.length) pages.push(page)
    page = []
    height = 0
  }
  const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' })

  content.forEach((block, blockIndex) => {
    if (!block.text) return
    const fullHeight = measure(blockIndex, block.text)
    if (page.length && fullHeight <= pageHeight && height + gap + fullHeight > pageHeight) finishPage()

    const boundaries = [0, ...Array.from(segmenter.segment(block.text), (part) => part.index + part.segment.length)]
    let from = 0
    while (from < boundaries.length - 1) {
      const spacing = page.length ? gap : 0
      const available = pageHeight - height - spacing
      let low = from + 1
      let high = boundaries.length - 1
      let end = from
      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        if (measure(blockIndex, block.text.slice(boundaries[from], boundaries[mid])) <= available) {
          end = mid
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
      if (end === from && page.length) {
        finishPage()
        continue
      }
      // Even a viewport shorter than one line must keep its text accessible.
      if (end === from) end = from + 1
      const text = block.text.slice(boundaries[from], boundaries[end])
      page.push({ ...block, text, start: block.start + boundaries[from], contextSentence: block.contextSentence ?? block.text })
      height += spacing + measure(blockIndex, text)
      from = end
      if (from < boundaries.length - 1) finishPage()
    }
  })
  finishPage()
  return pages.length ? pages : [[]]
}
