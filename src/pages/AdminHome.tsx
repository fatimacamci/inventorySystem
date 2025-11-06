import { useNavigate } from "react-router-dom"
import "../styles.css"

export default function AdminHome() {
  const navigate = useNavigate()

  return (
    <div className="ah-wrap">
      {/* header */}
      <header className="ah-header">
        <div className="ah-logo" aria-label="Logo placeholder" />
        <h1 className="ah-title">Detachment 825 Inventory System</h1>

        <button
          className="uh-navigate-btn ah-logout"
          onClick={() => navigate("/admin/login")}
        >
          Log out
        </button>
      </header>

      {/* tiles */}
      <main className="ah-main">
        <button
          className="ah-tile"
          onClick={() => navigate("/admin/requests")}
        >
          Requests
        </button>

        <button
          className="ah-tile"
          onClick={() => navigate("/admin/inventory")}
        >
          Inventory
        </button>

        <button
          className="ah-tile"
          onClick={() => navigate("/admin/user-management")}
        >
          User Management
        </button>
      </main>
    </div>
  )
}
