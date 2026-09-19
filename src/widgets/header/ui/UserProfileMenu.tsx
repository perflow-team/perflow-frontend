import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

export default function UserProfileMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!open) return
    firstLink.current?.focus()
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  if (!user) return <Link to="/login" className="text-label-large text-neutral-600 hover:text-primary-600">로그인</Link>
  return (
    <div ref={root} className="relative min-w-0" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open}
        aria-controls="user-profile-menu" onClick={() => setOpen((value) => !value)}
        className="flex max-w-[120px] cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-label-large text-neutral-700 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-primary-500 sm:max-w-[160px]">
        <span className="truncate">{user.nickname}님</span>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id="user-profile-menu" role="dialog" aria-label="유저 프로필"
          className="absolute right-0 top-12 w-[min(280px,calc(100vw-32px))] rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center gap-3 border-b border-neutral-100 px-2 pb-4 pt-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700"><UserRound size={20} /></span>
            <div className="min-w-0">
              <p className="truncate text-title-small text-neutral-900">{user.nickname}</p>
              <p className="break-all text-label-small text-neutral-500">{user.email}</p>
            </div>
          </div>
          <Link ref={firstLink} to="/mypage" onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-3 text-label-large text-neutral-700 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500">
            <UserRound size={16} />마이페이지
          </Link>
          <button type="button" onClick={() => { logout(); setOpen(false); navigate('/') }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-label-large text-neutral-500 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-primary-500">
            <LogOut size={16} />로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
