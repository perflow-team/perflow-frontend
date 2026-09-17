import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchNovels } from '@/entities/novel/api/novelApi'
import { filterNovels } from '@/features/search-novels/lib/filterNovels'

// Real search over the real /api/novels list (client-side filter — the
// catalog is small enough that a dedicated search endpoint isn't needed
// yet). Shares the ['novels'] query cache with Home/MyPage, so opening this
// rarely fires a new request.
function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const { data: novels } = useQuery({ queryKey: ['novels'], queryFn: fetchNovels, enabled: open })
  const results = filterNovels(novels ?? [], query).slice(0, 6)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const goToResults = () => {
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="검색"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-primary-600"
      >
        <Search size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[320px] rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
          <div className="flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2">
            <Search size={15} className="shrink-0 text-neutral-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') goToResults()
                if (e.key === 'Escape') setOpen(false)
              }}
              placeholder="제목, 작가로 검색"
              className="w-full bg-transparent text-body-medium text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="지우기" className="shrink-0 text-neutral-400 hover:text-neutral-600">
                <X size={14} />
              </button>
            )}
          </div>

          {query.trim() && (
            <div className="mt-2">
              {results.length === 0 ? (
                <p className="px-1 py-3 text-body-small text-neutral-400">검색 결과가 없어요.</p>
              ) : (
                <ul className="flex flex-col">
                  {results.map((novel) => (
                    <li key={novel.id}>
                      <Link
                        to={`/novel/${novel.id}`}
                        onClick={() => setOpen(false)}
                        className="flex flex-col rounded-md px-2 py-2 hover:bg-neutral-50"
                      >
                        <span className="line-clamp-1 text-body-medium text-neutral-900">{novel.title}</span>
                        <span className="text-label-small text-neutral-400">{novel.author}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={goToResults}
                className="mt-1 w-full rounded-md px-2 py-2 text-left text-label-large text-primary-600 hover:bg-primary-50"
              >
                &quot;{query.trim()}&quot; 전체 검색결과 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
