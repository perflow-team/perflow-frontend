export interface ContentBlock {
  type: 'heading' | 'paragraph'
  text: string
  start: number
  contextSentence?: string
}

export interface EntityMark {
  word: string
  type: string
  start_offset: number
  end_offset: number
  lookup_offset?: number
}
