import { BookOpen, ChevronDown, Flame, MapPin, Search, User } from 'lucide-react'
import { useState } from 'react'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import { useDictionaryTerms } from '@/features/search-dictionary-terms/model/useDictionaryTerms'
import { useEntityCard } from '@/features/lookup-word/model/useEntityCard'
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

const TYPE_ICONS: Record<string, typeof User> = { CHARACTER: User, PLACE: MapPin, EVENT: Flame, WORD: BookOpen }

// Both list and card queries use the chapter-scoped reading cutoff.
function TermDictionary({ novelId, episodeId }: TermDictionaryProps) {
  const [query, setQuery] = useState('')
  const currentCharOffset = useReaderStore((s) => s.cutoff.scope === `${novelId}:${episodeId}` ? s.cutoff.offset : 0)
  const { data: terms, isLoading, isError, refetch } = useDictionaryTerms({ novelId, episodeId, query, currentCharOffset })

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
        {isError && <div className="px-3 py-4 text-body-small text-neutral-500"><p>용어를 불러오지 못했어요.</p><button type="button" onClick={() => void refetch()} className="mt-2 text-primary-600">다시 시도</button></div>}
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
          {terms?.map((entry) => (
            <li key={entry.id}>
              <DictionaryEntry key={`${novelId}:${episodeId}:${entry.id}`} name={entry.name} type={entry.type} novelId={novelId} episodeId={episodeId} currentCharOffset={currentCharOffset} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DictionaryEntry({ name, type, novelId, episodeId, currentCharOffset }: {
  name: string; type: string; novelId: string; episodeId: string; currentCharOffset: number
}) {
  const [expanded, setExpanded] = useState(false)
  const TypeIcon = TYPE_ICONS[type] ?? BookOpen
  const { data, isPending, isError, refetch } = useEntityCard({ novelId, episodeId,
    word: expanded ? name : null, contextSentence: name, currentCharOffset })
  return <div className="rounded-lg border border-transparent hover:border-neutral-100">
    <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-neutral-100">
      <TypeIcon size={14} className="shrink-0 text-primary-600" />
      <span className="text-body-medium font-medium text-neutral-900">{name}</span>
      <span className="ml-auto text-label-small text-neutral-400">{TYPE_LABELS[type] ?? type}</span>
      <ChevronDown size={14} className={`shrink-0 text-neutral-400 ${expanded ? 'rotate-180' : ''}`} />
    </button>
    {expanded && <div className="space-y-2 px-3 pb-3 text-body-small text-neutral-700">
      {isPending && <p className="text-neutral-400">설명을 불러오는 중이에요.</p>}
      {isError && <button type="button" onClick={() => void refetch()} className="text-primary-600">설명 다시 불러오기</button>}
      {data?.fields.map((field, i) => <p key={i}><span className="mr-2 font-medium text-neutral-500">{field.label}</span>{field.value}</p>)}
      {data?.isSpoilerFiltered && <p className="text-label-small text-primary-600">현재 읽은 범위의 설명</p>}
    </div>}
  </div>
}

export default TermDictionary
