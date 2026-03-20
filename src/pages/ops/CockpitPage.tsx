import { useEffect, useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Activity, MapPin, Play, Pause, History, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

// Define window interface to avoid TS errors
declare global {
  interface Window {
    google: any
  }
}

export default function CockpitPage() {
  const [viewMode, setViewMode] = useState('live') // 'live' or 'history'
  const [liveAlerts, setLiveAlerts] = useState<
    { id: number; msg: string; time: string; type: 'alert' | 'warning' }[]
  >([])

  // Maps specific state & refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const polylineInstance = useRef<any>(null)
  const busMarkerInstance = useRef<any>(null)
  const infoWindowInstance = useRef<any>(null)
  const alertMarkersRef = useRef<any[]>([])

  const routePathRef = useRef<any[]>([])
  const [pathLength, setPathLength] = useState(0)

  // History State
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Live state refs
  const liveProgressRef = useRef(0)
  const lastAlertRef = useRef({ deviation: 0, stop: 0 })
  const animationFrameRef = useRef<number | null>(null)

  const loadGoogleMaps = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (window.google?.maps) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=geometry`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => toast.error('Erro ao carregar Google Maps')
      document.head.appendChild(script)
    })
  }, [])

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current || !window.google) return

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: -23.561414, lng: -46.655881 },
      zoom: 14,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    })

    polylineInstance.current = new window.google.maps.Polyline({
      map: mapInstance.current,
      path: [],
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 6,
    })

    busMarkerInstance.current = new window.google.maps.Marker({
      map: mapInstance.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Veículo Escolar',
      zIndex: 100,
    })

    infoWindowInstance.current = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 4px; font-family: sans-serif;">
          <h3 style="font-weight: bold; font-size: 14px; margin:0 0 4px 0;">Veículo ABC-1234</h3>
          <p style="font-size: 12px; color: #64748b; margin:0;">Motorista: João Mendes</p>
          <p style="font-size: 12px; color: #64748b; margin:0;">Rota: Rota Norte</p>
          <p style="font-size: 12px; color: #64748b; margin:0;">Alunos: 18/20</p>
          <span style="display:inline-block; margin-top:6px; background:#dbeafe; color:#1e40af; font-size:10px; padding:2px 6px; border-radius:4px; border: 1px solid #bfdbfe;">Em Rota</span>
        </div>
      `,
    })

    busMarkerInstance.current.addListener('click', () => {
      infoWindowInstance.current.open(mapInstance.current, busMarkerInstance.current)
    })
  }, [])

  const fetchDirectionsAndSnap = async (waypoints: { lat: number; lng: number }[]) => {
    if (!window.google) return []
    return new Promise<any[]>((resolve) => {
      const directionsService = new window.google.maps.DirectionsService()
      const origin = waypoints[0]
      const destination = waypoints[waypoints.length - 1]
      const waypts = waypoints.slice(1, -1).map((p) => ({ location: p, stopover: true }))

      directionsService.route(
        {
          origin,
          destination,
          waypoints: waypts,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) {
            resolve(result.routes[0].overview_path)
          } else {
            // Fallback to straight lines if API key is missing/restricted
            resolve(waypoints.map((w) => new window.google.maps.LatLng(w.lat, w.lng)))
          }
        },
      )
    })
  }

  const clearAlertsMap = () => {
    alertMarkersRef.current.forEach((m) => m.setMap(null))
    alertMarkersRef.current = []
  }

  // Load Map & Initial Data
  useEffect(() => {
    loadGoogleMaps().then(() => {
      initMap()
      loadRouteData()
    })
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [loadGoogleMaps, initMap])

  // Reload route when viewMode changes
  useEffect(() => {
    if (mapInstance.current) {
      loadRouteData()
    }
  }, [viewMode, selectedDate])

  const loadRouteData = async () => {
    // Generate some waypoints depending on mode to show different paths
    const waypoints =
      viewMode === 'live'
        ? [
            { lat: -23.561414, lng: -46.655881 },
            { lat: -23.573416, lng: -46.653633 },
            { lat: -23.587416, lng: -46.657633 },
          ]
        : await api.history.getTrajectory(selectedDate, 'v1')

    const path = await fetchDirectionsAndSnap(waypoints)
    routePathRef.current = path
    setPathLength(path.length)

    if (polylineInstance.current) polylineInstance.current.setPath(path)

    if (path.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      path.forEach((p: any) => bounds.extend(p))
      mapInstance.current.fitBounds(bounds)

      // Reset animations
      if (viewMode === 'live') {
        liveProgressRef.current = 0
        setLiveAlerts([])
        clearAlertsMap()
        startLiveSimulation()
      } else {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        setPlaybackProgress(0)
        updateBusPosition(0)
      }
    }
  }

  const updateBusPosition = (index: number) => {
    const path = routePathRef.current
    if (!path || path.length === 0 || !busMarkerInstance.current) return
    const safeIndex = Math.min(Math.max(0, Math.floor(index)), path.length - 1)
    busMarkerInstance.current.setPosition(path[safeIndex])
  }

  const startLiveSimulation = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

    let lastTime = Date.now()

    const animate = () => {
      const path = routePathRef.current
      if (!path || path.length === 0 || viewMode !== 'live') return

      const now = Date.now()
      if (now - lastTime > 100) {
        // Update every 100ms
        liveProgressRef.current += 0.5 // Speed of simulation
        if (liveProgressRef.current >= path.length) liveProgressRef.current = 0

        updateBusPosition(liveProgressRef.current)

        // Random Alerts Simulation
        const pRatio = liveProgressRef.current / path.length
        if (pRatio > 0.45 && pRatio < 0.55 && now - lastAlertRef.current.deviation > 30000) {
          const pos = path[Math.floor(liveProgressRef.current)]
          addMapAlert(pos, 'Desvio de Rota Crítico Detectado')
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

        lastTime = now
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  const addMapAlert = (position: any, title: string) => {
    if (!window.google) return
    const marker = new window.google.maps.Marker({
      position,
      map: mapInstance.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title,
    })
    alertMarkersRef.current.push(marker)
  }

  // Handle Playback Slider & Auto-play
  useEffect(() => {
    if (viewMode === 'live') return

    const path = routePathRef.current
    if (!path || path.length === 0) return

    if (isPlaying) {
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
    }
  }, [isPlaying, viewMode, pathLength])

  useEffect(() => {
    if (viewMode === 'history' && pathLength > 0) {
      const index = (playbackProgress / 100) * (pathLength - 1)
      updateBusPosition(index)
    }
  }, [playbackProgress, viewMode, pathLength])

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 animate-fade-in">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cockpit Operacional</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Monitoramento Avançado com Google Maps
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

        <Card className="flex-1 relative overflow-hidden border-2 border-slate-200 shadow-inner rounded-xl">
          {/* Map Container */}
          <div ref={mapRef} className="absolute inset-0 w-full h-full bg-slate-100" />

          {!window.google && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center text-slate-500">
                <Activity className="w-8 h-8 animate-spin mb-2" />
                <p>Inicializando Motor de Mapas...</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        {viewMode === 'live' ? (
          <Card className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-semibold flex items-center text-slate-800">
                <Activity className="w-4 h-4 mr-2 text-blue-500" /> Feed de Alertas (Tempo Real)
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
                    onValueChange={(v) => {
                      setPlaybackProgress(v[0])
                      setIsPlaying(false)
                    }}
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
