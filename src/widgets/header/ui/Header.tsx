import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import wordmark from '@/shared/assets/images/wordmark.svg'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { SearchBar } from '@/features/search-novels'

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
      <div className="mx-auto grid h-16 max-w-[1168px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-10">
        <Link to="/" className="shrink-0 justify-self-start">
          <img src={wordmark} alt="perflow" className="h-9 w-auto md:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 text-title-small text-neutral-700 lg:flex">
          <Link to="/" className="hover:text-primary-600">
            홈
          </Link>
          <Link to="/genre" className="hover:text-primary-600">
            장르
          </Link>
          <Link to="/ranking" className="hover:text-primary-600">
            랭킹
          </Link>
        </nav>

        <div className="flex items-center gap-1 justify-self-end md:gap-2">
          <SearchBar />
          {user ? (
            <>
              <Link to="/mypage" className="text-label-large text-neutral-700 hover:text-primary-600">
                {user.nickname}님
              </Link>
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
