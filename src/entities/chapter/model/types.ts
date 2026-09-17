export interface ContentBlock {
  type: 'heading' | 'paragraph'
  text: string
  /** Absolute character offset of `text` within the chapter's raw content string. */
  start: number
}

export interface EntityMark {
  word: string
  type: string
  start_offset: number
  end_offset: number
}
