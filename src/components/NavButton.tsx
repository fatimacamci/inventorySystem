import { useNavigate } from "react-router-dom"

export default function NavButton({ to, children, style }: { to: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const navigate = useNavigate()
  return (
    <button
      className="uh-navigate-btn"
      style={style}
      onClick={() => navigate(to)}
    >
      {children}
    </button>
  )
}
