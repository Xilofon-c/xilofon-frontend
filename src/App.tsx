import { Outlet, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/navbar/Navbar'
import { AccountPage } from './pages/AccountPage'
import { CreateShipmentPage } from './pages/CreateShipmentPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './components/loginpage/LoginPage'
import { ReportPage } from './pages/ReportPage'
import { ShipmentsPage } from './pages/ShipmentsPage'
import ForgotPassword from './components/loginpage/ForgotPassword'
import GetPIN from './components/loginpage/GetPIN'
import LogOut from './components/loginpage/LogOut'
import ResetPassword from './components/loginpage/ResetPassword'
import { Footer } from './components/page1-main/Footer'

function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <Outlet />
      <Footer withNav />
    </div>
  )
}

/** Sign-in screens have no navigation bar, only the footer. */
function AuthShell() {
  return (
    <div className="app-shell">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/input-pin" element={<GetPIN />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/" element={
          <OfficeRoute>
          <HomePage />
          </OfficeRoute>} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/shipments/new" element={<CreateShipmentPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/logout" element={<LogOut />} />
      </Route>
    </Routes>
  )
}
