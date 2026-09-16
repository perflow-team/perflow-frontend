import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import wordmark from '@/shared/assets/images/wordmark.svg'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

function Header() {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setHidden(currentY > lastScrollY.current && currentY > 80)
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="mx-auto flex h-16 max-w-[1168px] items-center justify-between px-4 md:px-10">
        <Link to="/" className="shrink-0">
          <img src={wordmark} alt="perflow" className="h-9 w-auto md:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 text-title-small text-neutral-700 lg:flex">
          <Link to="/" className="hover:text-primary-600">
            홈
          </Link>
          <button type="button" disabled title="준비 중이에요" className="cursor-not-allowed text-neutral-400">
            장르
          </button>
          <button type="button" disabled title="준비 중이에요" className="cursor-not-allowed text-neutral-400">
            랭킹
          </button>
          <button type="button" disabled title="준비 중이에요" className="cursor-not-allowed text-neutral-400">
            완결
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/mypage"
            className="hidden text-label-large text-neutral-600 hover:text-primary-600 sm:inline"
          >
            마이페이지
          </Link>
          {user ? (
            <>
              <span className="text-label-large text-neutral-700">{user.nickname}님</span>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="text-label-large text-neutral-500 hover:text-primary-600"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="text-label-large text-neutral-600 hover:text-primary-600">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
