import { useNavigate } from "react-router-dom"
export default function UserManagement() {
    const navigate = useNavigate()
    return (
        <main style={{ padding: 24 }}>
            <h2>User Management</h2>
            {/* TODO: build user management UI */}
            <button
                className="uh-navigate-btn ah-logout"
                onClick={() => navigate("/admin/")}
            >
                Back
            </button>
        </main>
    )
}
