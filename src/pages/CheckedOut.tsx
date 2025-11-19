import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_URL

// --- API & UI types based on your real FastAPI schema ---

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
  categoryId: number
  quantity: number
  pickupDate: string
  returnDate: string
  notes: string | null
  receiverId: number
}

// API → UI mapping
const fromApi = (api: CheckedOutApi): CheckedOutRow => ({
  id: api.id,
  itemName: api.item_name,
  categoryId: api.category_id,
  quantity: api.quantity,
  pickupDate: api.pickup_date,
  returnDate: api.return_date,
  notes: api.notes,
  receiverId: api.receiver_id,
})

export default function CheckedOut() {
  const navigate = useNavigate()

  const [rows, setRows] = useState<CheckedOutRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<{ id: number; first_name: string; last_name: string }[]>([])
  const [categories, setCategories] = useState<{ id: number; val: string }[]>([])

  const loadCheckedOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("admin_token")
      if (!token) {
        setError("Not logged in as admin")
        setRows([])
        return
      }

      // Fetch checked out, users, and categories in parallel
      const [checkedRes, usersRes, catsRes] = await Promise.all([
        fetch(`${API_BASE}/checked-out/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/users/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/categories/`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const checkedBody = await checkedRes.json().catch(() => ([]))
      const usersBody = await usersRes.json().catch(() => ([]))
      const catsBody = await catsRes.json().catch(() => ([]))

      if (!checkedRes.ok) {
        console.error("GET /checked-out/ failed", checkedRes.status, checkedBody)
        throw new Error(checkedBody.detail || "Failed to load checked-out items")
      }
      if (!usersRes.ok) {
        console.error("GET /users/ failed", usersRes.status, usersBody)
        throw new Error(usersBody.detail || "Failed to load users")
      }
      if (!catsRes.ok) {
        console.error("GET /categories/ failed", catsRes.status, catsBody)
        throw new Error(catsBody.detail || "Failed to load categories")
      }

      setUsers(usersBody)
      setCategories(catsBody)
      setRows((checkedBody as CheckedOutApi[]).map(fromApi))
    } catch (err: any) {
      setError(err.message ?? "Failed to load checked-out items")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCheckedOut()
  }, [])

  const handleCheckIn = async (id: number) => {
    if (!window.confirm("Check this item back in?")) return

    try {
      setError(null)
      const token = localStorage.getItem("admin_token")
      if (!token) {
        setError("Not logged in as admin")
        return
      }

      const res = await fetch(`${API_BASE}/checked-out/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error("DELETE /checked-out/{id} failed", res.status, body)
        throw new Error(body.detail || "Failed to check item in")
      }

      // Update UI
      setRows((prev) => prev.filter((row) => row.id !== id))
    } catch (err: any) {
      setError(err.message ?? "Failed to check item in")
    }
  }

  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "-"

  return (
    <div className="um-wrapper">
      <header className="uh-header um-header">
        <div className="um-header-left">
          <h1 className="uh-title">Detachment 825 Inventory System</h1>
          <h2 className="um-subtitle">Currently Checked Out</h2>
        </div>

        <button
          className="uh-navigate-btn ah-logout um-back-btn"
          onClick={() => navigate("/admin")}
        >
          Back
        </button>
      </header>

      <main className="um-main">
        {error && (
          <p style={{ color: "crimson", marginBottom: "8px" }}>{error}</p>
        )}
        {loading && <p>Loading...</p>}

        {!loading && rows.length === 0 && !error && (
          <p style={{ color: "crimson" }}>No items currently checked out</p>
        )}

        {rows.length > 0 && (
          <div className="um-table-container">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Checked Out By</th>
                  <th>Pickup Date</th>
                  <th>Return Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const user = users.find(u => u.id === row.receiverId)
                  const cat = categories.find(c => c.id === row.categoryId)
                  return (
                    <tr key={row.id}>
                      <td>{row.itemName}</td>
                      <td>{cat ? cat.val : row.categoryId}</td>
                      <td>{row.quantity}</td>
                      <td>{user ? `${user.first_name} ${user.last_name}` : row.receiverId || '-'}</td>
                      <td>{formatDate(row.pickupDate)}</td>
                      <td>{formatDate(row.returnDate)}</td>
                      <td>{row.notes || "-"}</td>
                      <td>
                        <button
                          className="uh-navigate-btn"
                          type="button"
                          onClick={() => handleCheckIn(row.id)}
                        >
                          Check In
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

