import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function UserHome() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  return (
    <div className="uh-wrapper">
      <header className="uh-header">
        <h1 className="uh-title">Detachment 825 Inventory System</h1>

        <button
          className="uh-navigate-btn"
          onClick={() => navigate("/admin/login")}
          aria-label="Go to Admin Login"
        >
          Admin Login
        </button>
      </header>

      <main className="uh-main">
        <form className="uh-name-row" onSubmit={(e) => e.preventDefault()}>
          <label className="uh-field">
            <span className="uh-label">First<br/>Name</span>
            <input
              className="uh-input"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>

          <label className="uh-field">
            <span className="uh-label">Last<br/>Name</span>
            <input
              className="uh-input"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
        </form>

        {/* Table will go here later */}
        <section className="uh-table-placeholder" aria-label="Data section placeholder" />
      </main>
    </div>
  )
}
