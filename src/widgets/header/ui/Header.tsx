import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import wordmark from '@/shared/assets/images/wordmark.svg'
import { SearchBar } from '@/features/search-novels'
import UserProfileMenu from './UserProfileMenu'

function Header() {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

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
      <div className="mx-auto grid h-14 max-w-[1168px] grid-cols-[minmax(0,1fr)_auto] items-center px-4 md:h-16 md:px-10 lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="min-w-0 justify-self-start">
          <img src={wordmark} alt="perflow" className="h-12 w-[104px] max-w-full object-contain md:w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 text-title-small text-neutral-700 lg:flex">
          <Link to="/#genre" className="hover:text-primary-600">
            장르
          </Link>
          <Link to="/#ranking" className="hover:text-primary-600">
            랭킹
          </Link>
          <Link to="/#update" className="hover:text-primary-600">
            업데이트
          </Link>
        </nav>

        <div className="flex items-center gap-1 justify-self-end md:gap-2">
          <SearchBar />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  )
}

export default Header
