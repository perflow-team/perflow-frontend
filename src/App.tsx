import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import MyPage from './pages/MyPage'
import NovelDetailPage from './pages/NovelDetailPage'
import ReaderPage from './pages/ReaderPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/novel/:novelId" element={<NovelDetailPage />} />
      <Route path="/novel/:novelId/read/:episodeId" element={<ReaderPage />} />
    </Routes>
  )
}

export default App
