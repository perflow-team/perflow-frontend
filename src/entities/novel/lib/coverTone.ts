export interface CoverTone {
  bg: string
  text: string
  accent: string
}

const COVER_TONES: CoverTone[] = [
  { bg: 'bg-primary-700', text: 'text-primary-50', accent: 'text-primary-300' },
  { bg: 'bg-primary-100', text: 'text-primary-900', accent: 'text-primary-600' },
  { bg: 'bg-neutral-800', text: 'text-neutral-50', accent: 'text-neutral-400' },
  { bg: 'bg-neutral-200', text: 'text-neutral-800', accent: 'text-neutral-500' },
]

export function coverToneFor(id: number): CoverTone {
  return COVER_TONES[Math.abs(id) % COVER_TONES.length]
}
