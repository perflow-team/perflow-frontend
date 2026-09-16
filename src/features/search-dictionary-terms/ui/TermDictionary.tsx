import { BookOpen, Search } from 'lucide-react'
import { useState } from 'react'
import { useDictionaryTerms } from '@/features/search-dictionary-terms/model/useDictionaryTerms'
import { useAssistPanelStore } from '@/entities/assist-panel/model/useAssistPanelStore'
import Skeleton from '@/shared/ui/Skeleton'

interface TermDictionaryProps {
  novelId: string
  episodeId: string
}

const TYPE_LABELS: Record<string, string> = {
  CHARACTER: '인물',
}

// GET /dictionary/terms only ever returns entries unlocked as of the
// reader's current chapter — there's no "locked, dimmed" state to render,
// the backend simply omits anything not yet safe to show. Tapping an entry
// reuses the same on-demand explanation modal as a long-press in the text.
function TermDictionary({ novelId, episodeId }: TermDictionaryProps) {
  const [query, setQuery] = useState('')
  const { data: terms, isLoading } = useDictionaryTerms({ novelId, episodeId, query })
  const openCharacterCard = useAssistPanelStore((s) => s.openCharacterCard)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 p-3">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
          <Search size={16} className="shrink-0 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="용어 검색"
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
          {terms?.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => openCharacterCard(entry.name, entry.name)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-neutral-100"
              >
                <BookOpen size={14} className="shrink-0 text-primary-600" />
                <span className="text-body-medium font-medium text-neutral-900">{entry.name}</span>
                <span className="ml-auto text-label-small text-neutral-400">
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TermDictionary
