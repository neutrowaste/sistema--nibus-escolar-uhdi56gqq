import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export type UserSession = {
  id: string
  name: string
  email: string
  avatar: string
  orgId: string
  branchId: string
  permissions: string[]
}

interface AuthContextType {
  user: UserSession | null
  login: (email: string, pass: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (email && pass) {
        localStorage.setItem('orgId', 'org-8103')
        localStorage.setItem('branchId', 'br-001')
        setUser({
          id: 'u-123',
          name: 'Admin Global',
          email: email,
          avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=12',
          orgId: 'org-8103',
          branchId: 'br-001',
          permissions: [
            'page:iam',
            'page:fleet',
            'page:ops',
            'action:edit',
            'page:dashboard:executive',
          ],
        })
        toast.success('Login efetuado com sucesso!')
        navigate('/')
      } else {
        throw new Error('Credenciais inválidas')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('orgId')
    localStorage.removeItem('branchId')
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
