export interface EntityCardField {
  label: string
  value: string
}

const TAGS = { CHARACTER: '인물', PLACE: '장소', EVENT: '사건', WORD: '' } as const
export type EntityCardType = keyof typeof TAGS
const LABELS: Record<EntityCardType, string[]> = {
  CHARACTER: ['첫 등장 페이지', '기본 설정', '주요 장면'],
  PLACE: ['첫 등장 페이지', '주요 사건', '연관 인물'],
  EVENT: ['첫 등장 페이지', '전개 과정', '영향 및 결과'],
  WORD: ['뜻', '예문'],
}

export interface EntityCardData {
  type: EntityCardType | null
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

  const explicitType = text(response.type)
  if (explicitType && !Object.hasOwn(TAGS, explicitType)) throw new Error('Invalid dictionary type')
  const type: EntityCardType | null = explicitType as EntityCardType ||
    (Object.keys(TAGS) as EntityCardType[]).find((kind) =>
      TAGS[kind] === text(response.tag) && (kind !== 'WORD' || fields.some((field) => field.label === '뜻'))) || null
  if (type && (text(response.tag) !== TAGS[type] || fields.some((field) => !LABELS[type].includes(field.label)))) {
    throw new Error('Dictionary type and explanation do not match')
  }

  return {
    type,
    word: text(response.word) || requestedWord,
    title: text(response.title) || text(response.word) || requestedWord,
    tag: type ? TAGS[type] : text(response.tag),
    fields,
    isSpoilerFiltered: response.is_spoiler_filtered === true,
  }
}
