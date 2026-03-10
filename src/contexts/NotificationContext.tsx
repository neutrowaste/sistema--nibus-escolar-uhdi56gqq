import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { toast } from 'sonner'

export type AlertCategory = 'Traffic' | 'Maintenance' | 'Operational'

export interface AppNotification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  category: AlertCategory
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  soundSettings: Record<AlertCategory, boolean>
  toggleSoundSetting: (cat: AlertCategory) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      title: 'Via Bloqueada',
      message: 'Acidente na Av. Brasil. Rota Norte afetada.',
      read: false,
      createdAt: new Date().toISOString(),
      category: 'Traffic',
    },
    {
      id: '2',
      title: 'Manutenção Preventiva',
      message: 'Veículo XYZ-9876 próximo de 10.000km.',
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      category: 'Maintenance',
    },
  ])

  const [soundSettings, setSoundSettings] = useState<Record<AlertCategory, boolean>>({
    Traffic: true,
    Maintenance: false,
    Operational: true,
  })

  const playAlertSound = () => {
    // Attempt to play a subtle beep using web audio API or HTML5 Audio
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) {
      /* ignore */
    }
  }

  const toggleSoundSetting = (cat: AlertCategory) => {
    setSoundSettings((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

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

    if (soundSettings[n.category]) {
      playAlertSound()
    }

    toast(newNotif.title, {
      description: newNotif.message,
      icon: n.category === 'Traffic' ? '🚦' : n.category === 'Maintenance' ? '🔧' : '⚙️',
    })
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundSettings,
        toggleSoundSetting,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
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
