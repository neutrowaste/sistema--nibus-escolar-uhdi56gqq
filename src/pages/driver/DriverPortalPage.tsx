import React, { useEffect, useState, useRef } from 'react'
import { MapPin, Navigation, CheckCircle2, LogOut, CircleDot, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useOfflineSync } from '@/contexts/OfflineSyncContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api, Route, Checkpoint } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function DriverPortalPage() {
  const { logout, user } = useAuth()
  const { isOnline, toggleSimulation, syncQueueCount, enqueueTelemetry } = useOfflineSync()
  const [route, setRoute] = useState<Route | null>(null)
  const [location, setLocation] = useState({ lat: 100, lng: 100 })
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [isNavigating, setIsNavigating] = useState(false)
  const progressRef = useRef(0)

  useEffect(() => {
    api.routes.list().then((routes) => {
      const myRoute = routes.find((r) => r.driver === 'João Mendes') || routes[0]
      setRoute(myRoute)
      setCheckpoints(myRoute.checkpoints.map((cp) => ({ ...cp, status: 'pending' as any })))
    })
  }, [])

  useEffect(() => {
    if (!isNavigating || !route) return
    const interval = setInterval(() => {
      progressRef.current += 0.005
      if (progressRef.current > 1) {
        setIsNavigating(false)
        toast.success('Rota Concluída!')
        return
      }

      const currLat = 100 + 300 * progressRef.current
      const currLng = 100 + 400 * progressRef.current
      setLocation({ lat: currLat, lng: currLng })

      setCheckpoints((prev) =>
        prev.map((cp) => {
          if ((cp as any).status === 'completed') return cp
          const dist = Math.hypot(cp.lat - currLat, cp.lng - currLng)
          if (dist <= cp.radius) {
            // Check Offline Sync capabilities
            if (!isOnline) {
              enqueueTelemetry({ type: 'checkin', cpId: cp.id, timestamp: Date.now() })
              toast.warning(
                `Modo Offline: Checkpoint ${cp.name} salvo localmente para sincronização.`,
              )
            } else {
              toast.success(`Checkpoint Atingido online: ${cp.name}`)
            }
            return { ...cp, status: 'completed' as any }
          }
          return cp
        }),
      )
    }, 200)
    return () => clearInterval(interval)
  }, [isNavigating, route, isOnline, enqueueTelemetry])

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-lg leading-none">Motorista App</h1>
          <p className="text-xs text-slate-400 mt-1">{user?.name} • Veículo ABC-1234</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSimulation}
            className={cn('relative', isOnline ? 'text-slate-300' : 'text-amber-500')}
            title="Simular perda de rede"
          >
            {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            {syncQueueCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                {syncQueueCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-slate-300 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 w-full max-w-md mx-auto space-y-4">
        {!isOnline && (
          <div className="bg-amber-100 border border-amber-200 text-amber-800 p-3 rounded-md text-sm font-medium animate-pulse flex items-center gap-2">
            <WifiOff className="h-4 w-4" /> Trabalhando Offline - Dados serão sincronizados
          </div>
        )}

        {route ? (
          <>
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-48 bg-slate-200 relative">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 500 500"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 100 100 L 400 500"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="8"
                    strokeDasharray="10 10"
                  />
                  {checkpoints.map((cp) => (
                    <circle
                      key={cp.id}
                      cx={cp.lat}
                      cy={cp.lng}
                      r={cp.radius}
                      fill="none"
                      stroke={(cp as any).status === 'completed' ? '#10b981' : '#3b82f6'}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="opacity-50"
                    />
                  ))}
                  <circle
                    cx={location.lat}
                    cy={location.lng}
                    r="12"
                    fill="#3b82f6"
                    className="shadow-lg transition-all duration-200"
                  />
                </svg>
              </div>
              <CardContent className="p-4 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{route.name}</h3>
                    <p className="text-sm text-slate-500">
                      {route.startPoint} → {route.endPoint}
                    </p>
                  </div>
                  <Badge
                    variant={isNavigating ? 'default' : 'secondary'}
                    className={isNavigating ? 'bg-blue-600' : ''}
                  >
                    {isNavigating ? 'Em Andamento' : 'Pendente'}
                  </Badge>
                </div>
                <Button
                  className="w-full h-12 text-base"
                  onClick={() => setIsNavigating(!isNavigating)}
                  variant={isNavigating ? 'destructive' : 'default'}
                >
                  {isNavigating ? 'Pausar Viagem' : 'Iniciar Navegação e Geofencing'}
                </Button>
              </CardContent>
            </Card>

            <h4 className="font-semibold text-slate-800 pt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Checkpoints da Rota
            </h4>
            <div className="space-y-3">
              {checkpoints.map((cp) => {
                const isCompleted = (cp as any).status === 'completed'
                return (
                  <Card
                    key={cp.id}
                    className={cn(
                      'border-l-4 transition-colors',
                      isCompleted ? 'border-l-emerald-500 bg-emerald-50/50' : 'border-l-slate-300',
                    )}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <CircleDot className="h-6 w-6 text-slate-300" />
                        )}
                        <div>
                          <p
                            className={cn(
                              'font-semibold text-sm',
                              isCompleted ? 'text-emerald-900' : 'text-slate-900',
                            )}
                          >
                            {cp.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Auto-check no raio de {cp.radius}m
                          </p>
                        </div>
                      </div>
                      {isCompleted && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          Atingido
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-center p-8 text-slate-500">Carregando rotas...</p>
        )}
      </main>
    </div>
  )
}
