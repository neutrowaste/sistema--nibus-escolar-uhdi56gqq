import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Activity,
  Play,
  Pause,
  History,
  AlertCircle,
  Layers,
  MapPin,
  Wrench,
  TrafficCone,
  SquareDashed,
  Check,
  X,
  Route as RouteIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, Route } from '@/lib/api'
import { useGoogleMaps } from '@/contexts/GoogleMapsContext'

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
    gm_authFailure?: () => void
  }
}

export default function CockpitPage() {
  const { isLoaded, loadError } = useGoogleMaps()

  const [viewMode, setViewMode] = useState('live')
  const [liveAlerts, setLiveAlerts] = useState<{ id: number; msg: string; time: string }[]>([])
  const [layers, setLayers] = useState({
    buses: true,
    stops: true,
    maintenance: true,
    traffic: false,
  })

  const [zoneModal, setZoneModal] = useState({ open: false, type: 'interest', name: '' })
  const [pendingZone, setPendingZone] = useState<any>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const isDrawingRef = useRef(false)
  const drawingPathRef = useRef<any[]>([])
  const previewPolygonRef = useRef<any>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const polylineInstance = useRef<any>(null)
  const busMarkerInstance = useRef<any>(null)
  const trafficLayerInstance = useRef<any>(null)

  const polygonsRef = useRef<any[]>([])
  const stopsMarkersRef = useRef<any[]>([])
  const maintenanceMarkersRef = useRef<any[]>([])
  const routePathRef = useRef<any[]>([])

  const [pathLength, setPathLength] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const liveProgressRef = useRef(0)
  const lastAlertRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  // Route Editing State
  const [dbRoutes, setDbRoutes] = useState<Route[]>([])
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const prevRouteIdRef = useRef<string | null>(null)
  const editingMarkersRef = useRef<any[]>([])

  useEffect(() => {
    api.routes.list().then(setDbRoutes)
  }, [])

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current || !window.google?.maps) return
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: -23.561414, lng: -46.655881 },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      mapId: 'DEMO_MAP_ID',
    })

    polylineInstance.current = new window.google.maps.Polyline({
      map: mapInstance.current,
      path: [],
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 6,
      zIndex: 50,
    })

    busMarkerInstance.current = new window.google.maps.marker.AdvancedMarkerElement({
      map: mapInstance.current,
      zIndex: 100,
    })

    trafficLayerInstance.current = new window.google.maps.TrafficLayer()

    window.google.maps.event.addListener(mapInstance.current, 'click', (e: any) => {
      if (!isDrawingRef.current) return
      drawingPathRef.current.push(e.latLng)
      if (!previewPolygonRef.current) {
        previewPolygonRef.current = new window.google.maps.Polygon({
          map: mapInstance.current,
          path: drawingPathRef.current,
          fillColor: '#3b82f6',
          fillOpacity: 0.3,
          strokeWeight: 2,
          clickable: false,
        })
      } else {
        previewPolygonRef.current.setPath(drawingPathRef.current)
      }
    })

    const stopSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" rx="6" fill="#10b981" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="white"/></svg>`
    const maintSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect width="28" height="28" rx="6" fill="#f59e0b" stroke="white" stroke-width="2"/><path d="M16 12l-4 4m0-4l4 4" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`

    const createIconElement = (svg: string) => {
      const el = document.createElement('div')
      el.innerHTML = svg
      return el
    }

    stopsMarkersRef.current = [
      new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: -23.565414, lng: -46.654881 },
        content: createIconElement(stopSvg),
      }),
      new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: -23.578416, lng: -46.655633 },
        content: createIconElement(stopSvg),
      }),
    ]
    maintenanceMarkersRef.current = [
      new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: -23.581416, lng: -46.651633 },
        content: createIconElement(maintSvg),
      }),
    ]
  }, [])

  const startDrawing = () => {
    setIsDrawing(true)
    isDrawingRef.current = true
    drawingPathRef.current = []
    if (mapInstance.current) {
      mapInstance.current.setOptions({ draggableCursor: 'crosshair' })
    }
    toast.info('Clique no mapa para desenhar os vértices da zona.')
  }

  const cancelDrawing = () => {
    setIsDrawing(false)
    isDrawingRef.current = false
    if (mapInstance.current) {
      mapInstance.current.setOptions({ draggableCursor: null })
    }
    if (previewPolygonRef.current) {
      previewPolygonRef.current.setMap(null)
      previewPolygonRef.current = null
    }
    drawingPathRef.current = []
  }

  const finishDrawing = () => {
    if (drawingPathRef.current.length < 3) {
      toast.error('Adicione pelo menos 3 pontos para formar uma zona.')
      return
    }
    setIsDrawing(false)
    isDrawingRef.current = false
    if (mapInstance.current) {
      mapInstance.current.setOptions({ draggableCursor: null })
    }
    setPendingZone(previewPolygonRef.current)
    previewPolygonRef.current = null
    drawingPathRef.current = []
    setZoneModal({ open: true, type: 'interest', name: '' })
  }

  const updateBusPosition = useCallback(
    (index: number, isAlert: boolean = false, speed: string = '45 km/h') => {
      const path = routePathRef.current
      if (!path || path.length === 0 || !busMarkerInstance.current) return
      const safeIndex = Math.min(Math.max(0, Math.floor(index)), path.length - 1)

      const color = isAlert ? '#ef4444' : '#2563eb'
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="14" fill="${color}" stroke="white" stroke-width="2" />
          <rect x="25" y="15" width="50" height="20" fill="black" rx="4" />
          <text x="50" y="29" font-family="monospace" font-size="12" fill="white" font-weight="bold" text-anchor="middle">${speed}</text>
          <rect x="35" y="70" width="30" height="16" fill="black" rx="4" />
          <text x="50" y="82" font-family="sans-serif" font-size="10" fill="white" font-weight="bold" text-anchor="middle">BUS</text>
        </svg>
      `

      let el = busMarkerInstance.current.content as HTMLElement
      if (!el) {
        el = document.createElement('div')
        busMarkerInstance.current.content = el
      }
      el.innerHTML = svg
      el.style.transform = 'translate(0, -50%)'

      busMarkerInstance.current.position = path[safeIndex]
    },
    [],
  )

  const drawRoute = useCallback((wp: any[], fitBounds = false) => {
    if (!window.google?.maps?.DirectionsService || wp.length < 2) {
      const path = wp.map((w: any) => new window.google.maps.LatLng(w.lat, w.lng))
      routePathRef.current = path
      setPathLength(path.length)
      if (polylineInstance.current) polylineInstance.current.setPath(path)
      return
    }

    const directionsService = new window.google.maps.DirectionsService()
    const origin = wp[0]
    const destination = wp[wp.length - 1]
    const intermediates = wp.slice(1, -1).map((p: any) => ({
      location: { lat: p.lat, lng: p.lng },
      stopover: true,
    }))

    directionsService.route(
      {
        origin,
        destination,
        waypoints: intermediates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response: any, status: string) => {
        let path: any[] = []

        if (status === 'OK' && response && response.routes[0]) {
          response.routes[0].legs.forEach((leg: any) => {
            leg.steps.forEach((step: any) => {
              step.path.forEach((p: any) => path.push(p))
            })
          })
        } else {
          path = wp.map((w: any) => new window.google.maps.LatLng(w.lat, w.lng))
        }

        routePathRef.current = path
        setPathLength(path.length)

        if (polylineInstance.current) {
          polylineInstance.current.setPath(path)
        }

        if (path.length > 0 && mapInstance.current && fitBounds) {
          const bounds = new window.google.maps.LatLngBounds()
          path.forEach((p: any) => bounds.extend(p))
          mapInstance.current.fitBounds(bounds)
        }
      },
    )
  }, [])

  const loadModeData = useCallback(async () => {
    if (viewMode === 'routes') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      return
    }

    const wp =
      viewMode === 'live'
        ? [
            { lat: -23.561414, lng: -46.655881 },
            { lat: -23.573416, lng: -46.653633 },
            { lat: -23.587416, lng: -46.657633 },
          ]
        : await api.history.getTrajectory(selectedDate, 'v1')

    drawRoute(wp, true)

    if (viewMode === 'live') {
      liveProgressRef.current = 0
      setLiveAlerts([])
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      setPlaybackProgress(0)
      updateBusPosition(0, false, 'Histórico')
    }
  }, [viewMode, selectedDate, drawRoute, updateBusPosition])

  const startLiveSimulation = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    let lastTime = Date.now()

    const animate = () => {
      if (viewMode !== 'live') return
      const path = routePathRef.current
      if (path && path.length > 0) {
        const now = Date.now()
        if (now - lastTime > 100) {
          liveProgressRef.current = (liveProgressRef.current + 0.5) % path.length
          const pos = path[Math.floor(liveProgressRef.current)]

          let inRiskZone = false
          if (window.google?.maps?.geometry?.poly) {
            const latLng =
              typeof pos.lat === 'function' ? pos : new window.google.maps.LatLng(pos.lat, pos.lng)
            inRiskZone = polygonsRef.current.some(
              (p) =>
                p.type === 'risk' &&
                window.google.maps.geometry.poly.containsLocation(latLng, p.polygon),
            )
          }

          const pRatio = liveProgressRef.current / path.length
          const isSpeeding = pRatio > 0.4 && pRatio < 0.45
          const hasAlert = isSpeeding || inRiskZone
          const speed = isSpeeding ? '72 km/h' : '45 km/h'

          if (hasAlert && now - lastAlertRef.current > 10000) {
            const title = isSpeeding ? 'Excesso de Velocidade' : 'Entrada em Zona de Risco'
            setLiveAlerts((la) =>
              [
                { id: now, msg: `${title} (ABC-1234)`, time: new Date().toLocaleTimeString() },
                ...la,
              ].slice(0, 4),
            )
            toast.error(`Alerta Crítico: ${title}!`)
            lastAlertRef.current = now
          }

          updateBusPosition(liveProgressRef.current, hasAlert, speed)
          lastTime = now
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()
  }, [viewMode, updateBusPosition])

  useEffect(() => {
    if (!isLoaded || loadError) return
    let mounted = true

    if (!mapInstance.current) {
      initMap()
    }

    loadModeData().then(() => {
      if (!mounted) return
      if (viewMode === 'live') startLiveSimulation()
    })

    return () => {
      mounted = false
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isLoaded, loadError, initMap, loadModeData, startLiveSimulation, viewMode])

  useEffect(() => {
    if (!mapInstance.current) return
    if (busMarkerInstance.current)
      busMarkerInstance.current.map =
        layers.buses && viewMode !== 'routes' ? mapInstance.current : null
    if (trafficLayerInstance.current)
      trafficLayerInstance.current.setMap(layers.traffic ? mapInstance.current : null)
    stopsMarkersRef.current.forEach((m) => {
      m.map = layers.stops && viewMode !== 'routes' ? mapInstance.current : null
    })
    maintenanceMarkersRef.current.forEach((m) => {
      m.map = layers.maintenance && viewMode !== 'routes' ? mapInstance.current : null
    })
  }, [layers, viewMode])

  useEffect(() => {
    if (!mapInstance.current) return

    editingMarkersRef.current.forEach((m) => {
      if (m) m.map = null
    })
    editingMarkersRef.current = []

    if (viewMode === 'routes' && editingRoute) {
      editingMarkersRef.current = editingRoute.checkpoints.map((cp, idx) => {
        const el = document.createElement('div')
        el.innerHTML = `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${idx + 1}</div>`
        return new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: cp.lat, lng: cp.lng },
          map: mapInstance.current,
          content: el,
        })
      })

      const isNewRoute = prevRouteIdRef.current !== editingRoute.id
      drawRoute(editingRoute.checkpoints, isNewRoute)
      prevRouteIdRef.current = editingRoute.id
    } else if (viewMode === 'routes') {
      if (polylineInstance.current) polylineInstance.current.setPath([])
    }
  }, [viewMode, editingRoute, drawRoute])

  useEffect(() => {
    if (!mapInstance.current) return
    const listener = window.google.maps.event.addListener(
      mapInstance.current,
      'click',
      (e: any) => {
        if (viewMode === 'routes' && editingRoute) {
          const newCp = {
            id: Math.random().toString(),
            name: `Parada ${editingRoute.checkpoints.length + 1}`,
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            radius: 500,
          }
          setEditingRoute((prev) => {
            if (!prev) return prev
            return { ...prev, checkpoints: [...prev.checkpoints, newCp] }
          })
        }
      },
    )
    return () => {
      window.google.maps.event.removeListener(listener)
    }
  }, [viewMode, editingRoute])

  useEffect(() => {
    if (viewMode === 'live' || viewMode === 'routes' || !isPlaying) return
    const interval = setInterval(() => {
      setPlaybackProgress((prev) => {
        const next = prev + 1
        if (next >= 100) {
          setIsPlaying(false)
          return 100
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, viewMode])

  useEffect(() => {
    if (viewMode === 'history' && pathLength > 0)
      updateBusPosition((playbackProgress / 100) * (pathLength - 1), false, 'Histórico')
  }, [playbackProgress, viewMode, pathLength, updateBusPosition])

  const saveZone = () => {
    if (!pendingZone) return
    const isRisk = zoneModal.type === 'risk'
    pendingZone.setOptions({
      fillColor: isRisk ? '#ef4444' : '#10b981',
      strokeColor: isRisk ? '#ef4444' : '#10b981',
      clickable: true,
    })
    const iw = new window.google.maps.InfoWindow({
      content: `<div style="padding: 4px; font-family: sans-serif;"><strong style="font-size: 14px;">${zoneModal.name || 'Nova Zona'}</strong><br/><span style="font-size: 12px; color: #64748b;">Zona de ${isRisk ? 'Risco' : 'Interesse'}</span></div>`,
    })
    window.google.maps.event.addListener(pendingZone, 'click', (e: any) => {
      iw.setPosition(e.latLng)
      iw.open(mapInstance.current)
    })
    polygonsRef.current.push({ polygon: pendingZone, type: zoneModal.type, name: zoneModal.name })
    toast.success(`Zona salva com sucesso!`)
    setZoneModal({ open: false, type: 'interest', name: '' })
    setPendingZone(null)
  }

  const cancelZone = () => {
    if (pendingZone) pendingZone.setMap(null)
    setZoneModal({ open: false, type: 'interest', name: '' })
    setPendingZone(null)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cockpit Operacional</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Monitoramento Avançado com Google Maps Platform
          </p>
        </div>
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> Tempo Real
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <RouteIcon className="w-4 h-4" /> Rotas e Paradas
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" /> Playback
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden border-2 shadow-inner bg-slate-100">
        {(!isLoaded || loadError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-sm z-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl border flex flex-col items-center max-w-sm text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Google Maps Indisponível</h3>
              <p className="text-sm text-slate-600 mb-4">
                {loadError || 'Iniciando serviços de mapa...'}
              </p>
              {!loadError && (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        )}

        <div ref={mapRef} className="absolute inset-0" />

        {isLoaded && !loadError && (
          <>
            {viewMode === 'live' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {!isDrawing ? (
                  <Button
                    variant="secondary"
                    className="bg-white/95 backdrop-blur shadow-sm font-semibold border-slate-200"
                    onClick={startDrawing}
                  >
                    <SquareDashed className="w-4 h-4 mr-2" /> Nova Zona (Geofencing)
                  </Button>
                ) : (
                  <>
                    <Button
                      className="shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={finishDrawing}
                    >
                      <Check className="w-4 h-4 mr-2" /> Finalizar Zona
                    </Button>
                    <Button variant="destructive" className="shadow-sm" onClick={cancelDrawing}>
                      <X className="w-4 h-4 mr-2" /> Cancelar
                    </Button>
                  </>
                )}
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/95 backdrop-blur shadow-sm absolute top-4 right-14 z-10"
                >
                  <Layers className="w-4 h-4 mr-2 text-primary" /> Camadas
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-4 z-50">
                <h3 className="font-semibold mb-3 text-slate-800">Controles do Mapa</h3>
                <div className="space-y-3">
                  {[
                    {
                      key: 'buses',
                      label: 'Veículos Ativos',
                      icon: Activity,
                      color: 'text-blue-500',
                      disabled: viewMode === 'routes',
                    },
                    {
                      key: 'stops',
                      label: 'Pontos Genéricos',
                      icon: MapPin,
                      color: 'text-emerald-500',
                      disabled: viewMode === 'routes',
                    },
                    {
                      key: 'maintenance',
                      label: 'Alertas de Manutenção',
                      icon: Wrench,
                      color: 'text-amber-500',
                      disabled: viewMode === 'routes',
                    },
                    {
                      key: 'traffic',
                      label: 'Trânsito em Tempo Real',
                      icon: TrafficCone,
                      color: 'text-orange-500',
                    },
                  ].map((l) => (
                    <div key={l.key} className="flex items-center justify-between">
                      <Label
                        className={`flex items-center gap-2 text-sm font-medium ${l.disabled ? 'text-slate-400' : 'text-slate-700 cursor-pointer'}`}
                      >
                        <l.icon className={`w-4 h-4 ${l.disabled ? 'text-slate-300' : l.color}`} />{' '}
                        {l.label}
                      </Label>
                      <Switch
                        checked={(layers as any)[l.key]}
                        onCheckedChange={(v) => setLayers((p) => ({ ...p, [l.key]: v }))}
                        disabled={l.disabled}
                      />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {viewMode === 'live' && liveAlerts.length > 0 && (
              <div className="absolute top-4 left-4 w-72 max-h-[60%] flex flex-col gap-2 z-10 pointer-events-none">
                {liveAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="pointer-events-auto p-3 rounded-lg border bg-white/95 backdrop-blur shadow-md text-sm animate-slide-down border-red-200"
                  >
                    <div className="flex items-center gap-2 font-semibold text-red-700 mb-1">
                      <AlertCircle className="w-4 h-4" /> Detecção de Risco
                      <span className="ml-auto text-xs font-normal text-slate-500">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{alert.msg}</p>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'routes' && (
              <div className="absolute top-4 left-4 z-20 w-80 max-h-[85%] flex flex-col animate-slide-right pointer-events-none">
                <Card className="flex flex-col bg-white/95 backdrop-blur shadow-lg border-slate-200 h-full pointer-events-auto">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                      <RouteIcon className="w-4 h-4 text-blue-600" /> Editor de Trajetos
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Selecione a rota e clique no mapa para adicionar pontos de coleta.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Rota Ativa</Label>
                      <Select
                        value={editingRoute?.id || ''}
                        onValueChange={(id) => {
                          const r = dbRoutes.find((x) => x.id === id)
                          if (r) setEditingRoute({ ...r, checkpoints: r.checkpoints || [] })
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione uma rota..." />
                        </SelectTrigger>
                        <SelectContent>
                          {dbRoutes.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {editingRoute && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b pb-2">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Sequência de Paradas ({editingRoute.checkpoints.length})
                          </p>
                        </div>
                        {editingRoute.checkpoints.length === 0 ? (
                          <div className="text-sm text-slate-400 border border-dashed rounded-lg p-6 text-center bg-slate-50/50">
                            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            Clique em qualquer lugar do mapa para adicionar o primeiro ponto de
                            coleta.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {editingRoute.checkpoints.map((cp, idx) => (
                              <div
                                key={cp.id}
                                className="flex items-center gap-2 bg-slate-50 border p-1.5 rounded-md text-xs shadow-sm transition-colors hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
                              >
                                <div className="bg-blue-100 text-blue-700 w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-[11px]">
                                  {idx + 1}
                                </div>
                                <Input
                                  value={cp.name}
                                  onChange={(e) => {
                                    setEditingRoute((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            checkpoints: prev.checkpoints.map((x) =>
                                              x.id === cp.id ? { ...x, name: e.target.value } : x,
                                            ),
                                          }
                                        : null,
                                    )
                                  }}
                                  className="h-7 text-xs px-2 flex-1 border-transparent hover:border-slate-200 focus-visible:border-blue-500 focus-visible:ring-0 shadow-none bg-transparent"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                                  title="Remover parada"
                                  onClick={() =>
                                    setEditingRoute((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            checkpoints: prev.checkpoints.filter(
                                              (x) => x.id !== cp.id,
                                            ),
                                          }
                                        : null,
                                    )
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          className="w-full mt-6 shadow-sm"
                          onClick={async () => {
                            await api.routes.update(editingRoute.id, {
                              checkpoints: editingRoute.checkpoints,
                            })
                            toast.success('Trajeto e pontos de coleta salvos com sucesso!')
                            setDbRoutes(await api.routes.list())
                          }}
                        >
                          <Check className="w-4 h-4 mr-2" /> Salvar Alterações
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {viewMode === 'history' && (
              <div className="absolute bottom-6 left-4 right-14 max-w-3xl mx-auto z-10 animate-slide-up">
                <Card className="p-4 bg-white/95 backdrop-blur shadow-lg border-slate-200 flex items-center gap-4">
                  <div className="flex items-center gap-3 border-r pr-4">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-36 h-9"
                    />
                    <Select defaultValue="v1">
                      <SelectTrigger className="w-36 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">ABC-1234</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 text-primary" />
                    ) : (
                      <Play className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                  <Slider
                    value={[playbackProgress]}
                    onValueChange={(v) => {
                      setPlaybackProgress(v[0])
                      setIsPlaying(false)
                    }}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <div className="text-xs font-medium text-slate-500 w-12 text-right">
                    {playbackProgress}%
                  </div>
                </Card>
              </div>
            )}
          </>
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
            <DialogTitle>Configurar Zona Geográfica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Zona</Label>
              <Input
                value={zoneModal.name}
                onChange={(e) => setZoneModal((z) => ({ ...z, name: e.target.value }))}
                placeholder="Ex: Área Escolar Leste"
              />
            </div>
            <div className="space-y-2">
              <Label>Classificação e Regras</Label>
              <Select
                value={zoneModal.type}
                onValueChange={(v: any) => setZoneModal((z) => ({ ...z, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interest">Zona de Interesse (Segurança / Verde)</SelectItem>
                  <SelectItem value="risk">Zona de Risco (Alerta / Vermelho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelZone}>
              Cancelar
            </Button>
            <Button onClick={saveZone}>Finalizar e Monitorar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
