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
  role?: string
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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (email && pass) {
        localStorage.setItem('orgId', 'org-8103')
        localStorage.setItem('branchId', 'br-001')

        let userRole = 'admin'
        let userName = 'Admin Global'
        let perms = [
          'page:iam',
          'page:fleet',
          'page:ops',
          'action:edit',
          'page:dashboard:executive',
        ]
        let redirectPath = '/'

        if (email.includes('parent')) {
          userRole = 'parent'
          userName = 'Responsável (Familiar)'
          perms = ['page:parents:portal']
          redirectPath = '/parents/portal'
        } else if (email.includes('driver')) {
          userRole = 'driver'
          userName = 'João Mendes (Motorista)'
          perms = ['page:driver:portal']
          redirectPath = '/driver/portal'
        }

        setUser({
          id: userRole === 'admin' ? 'u-123' : userRole === 'parent' ? 'p-123' : 'd-123',
          name: userName,
          email: email,
          avatar: `https://img.usecurling.com/ppl/thumbnail?gender=${userRole === 'driver' ? 'male' : 'female'}&seed=12`,
          orgId: 'org-8103',
          branchId: 'br-001',
          permissions: perms,
          role: userRole,
        })
        toast.success('Login efetuado com sucesso!')
        navigate(redirectPath)
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
