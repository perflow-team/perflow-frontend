import { BookOpen, Flame, MapPin, Search, User } from 'lucide-react'
import { useState } from 'react'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import { useDictionaryTerms } from '@/features/search-dictionary-terms/model/useDictionaryTerms'
import { useAssistPanelStore } from '@/entities/assist-panel/model/useAssistPanelStore'
import Skeleton from '@/shared/ui/Skeleton'

interface TermDictionaryProps {
  novelId: string
  episodeId: string
}

const TYPE_LABELS: Record<string, string> = {
  CHARACTER: '인물',
  PLACE: '장소',
  EVENT: '사건',
  WORD: '단어',
}

const TYPE_ICONS: Record<string, typeof User> = {
  CHARACTER: User,
  PLACE: MapPin,
  EVENT: Flame,
  WORD: BookOpen,
}

function TermDictionary({ novelId, episodeId }: TermDictionaryProps) {
  const [query, setQuery] = useState('')
  const currentCharOffset = useReaderStore((s) => s.cutoff.scope === `${novelId}:${episodeId}` ? s.cutoff.offset : 0)
  const { data: terms, isLoading } = useDictionaryTerms({ novelId, episodeId, query, currentCharOffset })
  const openCharacterCard = useAssistPanelStore((s) => s.openCharacterCard)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 p-3">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
          <Search size={16} className="shrink-0 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="인물, 장소, 사건, 용어 검색"
            className="w-full bg-transparent text-body-medium text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading && (
          <ul className="space-y-1 px-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-2.5 py-2">
                <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-2/5" />
              </li>
            ))}
          </ul>
        )}
        {!isLoading && terms?.length === 0 && (
          <p className="px-3 py-4 text-body-small text-neutral-400">
            {query ? '검색 결과가 없어요.' : '아직 등장한 용어가 없어요.'}
          </p>
        )}
        <ul className="space-y-1">
          {terms?.map((entry) => {
            const TypeIcon = TYPE_ICONS[entry.type] ?? BookOpen
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => openCharacterCard(entry.name, entry.name, `${novelId}:${episodeId}`, currentCharOffset)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-neutral-100"
                >
                  <TypeIcon size={14} className="shrink-0 text-primary-600" />
                  <span className="text-body-medium font-medium text-neutral-900">{entry.name}</span>
                  <span className="ml-auto text-label-small text-neutral-400">
                    {TYPE_LABELS[entry.type] ?? entry.type}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default TermDictionary
