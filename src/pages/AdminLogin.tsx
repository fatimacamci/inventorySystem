import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "../styles.css"
import logo from "../assets/logo.png"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Login failed")
      }

      const data = await res.json()
      if (!data.token) throw new Error("No token returned from server")

      // Store token in localStorage (so protected routes can verify)
      localStorage.setItem("admin_token", data.token)

      // Navigate to Admin Home
      navigate("/admin", { replace: true })
    } catch (err: any) {
      setError(err.message ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="al-wrap">
      {/* top-right button */}
      <button className="uh-navigate-btn al-return" onClick={() => navigate("/")}>
        Return to User Page
      </button>

      {/* logo image */}
      <img src={logo} alt="Detachment 825 logo" className="al-logo" />

      <h1 className="al-title">Detachment 825 Inventory System</h1>
      <p className="al-subtitle">Log in</p>

      <form className="al-form" onSubmit={onSubmit}>
        <label htmlFor="admin-password" className="al-label">
          Password:
        </label>
        <input
          id="admin-password"
          type="password"
          className="uh-input al-input"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="uh-navigate-btn al-login-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson", marginTop: "16px", textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  )
}
