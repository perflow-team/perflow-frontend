import { Route, Routes } from 'react-router-dom'
import { GenrePage } from '@/pages/genre'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { MyPage } from '@/pages/my-page'
import { NovelDetailPage } from '@/pages/novel-detail'
import { RankingPage } from '@/pages/ranking'
import { ReaderPage } from '@/pages/reader'
import { SearchPage } from '@/pages/search'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/genre" element={<GenrePage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/novel/:novelId" element={<NovelDetailPage />} />
      <Route path="/novel/:novelId/read/:episodeId" element={<ReaderPage />} />
    </Routes>
  )
}

export default App
