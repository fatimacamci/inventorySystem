import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface User {
    id: number
    firstName: string
    lastName: string
}

export default function UserManagement() {
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>( [
        {id : 1, firstName: "John", lastName : "Doe"},
        { id : 2, firstName: "Jane", lastName : "Smith"}
    ])

    const [showPopup, setShowPopup] = useState(false)
    const [showEditPopup, setShowEditPopup] = useState(false)

    const [newUser, setNewUser] = useState({ firstName: "", lastName: "" })
    const [editUser, setEditUser] = useState<User | null>(null)

    const addUser = () => {
        if(!newUser.firstName || !newUser.lastName)  return
        setUsers([...users, { id : Date.now(), ...newUser}])
        setNewUser({firstName: "", lastName: ""})
        setShowPopup(false)
    }

    const handleEditUser = (id: number) => {
        const user = users.find(u => u.id === id)
        if (!user) return
        setEditUser({ ...user })       // fill popup with current values
        setShowEditPopup(true)
    }

    const saveEditedUser = () => {
        if (!editUser) return
        setUsers(users.map(u => (u.id === editUser.id ? editUser : u)))
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
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
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
      </main>

      {/* Add User Popup */}
      {showPopup && (
        <div className="um-popup">
          <h3>Add New User</h3>
          <label>
            First Name:
            <input
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
            />
          </label>
          <label>
            Last Name:
            <input
              value={newUser.lastName}
              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
            />
          </label>
          <div className="um-popup-buttons">
            <button onClick={addUser}>Add</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Edit User Popup */}
            {showEditPopup && editUser && (
                <div className="um-popup">
                    <h3>Edit User</h3>

                    <label>
                        First Name:
                        <input
                            value={editUser.firstName}
                            onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                        />
                    </label>

                    <label>
                        Last Name:
                        <input
                            value={editUser.lastName}
                            onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
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

