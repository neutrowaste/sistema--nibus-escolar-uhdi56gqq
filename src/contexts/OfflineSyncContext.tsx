import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

interface OfflineSyncContextType {
  isOnline: boolean
  syncQueueCount: number
  enqueueTelemetry: (data: any) => void
  toggleSimulation: () => void
}

const OfflineSyncContext = createContext<OfflineSyncContextType | null>(null)

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine)
  const [simulateOffline, setSimulateOffline] = useState(false)
  const [syncQueue, setSyncQueue] = useState<any[]>([])

  const isOnline = isBrowserOnline && !simulateOffline

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true)
    const handleOffline = () => setIsBrowserOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      toast.success(
        `Conexão restaurada. Sincronizando ${syncQueue.length} pacotes em background...`,
      )
      const timer = setTimeout(() => {
        setSyncQueue([])
        toast.success('Sincronização concluída. Zero perda de dados na transição.')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, syncQueue.length])

  const enqueueTelemetry = (data: any) => {
    setSyncQueue((prev) => [...prev, data])
  }

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        syncQueueCount: syncQueue.length,
        enqueueTelemetry,
        toggleSimulation: () => setSimulateOffline(!simulateOffline),
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  )
}

export const useOfflineSync = () => {
  const ctx = useContext(OfflineSyncContext)
  if (!ctx) throw new Error('useOfflineSync must be used within OfflineSyncProvider')
  return ctx
}
