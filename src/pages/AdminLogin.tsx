import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "../styles.css"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: handle real auth
  }

  return (
    <div className="al-wrap">
      {/* top-right button */}
      <button className="uh-navigate-btn al-return" onClick={() => navigate("/")}>
        Return to User Page
      </button>

      {/* logo placeholder */}
      <div className="al-logo" aria-label="Logo placeholder" />

      <h1 className="al-title">Detachment 825 Inventory System</h1>
      <p className="al-subtitle">Log in</p>

      <form className="al-form" onSubmit={onSubmit}>
        <label htmlFor="admin-password" className="al-label">Password:</label>
        <input
          id="admin-password"
          type="password"
          className="uh-input al-input"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="uh-navigate-btn al-login-btn" onClick={() => navigate("/admin")}>
          Login
        </button>
      </form>
    </div>
  )
}
