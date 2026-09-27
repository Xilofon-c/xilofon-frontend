import { Outlet, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/navbar/Navbar'
import { AccountPage } from './pages/AccountPage'
import { CreateShipmentPage } from './pages/CreateShipmentPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './components/loginpage/LoginPage';
import { ReportPage } from './pages/ReportPage'
import { ShipmentsPage } from './pages/ShipmentsPage'
import ForgotPassword from './components/loginpage/ForgotPassword';
import GetPIN from './components/loginpage/GetPIN';
import LogOut from './components/loginpage/LogOut';
import ResetPassword from './components/loginpage/ResetPassword';
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
       <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/shipments/new" element={<CreateShipmentPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path='/forgot-password' element={<ForgotPassword />}> </Route>
         <Route path='/input-pin' element={<GetPIN />}> </Route>
         <Route path='/logout' element={<LogOut />}></Route>
          <Route path='/reset-password' element={<ResetPassword />}></Route>
      </Route>
    </Routes>
  )
}
