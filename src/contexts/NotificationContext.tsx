import { createContext, useContext, useState, ReactNode } from 'react'
import { toast } from 'sonner'

export interface AppNotification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  type: 'alert' | 'info' | 'warning'
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '3',
      title: 'Alerta de Manutenção',
      message: 'Veículo XYZ-9876 atingiu 50.000km. Necessário agendar troca de óleo.',
      read: false,
      createdAt: new Date().toISOString(),
      type: 'warning',
    },
    {
      id: '1',
      title: 'Dispositivo Offline',
      message: 'Gateway veicular ABC-1234 perdeu conexão de rede há 5 minutos.',
      read: false,
      createdAt: new Date(Date.now() - 300000).toISOString(),
      type: 'warning',
    },
    {
      id: '2',
      title: 'Desvio de Rota Crítico',
      message: 'Veículo XYZ-9876 saiu da rota planejada.',
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      type: 'alert',
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const addNotification = (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: Math.random().toString(36).substring(7),
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotif, ...prev])
    toast(newNotif.title, { description: newNotif.message })
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
