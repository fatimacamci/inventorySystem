import NavButton from "../components/NavButton"
import { useAuth } from "../auth/AuthContext"

export default function AdminHome() {
  const { logout } = useAuth()
  return (
    <main>
      <h1>Admin Home</h1>
      <div style={{ margin: "12px 0" }}>
        <NavButton to="/admin/page-one">Go to Page One</NavButton>
        <NavButton to="/admin/page-two">Go to Page Two</NavButton>
        <NavButton to="/admin/page-three">Go to Page Three</NavButton>
      </div>
      <button onClick={logout}>Logout</button>
    </main>
  )
}
