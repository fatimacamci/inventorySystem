import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { apiGet, apiSend } from "../api"

interface User {
  id: number
  first_name: string
  last_name: string
}

export default function UserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showPopup, setShowPopup] = useState(false)
  const [showEditPopup, setShowEditPopup] = useState(false)

  const [newUser, setNewUser] = useState({ first_name: "", last_name: "" })
  const [editUser, setEditUser] = useState<User | null>(null)

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet("/users/")
      setUsers(data)
    } catch (err: any) {
      setError(err.message ?? "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Add user via backend
  const addUser = async () => {
    if (!newUser.first_name || !newUser.last_name) return
    try {
      setError(null)
      const created = await apiSend("POST", "/users/", newUser)
      setUsers((prev) => [...prev, created])
      setNewUser({ first_name: "", last_name: "" })
      setShowPopup(false)
    } catch (err: any) {
      setError(err.message ?? "Failed to add user")
    }
  }

  // Edit user popup
  const handleEditUser = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (!user) return
    setEditUser({ ...user })
    setShowEditPopup(true)
  }

  // Save edited user (not implemented in backend, so just update local state)
  const saveEditedUser = () => {
    if (!editUser) return
    setUsers(users.map((u) => (u.id === editUser.id ? editUser : u)))
    setShowEditPopup(false)
    setEditUser(null)
  }

  return (
    <div className="um-wrapper">
      <header className="uh-header um-header">
        <div className="um-header-left">
          <h1 className="uh-title">Detachment 825 Inventory System</h1>
          <h2 className="um-subtitle">User Management</h2>
        </div>

        <button className="uh-navigate-btn ah-logout um-back-btn" onClick={() => navigate("/admin/")}>
          Back
        </button>
      </header>

      <main className="um-main">
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {loading ? (
          <p>Loading users…</p>
        ) : (
          <div className="um-table-container">
            <table className="um-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>
                      <button className="um-edit-btn" onClick={() => handleEditUser(user.id)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="uh-navigate-btn um-add-btn" onClick={() => setShowPopup(true)}>
              Add New User
            </button>
          </div>
        )}
      </main>

      {/* Add User Popup */}
      {showPopup && (
        <div className="um-popup">
          <h3>Add New User</h3>
          <label>
            First Name:
            <input
              value={newUser.first_name}
              onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
            />
          </label>
          <label>
            Last Name:
            <input
              value={newUser.last_name}
              onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
            />
          </label>
          <div className="um-popup-buttons">
            <button onClick={addUser}>Add</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit User Popup (local only) */}
      {showEditPopup && editUser && (
        <div className="um-popup">
          <h3>Edit User</h3>

          <label>
            First Name:
            <input
              value={editUser.first_name}
              onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
            />
          </label>

          <label>
            Last Name:
            <input
              value={editUser.last_name}
              onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
            />
          </label>

          <div className="um-popup-buttons">
            <button onClick={saveEditedUser}>Save</button>
            <button onClick={() => setShowEditPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

