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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Activity,
  MapPin,
  Play,
  Pause,
  History,
  AlertCircle,
  Layers,
  Wrench,
  TrafficCone,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

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

  const [layers, setLayers] = useState({
    buses: true,
    stops: true,
    maintenance: true,
    traffic: false,
  })
  const [zoneModal, setZoneModal] = useState({ open: false, type: 'interest', name: '' })
  const [pendingZone, setPendingZone] = useState<any>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const polylineInstance = useRef<any>(null)
  const busMarkerInstance = useRef<any>(null)
  const alertBadgeInstance = useRef<any>(null)
  const infoWindowInstance = useRef<any>(null)

  const drawingManagerInstance = useRef<any>(null)
  const trafficLayerInstance = useRef<any>(null)
  const alertMarkersRef = useRef<any[]>([])
  const stopsMarkersRef = useRef<any[]>([])
  const maintenanceMarkersRef = useRef<any[]>([])

  const routePathRef = useRef<any[]>([])
  const [pathLength, setPathLength] = useState(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const liveProgressRef = useRef(0)
  const lastAlertRef = useRef({ deviation: 0, stop: 0 })
  const animationFrameRef = useRef<number | null>(null)
  const pulsePhaseRef = useRef(0)

  const loadGoogleMaps = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (window.google?.maps) return resolve()
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=geometry,drawing`
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
      zIndex: 100,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Veículo Escolar',
    })

    alertBadgeInstance.current = new window.google.maps.Marker({
      map: null,
      zIndex: 101,
      title: 'Alerta Crítico',
      icon: {
        path: 'M0,22 L12,1 L24,22 Z',
        fillColor: '#f59e0b',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#fff',
        scale: 0.8,
        anchor: new window.google.maps.Point(12, 11),
      },
    })

    infoWindowInstance.current = new window.google.maps.InfoWindow({
      content: `<div style="padding: 4px; font-family: sans-serif;"><h3 style="font-weight: bold; font-size: 14px; margin:0 0 4px 0;">Veículo ABC-1234</h3><p style="font-size: 12px; color: #64748b; margin:0;">Motorista: João Mendes</p><p style="font-size: 12px; color: #64748b; margin:0;">Rota: Rota Norte</p><p style="font-size: 12px; color: #64748b; margin:0;">Alunos: 18/20</p><span style="display:inline-block; margin-top:6px; background:#dbeafe; color:#1e40af; font-size:10px; padding:2px 6px; border-radius:4px; border: 1px solid #bfdbfe;">Em Rota</span></div>`,
    })

    busMarkerInstance.current.addListener('click', () =>
      infoWindowInstance.current.open(mapInstance.current, busMarkerInstance.current),
    )

    trafficLayerInstance.current = new window.google.maps.TrafficLayer()

    drawingManagerInstance.current = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon'],
      },
      polygonOptions: {
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        strokeWeight: 2,
        clickable: true,
        editable: false,
        zIndex: 1,
      },
    })
    drawingManagerInstance.current.setMap(mapInstance.current)

    window.google.maps.event.addListener(
      drawingManagerInstance.current,
      'overlaycomplete',
      (e: any) => {
        if (e.type === 'polygon') {
          setPendingZone(e.overlay)
          setZoneModal((z) => ({ ...z, open: true }))
          drawingManagerInstance.current.setDrawingMode(null)
        }
      },
    )

    const createStatic = (lat: number, lng: number, path: any, color: string, title: string) =>
      new window.google.maps.Marker({
        position: { lat, lng },
        map: null,
        title,
        icon: {
          path,
          scale: 5,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#fff',
        },
      })

    stopsMarkersRef.current = [
      createStatic(
        -23.565414,
        -46.654881,
        window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        '#10b981',
        'Parada Norte',
      ),
      createStatic(
        -23.578416,
        -46.655633,
        window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        '#10b981',
        'Parada Sul',
      ),
    ]
    maintenanceMarkersRef.current = [
      createStatic(
        -23.581416,
        -46.651633,
        window.google.maps.SymbolPath.CIRCLE,
        '#f59e0b',
        'Alerta de Manutenção (Oficina)',
      ),
    ]
  }, [])

  const fetchDirectionsAndSnap = async (waypoints: { lat: number; lng: number }[]) => {
    if (!window.google) return []
    return new Promise<any[]>((resolve) => {
      const directionsService = new window.google.maps.DirectionsService()
      directionsService.route(
        {
          origin: waypoints[0],
          destination: waypoints[waypoints.length - 1],
          waypoints: waypoints.slice(1, -1).map((p) => ({ location: p, stopover: true })),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) resolve(result.routes[0].overview_path)
          else resolve(waypoints.map((w) => new window.google.maps.LatLng(w.lat, w.lng)))
        },
      )
    })
  }

  useEffect(() => {
    loadGoogleMaps().then(() => {
      initMap()
      loadRouteData()
    })
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [loadGoogleMaps, initMap])

  useEffect(() => {
    if (!mapInstance.current) return
    busMarkerInstance.current?.setMap(layers.buses ? mapInstance.current : null)
    alertBadgeInstance.current?.setMap(layers.buses ? mapInstance.current : null)
    trafficLayerInstance.current?.setMap(layers.traffic ? mapInstance.current : null)
    stopsMarkersRef.current.forEach((m) => m.setMap(layers.stops ? mapInstance.current : null))
    maintenanceMarkersRef.current.forEach((m) =>
      m.setMap(layers.maintenance ? mapInstance.current : null),
    )
  }, [layers])

  useEffect(() => {
    if (mapInstance.current) loadRouteData()
  }, [viewMode, selectedDate])

  const loadRouteData = async () => {
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

      if (viewMode === 'live') {
        liveProgressRef.current = 0
        setLiveAlerts([])
        alertMarkersRef.current.forEach((m) => m.setMap(null))
        alertMarkersRef.current = []
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
    busMarkerInstance.current.setPosition(
      path[Math.min(Math.max(0, Math.floor(index)), path.length - 1)],
    )
  }

  const startLiveSimulation = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    let lastTime = Date.now()

    const animate = () => {
      const path = routePathRef.current
      if (!path || path.length === 0 || viewMode !== 'live') return

      const now = Date.now()
      if (now - lastTime > 100) {
        liveProgressRef.current += 0.5
        if (liveProgressRef.current >= path.length) liveProgressRef.current = 0

        const pRatio = liveProgressRef.current / path.length
        const isSpeeding = pRatio > 0.4 && pRatio < 0.45
        const isDeviating = pRatio > 0.5 && pRatio < 0.55
        const hasAlert = isSpeeding || isDeviating

        if (hasAlert && now - lastAlertRef.current.deviation > 30000) {
          const pos = path[Math.floor(liveProgressRef.current)]
          const title = isSpeeding ? 'Excesso de Velocidade Detectado' : 'Desvio de Rota Crítico'
          if (window.google) {
            const marker = new window.google.maps.Marker({
              position: pos,
              map: mapInstance.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: '#ef4444',
                fillOpacity: 0.5,
                strokeColor: '#ffffff',
                strokeWeight: 1,
              },
              title,
            })
            alertMarkersRef.current.push(marker)
          }
          setLiveAlerts((la) =>
            [
              {
                id: now,
                msg: `${title}: Veículo ABC-1234`,
                time: new Date().toLocaleTimeString(),
                type: 'alert',
              },
              ...la,
            ].slice(0, 5),
          )
          toast.error(`Alerta: ${title}!`)
          lastAlertRef.current.deviation = now
        }

        pulsePhaseRef.current += 0.3
        let scale = 8,
          color = '#2563eb'

        if (isSpeeding) {
          scale = 8 + Math.sin(pulsePhaseRef.current) * 3
          color = '#ef4444'
          alertBadgeInstance.current.setMap(null)
        } else if (isDeviating) {
          color = '#f59e0b'
          const pos = path[Math.floor(liveProgressRef.current)]
          alertBadgeInstance.current.setPosition({ lat: pos.lat + 0.0003, lng: pos.lng + 0.0003 })
          if (layers.buses) alertBadgeInstance.current.setMap(mapInstance.current)
        } else {
          alertBadgeInstance.current.setMap(null)
        }

        busMarkerInstance.current.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        })
        updateBusPosition(liveProgressRef.current)
        lastTime = now
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  useEffect(() => {
    if (viewMode === 'live' || !routePathRef.current || routePathRef.current.length === 0) return
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
    if (viewMode === 'history' && pathLength > 0)
      updateBusPosition((playbackProgress / 100) * (pathLength - 1))
  }, [playbackProgress, viewMode, pathLength])

  const saveZone = () => {
    if (!pendingZone || !window.google) return
    const color = zoneModal.type === 'risk' ? '#ef4444' : '#10b981'
    pendingZone.setOptions({ fillColor: color, strokeColor: color })
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="padding: 4px; font-family: sans-serif;"><strong style="font-size: 14px;">${zoneModal.name || 'Nova Zona'}</strong><br/><span style="font-size: 12px; color: #64748b;">Zona de ${zoneModal.type === 'risk' ? 'Risco' : 'Interesse'}</span></div>`,
    })
    pendingZone.addListener('click', (e: any) => {
      infoWindow.setPosition(e.latLng)
      infoWindow.open(mapInstance.current)
    })
    toast.success(`Zona salva com sucesso!`)
    setZoneModal({ ...zoneModal, open: false, name: '' })
    setPendingZone(null)
  }

  const cancelZone = () => {
    if (pendingZone) pendingZone.setMap(null)
    setZoneModal({ ...zoneModal, open: false })
    setPendingZone(null)
  }

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
        <Card className="p-4">
          <h3 className="font-semibold flex items-center text-slate-800 mb-4">
            <Layers className="w-4 h-4 mr-2 text-primary" /> Camadas do Mapa
          </h3>
          <div className="space-y-3">
            {[
              {
                key: 'buses',
                label: 'Veículos em Movimento',
                icon: Activity,
                color: 'text-blue-500',
              },
              { key: 'stops', label: 'Pontos de Parada', icon: MapPin, color: 'text-emerald-500' },
              {
                key: 'maintenance',
                label: 'Alertas de Manutenção',
                icon: Wrench,
                color: 'text-amber-500',
              },
              {
                key: 'traffic',
                label: 'Trânsito em Tempo Real',
                icon: TrafficCone,
                color: 'text-orange-500',
              },
            ].map((l) => (
              <div key={l.key} className="flex items-center justify-between">
                <Label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <l.icon className={`w-4 h-4 ${l.color}`} /> {l.label}
                </Label>
                <Switch
                  checked={(layers as any)[l.key]}
                  onCheckedChange={(v) => setLayers((prev) => ({ ...prev, [l.key]: v }))}
                />
              </div>
            ))}
          </div>
        </Card>

        {viewMode === 'live' ? (
          <Card className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-semibold flex items-center text-slate-800">
                <Activity className="w-4 h-4 mr-2 text-blue-500" /> Feed de Alertas
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

      <Dialog
        open={zoneModal.open}
        onOpenChange={(o) => {
          if (!o) cancelZone()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Zona Geográfica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Zona</Label>
              <Input
                value={zoneModal.name}
                onChange={(e) => setZoneModal((z) => ({ ...z, name: e.target.value }))}
                placeholder="Ex: Área Escolar 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Zona</Label>
              <Select
                value={zoneModal.type}
                onValueChange={(v: any) => setZoneModal((z) => ({ ...z, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interest">Zona de Interesse (Verde)</SelectItem>
                  <SelectItem value="risk">Zona de Risco (Vermelho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelZone}>
              Cancelar
            </Button>
            <Button onClick={saveZone}>Salvar Zona</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
