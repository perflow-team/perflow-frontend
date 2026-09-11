import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import wordmark from '../assets/images/wordmark.svg'

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
      <div className="mx-auto flex h-16 max-w-[1168px] items-center justify-between px-10">
        <Link to="/">
          <img src={wordmark} alt="perflow" className="h-12 w-auto" />
        </Link>

        <nav className="flex items-center gap-8 text-title-small text-neutral-700">
          <Link to="/" className="hover:text-primary-600">
            홈
          </Link>
          <a href="#" className="hover:text-primary-600">
            장르
          </a>
          <a href="#" className="hover:text-primary-600">
            랭킹
          </a>
          <a href="#" className="hover:text-primary-600">
            완결
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/mypage" className="text-label-large text-neutral-600 hover:text-primary-600">
            마이페이지
          </Link>
          <Link to="/login" className="text-label-large text-neutral-600 hover:text-primary-600">
            로그인
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
