import { useNavigate } from "react-router-dom"
export default function Inventory() {
    const navigate = useNavigate()
    return (
        <main style={{ padding: 24 }}>
            <h2>Inventory</h2>
            {/* TODO: build inventory UI */}
            <button
                className="uh-navigate-btn ah-logout"
                onClick={() => navigate("/admin/")}
            >
                Back
            </button>
        </main>
    )
}
