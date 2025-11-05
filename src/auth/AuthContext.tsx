import React, { createContext, useContext, useState } from "react"

type AuthContextType = {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const login = (t: string) => setToken(t)
  const logout = () => setToken(null)

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
