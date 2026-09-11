import { Outlet, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/navbar/Navbar'
import { AccountPage } from './pages/AccountPage'
import { CreateShipmentPage } from './pages/CreateShipmentPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './components/loginpage/LoginPage';
import { ReportPage } from './pages/ReportPage'
import { ShipmentsPage } from './pages/ShipmentsPage'

function AppShell() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/shipments/new" element={<CreateShipmentPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
    </Routes>
  )
}
