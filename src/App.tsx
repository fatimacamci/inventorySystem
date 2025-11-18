import { Routes, Route } from "react-router-dom"
import UserHome from "./pages/UserHome"
import AdminLogin from "./pages/AdminLogin"
import AdminHome from "./pages/AdminHome"
import Requests from "./pages/Requests"
import Inventory from "./pages/Inventory"
import UserManagement from "./pages/UserManagement"
import CheckedOut from "./pages/CheckedOut"

export default function App() {
  return (
    <Routes>
      <Route path="/admin/checked-out" element={<CheckedOut />} />
      <Route path="/" element={<UserHome />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/requests" element={<Requests />} />
      <Route path="/admin/inventory" element={<Inventory />} />
      <Route path="/admin/user-management" element={<UserManagement />} />
    </Routes>
  )
}
