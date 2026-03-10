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
import { Activity, AlertTriangle, Download } from 'lucide-react'
import { useOfflineSync } from '@/contexts/OfflineSyncContext'
import { toast } from 'sonner'

export default function CockpitPage() {
  const [telemetry, setTelemetry] = useState({ lat: 100, lng: 100, speed: 45, battery: 89 })
  const { isOnline, enqueueTelemetry } = useOfflineSync()

  const isOnlineRef = useRef(isOnline)
  const enqueueTelemetryRef = useRef(enqueueTelemetry)

  useEffect(() => {
    isOnlineRef.current = isOnline
    enqueueTelemetryRef.current = enqueueTelemetry
  }, [isOnline, enqueueTelemetry])

  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += 0.005
      if (p > 1) p = 0
      setTelemetry((prev) => {
        const nextTelemetry = {
          lng: p < 0.5 ? 100 + 300 * p * 2 : 400 + 400 * (p - 0.5) * 2,
          lat: p < 0.5 ? 100 + 200 * p * 2 : 300 + 100 * (p - 0.5) * 2,
          speed: Math.max(0, 45 + (Math.random() * 10 - 5)),
          battery: Math.max(0, prev.battery - 0.02),
        }

        if (!isOnlineRef.current) {
          enqueueTelemetryRef.current(nextTelemetry)
        }

        return nextTelemetry
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleExport = (format: string) => {
    toast.info(`Iniciando exportação de telemetria em ${format}...`)
    setTimeout(() => {
      toast.success(`Arquivo telemetry_export.${format.toLowerCase()} gerado com sucesso.`)
    }, 1200)
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 animate-fade-in">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cockpit de Monitoramento</h1>
            <p className="text-sm text-muted-foreground">
              Rastreamento em tempo real da frota ativa.
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
              Veículo Online
            </Badge>
          </div>
        </div>

        <Card className="flex-1 relative overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner">
          <div className="absolute inset-0 map-grid-pattern opacity-50"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 100 100 L 400 300 L 800 400"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="4"
              className="opacity-40"
            />
            <path
              d={`M 100 100 L ${telemetry.lng} ${telemetry.lat}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
            />

            <circle cx="250" cy="200" r="8" fill="#10b981" />
            <circle cx="600" cy="350" r="8" fill="#3b82f6" />
            <circle cx="350" cy="150" r="8" fill="#ef4444" className="animate-pulse" />
          </svg>

          <div
            className="absolute group cursor-pointer animate-float"
            style={{ top: telemetry.lat - 12, left: telemetry.lng - 12 }}
          >
            <div className="h-6 w-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center relative z-10">
              <div className="h-2 w-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              ABC-1234
            </div>
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          </div>

          <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm text-xs flex flex-col gap-2 border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Chegada/Embarque
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div> Desembarque
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Alerta na Rota
            </div>
          </div>
        </Card>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center text-slate-800">
            <Activity className="w-4 h-4 mr-2 text-blue-500" /> Gateway MQTT (Tempo Real)
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Velocidade Atual</span>
                <span className="font-mono font-medium">{telemetry.speed.toFixed(0)} km/h</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(telemetry.speed / 80) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Bateria do Dispositivo</span>
                <span className="font-mono font-medium">{telemetry.battery.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${telemetry.battery > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${telemetry.battery}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-100">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Desvio leve de rota detectado no último quilômetro (ABC-1234).</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
