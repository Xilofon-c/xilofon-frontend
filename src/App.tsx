import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './components/LoginPage';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}
