import { useNavigate } from "react-router-dom"
export default function Requests() {
    const navigate = useNavigate()
    return (
        <main style={{ padding: 24 }}>
            <h2>Requests</h2>
            {/* TODO: build requests UI */}
            <button
                className="uh-navigate-btn ah-logout"
                onClick={() => navigate("/admin/")}
            >
                Back
            </button>
        </main>
    )
}
