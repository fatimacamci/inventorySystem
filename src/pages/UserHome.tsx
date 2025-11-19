
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { apiGet } from "../api"

type User = {
  id: number
  first_name: string
  last_name: string
}

type CheckedOutApi = {
  id: number
  item_name: string
  category_id: number
  quantity: number
  pickup_date: string
  return_date: string
  dispenser_id: number
  receiver_id: number
  notes: string | null
}

type CheckedOutRow = {
  id: number
  itemName: string
  quantity: number
  pickupDate: string
  returnDate: string
  notes: string | null
}

const fromApi = (api: CheckedOutApi): CheckedOutRow => ({
  id: api.id,
  itemName: api.item_name,
  quantity: api.quantity,
  pickupDate: api.pickup_date,
  returnDate: api.return_date,
  notes: api.notes,
})

export default function UserHome() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [checkedOut, setCheckedOut] = useState<CheckedOutRow[]>([])
  const [loading, setLoading] = useState(false)

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoading(true)
    try {
      // Fetch all users and find match
      const users: User[] = await apiGet("/users/")
      const found = users.find(
        (u) =>
          u.first_name.trim().toLowerCase() === firstName.trim().toLowerCase() &&
          u.last_name.trim().toLowerCase() === lastName.trim().toLowerCase()
      )
      if (!found) {
        setLoginError("User not found. Please check your name or contact admin.")
        setUser(null)
        setCheckedOut([])
        setLoading(false)
        return
      }
      setUser(found)
      // Fetch checked out items for this user
      const allChecked: CheckedOutApi[] = await apiGet("/checked-out/")
      const userChecked = allChecked
        .filter((row) => row.receiver_id === found.id)
        .map(fromApi)
      setCheckedOut(userChecked)
    } catch (err: any) {
      setLoginError(err.message ?? "Login failed")
      setUser(null)
      setCheckedOut([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setCheckedOut([])
    setFirstName("")
    setLastName("")
    setLoginError(null)
  }

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
        {!user ? (
          <form className="uh-name-row" onSubmit={handleLogin}>
            <label className="uh-field">
              <span className="uh-label">First<br />Name</span>
              <input
                className="uh-input"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="uh-field">
              <span className="uh-label">Last<br />Name</span>
              <input
                className="uh-input"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </label>
            <button
              className="uh-navigate-btn"
              type="submit"
              style={{ gridColumn: "1 / -1", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "User Login"}
            </button>
            {loginError && (
              <div style={{ color: "crimson", gridColumn: "1 / -1", marginTop: 8 }}>{loginError}</div>
            )}
          </form>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="um-subtitle">Welcome, {user.first_name} {user.last_name}</h2>
              <button className="uh-navigate-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
            <h3 style={{ marginTop: 24 }}>Your Checked Out Items</h3>
            {checkedOut.length === 0 ? (
              <p style={{ color: "crimson" }}>No items currently checked out.</p>
            ) : (
              <table className="um-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Pickup Date</th>
                    <th>Return Date</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {checkedOut.map((row) => (
                    <tr key={row.id}>
                      <td>{row.itemName}</td>
                      <td>{row.quantity}</td>
                      <td>{row.pickupDate ? new Date(row.pickupDate).toLocaleDateString() : "-"}</td>
                      <td>{row.returnDate ? new Date(row.returnDate).toLocaleDateString() : "-"}</td>
                      <td>{row.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
