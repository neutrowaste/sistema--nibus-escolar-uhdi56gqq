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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Activity,
  MapPin,
  Filter,
  Play,
  Pause,
  FastForward,
  History,
  AlertCircle,
} from 'lucide-react'
import { useOfflineSync } from '@/contexts/OfflineSyncContext'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { format } from 'date-fns'

export default function CockpitPage() {
  const [viewMode, setViewMode] = useState('live') // 'live' or 'history'
  const [telemetry, setTelemetry] = useState({ lat: 100, lng: 100, speed: 45 })
  const { isOnline } = useOfflineSync()
  const [liveAlerts, setLiveAlerts] = useState<
    { id: number; msg: string; time: string; type: 'alert' | 'warning' }[]
  >([])

  // History State
  const [historyData, setHistoryData] = useState<any[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const lastAlertRef = useRef({ deviation: 0, stop: 0 })

  // Live Simulation
  useEffect(() => {
    if (viewMode !== 'live') return
    let p = 0
    const interval = setInterval(() => {
      p += 0.005
      if (p > 1) p = 0
      setTelemetry((prev) => {
        const nextLng = p < 0.5 ? 100 + 300 * p * 2 : 400 + 400 * (p - 0.5) * 2
        const nextLat = p < 0.5 ? 100 + 200 * p * 2 : 300 + 100 * (p - 0.5) * 2
        const speed = Math.max(0, 45 + (Math.random() * 20 - 5))

        const now = Date.now()
        // Simulate Deviation Alert
        if (p > 0.45 && p < 0.55 && now - lastAlertRef.current.deviation > 30000) {
          setLiveAlerts((la) =>
            [
              {
                id: now,
                msg: 'Desvio de Rota Crítico: Veículo ABC-1234',
                time: new Date().toLocaleTimeString(),
                type: 'alert',
              },
              ...la,
            ].slice(0, 5),
          )
          toast.error('Alerta de Desvio Detectado!')
          lastAlertRef.current.deviation = now
        }
        // Simulate Long Stop Alert
        if (speed < 5 && now - lastAlertRef.current.stop > 40000) {
          setLiveAlerts((la) =>
            [
              {
                id: now,
                msg: 'Parada Indevida (>5min) fora de checkpoint.',
                time: new Date().toLocaleTimeString(),
                type: 'warning',
              },
              ...la,
            ].slice(0, 5),
          )
          lastAlertRef.current.stop = now
        }

        return { lng: nextLng, lat: nextLat, speed }
      })
    }, 500)
    return () => clearInterval(interval)
  }, [viewMode])

  // History Playback
  useEffect(() => {
    if (viewMode === 'history') {
      api.history.getTrajectory(selectedDate, 'v1').then((data) => setHistoryData(data))
    }
  }, [viewMode, selectedDate])

  useEffect(() => {
    if (!isPlaying || historyData.length === 0) return
    const interval = setInterval(() => {
      setPlaybackProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false)
          return 100
        }
        return prev + 1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, historyData])

  const getHistoryPoint = () => {
    if (historyData.length < 2) return { lat: 100, lng: 100 }
    const idx = Math.min(
      Math.floor((playbackProgress / 100) * (historyData.length - 1)),
      historyData.length - 2,
    )
    const p1 = historyData[idx]
    const p2 = historyData[idx + 1]
    const localP = (playbackProgress / 100) * (historyData.length - 1) - idx
    return { lat: p1.lat + (p2.lat - p1.lat) * localP, lng: p1.lng + (p2.lng - p1.lng) * localP }
  }

  const hPoint = getHistoryPoint()

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 animate-fade-in">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cockpit Operacional</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Monitoramento Avançado
            </p>
          </div>
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
            <TabsList>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Activity className="w-4 h-4" /> Tempo Real
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" /> Playback Histórico
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="flex-1 relative overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner rounded-xl">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            {viewMode === 'live' ? (
              <>
                <path
                  d="M 100 100 L 400 300 L 800 400"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d={`M 100 100 L ${telemetry.lng} ${telemetry.lat}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle
                  cx={telemetry.lng}
                  cy={telemetry.lat}
                  r="8"
                  fill="#2563eb"
                  stroke="#fff"
                  strokeWidth="3"
                />
                <circle
                  cx={telemetry.lng}
                  cy={telemetry.lat}
                  r="20"
                  fill="#3b82f6"
                  opacity="0.2"
                  className="animate-ping"
                />
              </>
            ) : (
              <>
                {historyData.length > 0 && (
                  <path
                    d={`M ${historyData.map((p) => `${p.lng} ${p.lat}`).join(' L ')}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="4"
                    strokeDasharray="8 8"
                  />
                )}
                {historyData.length > 0 && (
                  <circle
                    cx={hPoint.lng}
                    cy={hPoint.lat}
                    r="10"
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth="3"
                    className="shadow-lg"
                  />
                )}
              </>
            )}
          </svg>
        </Card>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        {viewMode === 'live' ? (
          <Card className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-semibold flex items-center text-slate-800">
                <Activity className="w-4 h-4 mr-2 text-blue-500" /> Feed de Alertas em Tempo Real
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {liveAlerts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10">
                  Monitorando rotas. Nenhum alerta crítico.
                </p>
              ) : (
                liveAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-sm animate-slide-down ${alert.type === 'alert' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <AlertCircle
                        className={`w-4 h-4 ${alert.type === 'alert' ? 'text-red-500' : 'text-amber-500'}`}
                      />
                      <span className={alert.type === 'alert' ? 'text-red-800' : 'text-amber-800'}>
                        Alerta do Sistema
                      </span>
                      <span className="ml-auto text-xs font-normal text-slate-500">
                        {alert.time}
                      </span>
                    </div>
                    <p className={alert.type === 'alert' ? 'text-red-700' : 'text-amber-700'}>
                      {alert.msg}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold mb-5 flex items-center text-slate-800">
              <History className="w-4 h-4 mr-2 text-amber-500" /> Controles de Playback
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data da Viagem</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Veículo</label>
                <Select defaultValue="v1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">ABC-1234 (Volksbus)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setPlaybackProgress(0)}>
                    <History className="h-4 w-4" />
                  </Button>
                </div>
                <div className="pt-2">
                  <Slider
                    value={[playbackProgress]}
                    onValueChange={(v) => setPlaybackProgress(v[0])}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Início do dia</span>
                  <span>Fim do dia</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
