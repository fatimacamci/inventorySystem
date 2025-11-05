import { Routes, Route } from "react-router-dom"
import UserHome from "./pages/UserHome"
import AdminLogin from "./pages/AdminLogin"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserHome />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  )
}
