export interface EntityCardField {
  label: string
  value: string
}

export interface EntityCardData {
  word: string
  title: string
  tag: string
  fields: EntityCardField[]
  isSpoilerFiltered: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

// Validate at the API boundary: TypeScript cannot guarantee the shape of
// generated JSON. Keep support for the older dictionary response contracts.
export function normalizeEntityCard(response: unknown, requestedWord: string): EntityCardData {
  if (!isRecord(response)) throw new Error('Invalid dictionary response')

  const rawFields = Array.isArray(response.fields)
    ? response.fields
    : isRecord(response.fields)
      ? Object.entries(response.fields).map(([label, value]) => ({ label, value }))
      : []

  const fields: EntityCardField[] = rawFields.flatMap((field) => {
    if (!isRecord(field)) return []
    const value = text(field.value)
    return value ? [{ label: text(field.label) || '설명', value }] : []
  })

  const explanation = text(response.explanation)
  if (fields.length === 0 && explanation) fields.push({ label: '설명', value: explanation })

  return {
    word: text(response.word) || requestedWord,
    title: text(response.title) || text(response.word) || requestedWord,
    tag: text(response.tag),
    fields,
    isSpoilerFiltered: response.is_spoiler_filtered === true,
  }
}
