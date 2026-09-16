import { Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { MyPage } from '@/pages/my-page'
import { NovelDetailPage } from '@/pages/novel-detail'
import { ReaderPage } from '@/pages/reader'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/novel/:novelId" element={<NovelDetailPage />} />
      <Route path="/novel/:novelId/read/:episodeId" element={<ReaderPage />} />
    </Routes>
  )
}

export default App
