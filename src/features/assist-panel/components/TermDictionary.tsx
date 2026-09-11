import { BookOpen, Lock, Search } from 'lucide-react'
import { useState } from 'react'
import { useDictionaryTerms } from '../hooks/useDictionaryTerms'

interface TermDictionaryProps {
  novelId: string
}

// Spec 3.4: locked (not-yet-encountered) terms show dimmed + a lock icon in
// the browse list. In search, they don't appear at all — surfacing even
// their existence via search would itself leak a spoiler. That filtering
// happens server-side in fetchDictionaryTerms, not here.
function TermDictionary({ novelId }: TermDictionaryProps) {
  const [query, setQuery] = useState('')
  const { data: terms, isLoading } = useDictionaryTerms({ novelId, query })

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
        {isLoading && <p className="px-3 py-4 text-body-small text-neutral-400">불러오는 중...</p>}
        {!isLoading && terms?.length === 0 && (
          <p className="px-3 py-4 text-body-small text-neutral-400">
            {query ? '검색 결과가 없어요.' : '등록된 용어가 없어요.'}
          </p>
        )}
        <ul className="space-y-1">
          {terms?.map((entry) => (
            <li key={entry.id}>
              <div
                className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 ${
                  entry.locked ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {entry.locked ? (
                  <Lock size={14} className="mt-0.5 shrink-0 text-neutral-400" />
                ) : (
                  <BookOpen size={14} className="mt-0.5 shrink-0 text-primary-600" />
                )}
                <div>
                  <p className="text-body-medium font-medium text-neutral-900">{entry.term}</p>
                  {entry.definition && <p className="mt-0.5 text-body-small text-neutral-500">{entry.definition}</p>}
                  {entry.locked && <p className="mt-0.5 text-label-small text-neutral-400">아직 등장하지 않았어요</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TermDictionary
