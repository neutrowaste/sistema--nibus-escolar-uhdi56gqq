import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Activity, Download, MapPin, Layers } from 'lucide-react'
import { useOfflineSync } from '@/contexts/OfflineSyncContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function CockpitPage() {
  const [telemetry, setTelemetry] = useState({ lat: 100, lng: 100, speed: 45, battery: 89 })
  const { isOnline, enqueueTelemetry } = useOfflineSync()
  const { addNotification } = useNotifications()

  const isOnlineRef = useRef(isOnline)
  const enqueueTelemetryRef = useRef(enqueueTelemetry)
  const addNotificationRef = useRef(addNotification)
  const lastAlertRef = useRef({ outOfBounds: 0, speeding: 0, approaching: 0 })

  useEffect(() => {
    isOnlineRef.current = isOnline
    enqueueTelemetryRef.current = enqueueTelemetry
    addNotificationRef.current = addNotification
  }, [isOnline, enqueueTelemetry, addNotification])

  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += 0.005
      if (p > 1) p = 0
      setTelemetry((prev) => {
        const nextLng = p < 0.5 ? 100 + 300 * p * 2 : 400 + 400 * (p - 0.5) * 2
        const nextLat = p < 0.5 ? 100 + 200 * p * 2 : 300 + 100 * (p - 0.5) * 2
        const nextSpeed = Math.max(0, 45 + (Math.random() * 20 - 5))

        const nextTelemetry = {
          lng: nextLng,
          lat: nextLat,
          speed: nextSpeed,
          battery: Math.max(0, prev.battery - 0.02),
        }
        if (!isOnlineRef.current) enqueueTelemetryRef.current(nextTelemetry)

        const now = Date.now()
        const dist = Math.sqrt(Math.pow(nextLng - 300, 2) + Math.pow(nextLat - 200, 2))

        if (p > 0.78 && p < 0.82 && now - lastAlertRef.current.approaching > 60000) {
          api.notifications.sendExternal('bus_approaching', `Ônibus em aproximação.`, 'r1')
          lastAlertRef.current.approaching = now
        }
        if (dist > 180 && now - lastAlertRef.current.outOfBounds > 20000) {
          addNotificationRef.current({
            title: 'Alerta: Desvio',
            message: `Veículo fora da rota.`,
            type: 'warning',
          })
          lastAlertRef.current.outOfBounds = now
        }
        if (nextSpeed > 60 && now - lastAlertRef.current.speeding > 15000) {
          addNotificationRef.current({
            title: 'Excesso de Velocidade',
            message: `${nextSpeed.toFixed(0)}km/h.`,
            type: 'alert',
          })
          lastAlertRef.current.speeding = now
        }
        return nextTelemetry
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleExport = (format: string) => {
    toast.info(`Exportando telemetria em ${format}...`)
    setTimeout(() => toast.success(`Arquivo gerado.`), 1200)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 animate-fade-in">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cockpit Operacional</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Integração OpenStreetMap & Tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Filtrar por Rota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Rotas</SelectItem>
                <SelectItem value="r1">Rota Norte - Manhã</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white">
                  <Download className="mr-2 h-4 w-4" /> Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('PDF')}>
                  Telemetria PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('CSV')}>
                  Telemetria CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge variant="outline" className="bg-white px-3 py-1.5 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>1
              Online
            </Badge>
          </div>
        </div>

        <Card className="flex-1 relative overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner rounded-xl group">
          {/* Interactive OpenStreetMap Integration */}
          <iframe
            className="absolute inset-0 w-full h-full pointer-events-auto transition-all duration-700"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-46.75,-23.65,-46.50,-23.45&amp;layer=mapnik"
            style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1)' }}
            title="OpenStreetMap View"
          />

          {/* SVG Overlay for Telemetry Routes & Geofences */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 100 100 L 400 300 L 800 400"
              fill="none"
              stroke="#64748b"
              strokeWidth="6"
              strokeLinecap="round"
              className="opacity-60"
            />
            <circle
              cx="300"
              cy="200"
              r="180"
              fill="#ef4444"
              fillOpacity="0.05"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="8 8"
              className="opacity-70"
            />
            <path
              d={`M 100 100 L ${telemetry.lng} ${telemetry.lat}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeLinecap="round"
            />

            <circle cx="250" cy="200" r="10" fill="#10b981" stroke="#fff" strokeWidth="3" />
            <circle cx="600" cy="350" r="10" fill="#3b82f6" stroke="#fff" strokeWidth="3" />
            <circle
              cx="350"
              cy="150"
              r="10"
              fill="#ef4444"
              stroke="#fff"
              strokeWidth="3"
              className="animate-pulse"
            />
          </svg>

          {/* Real-time Tracking Marker */}
          <div
            className="absolute pointer-events-none transition-all duration-300 ease-linear"
            style={{ top: telemetry.lat - 16, left: telemetry.lng - 16 }}
          >
            <div className="h-8 w-8 bg-blue-600 rounded-full border-4 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] flex items-center justify-center relative z-10">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap border border-slate-700 font-medium">
              ABC-1234
            </div>
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
          </div>

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm p-2 rounded-lg border flex gap-2 pointer-events-auto">
            <Button variant="secondary" size="sm" className="h-8 text-xs">
              <Layers className="h-3 w-3 mr-1" /> Mapa Base
            </Button>
          </div>
        </Card>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        <Card className="p-5 flex-1 flex flex-col">
          <h3 className="font-semibold mb-5 flex items-center text-slate-800">
            <Activity className="w-4 h-4 mr-2 text-blue-500" /> Gateway IoT & Telemetria
          </h3>
          <div className="space-y-6 flex-1">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">Velocidade (GPS)</span>
                <span
                  className={
                    telemetry.speed > 60
                      ? 'font-mono font-bold text-red-600'
                      : 'font-mono font-bold text-slate-700'
                  }
                >
                  {telemetry.speed.toFixed(0)} km/h
                </span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${telemetry.speed > 60 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${(telemetry.speed / 80) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">Energia (Gateway)</span>
                <span className="font-mono font-bold text-slate-700">
                  {telemetry.battery.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${telemetry.battery > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${telemetry.battery}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-start gap-3 text-sm text-slate-700 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                <span className="leading-relaxed">
                  Controle de perímetro ativado. Notificações configuradas para desvios superiores a{' '}
                  <strong className="text-slate-900">180 metros</strong> do eixo planejado.
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
