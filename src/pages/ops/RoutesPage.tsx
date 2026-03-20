import { useEffect, useState, useRef } from 'react'
import { api, Route } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Pencil,
  Trash2,
  Route as RouteIcon,
  Plus,
  Sparkles,
  Check,
  X,
  Clock,
  Ruler,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useGoogleMaps } from '@/contexts/GoogleMapsContext'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Route>>({})
  const [routeStats, setRouteStats] = useState<{ distance?: string; duration?: string }>({})
  const navigate = useNavigate()

  const { isLoaded, loadError } = useGoogleMaps()

  // AI Optimization state
  const [optimizingRoute, setOptimizingRoute] = useState<Route | null>(null)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<any>(null)

  // Map state
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const directionsService = useRef<any>(null)
  const directionsRenderer = useRef<any>(null)
  const polylineInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const initialBoundsFit = useRef(false)
  const [mapReady, setMapReady] = useState(false)

  const loadData = () => {
    setIsLoading(true)
    api.routes.list().then((data) => {
      setRoutes(data)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!isModalOpen) {
      initialBoundsFit.current = false
      mapInstance.current = null
      directionsService.current = null
      directionsRenderer.current = null
      polylineInstance.current = null
      markersRef.current = []
      setMapReady(false)
      return
    }

    if (!isLoaded) return

    let intervalId: any

    const initMap = () => {
      if (mapInstance.current || !window.google?.maps) return true // already initialized

      if (!mapRef.current) return false

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: -23.561414, lng: -46.655881 },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: 'ROUTES_MAP_ID',
      })

      directionsService.current = new window.google.maps.DirectionsService()
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true,
      })

      polylineInstance.current = new window.google.maps.Polyline({
        map: mapInstance.current,
        path: [],
        strokeColor: '#94a3b8',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        strokeDasharray: '4 4',
      })

      window.google.maps.event.addListener(mapInstance.current, 'click', (e: any) => {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        setFormData((prev) => {
          const cps = prev.checkpoints || []
          const newCp = {
            id: Math.random().toString(),
            name: `Parada ${cps.length + 1}`,
            lat,
            lng,
            radius: 500,
          }
          return { ...prev, checkpoints: [...cps, newCp] }
        })
      })

      setMapReady(true)
      return true
    }

    if (!initMap()) {
      intervalId = setInterval(() => {
        if (initMap()) {
          clearInterval(intervalId)
        }
      }, 100)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isModalOpen, isLoaded])

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !formData.checkpoints || !window.google?.maps) return

    let active = true

    const path = formData.checkpoints.map((cp) => ({ lat: cp.lat, lng: cp.lng }))

    // Update Markers
    markersRef.current.forEach((m) => {
      if (m) m.map = null
    })

    const prefColor = formData.routingPreference === 'shortest' ? '#10b981' : '#3b82f6'

    markersRef.current = formData.checkpoints.map((cp, idx) => {
      const el = document.createElement('div')
      el.innerHTML = `<div style="background-color: ${prefColor}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${idx + 1}</div>`

      return new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: cp.lat, lng: cp.lng },
        map: mapInstance.current,
        content: el,
      })
    })

    if (path.length > 0 && !initialBoundsFit.current) {
      const bounds = new window.google.maps.LatLngBounds()
      path.forEach((p) => bounds.extend(p))
      mapInstance.current.fitBounds(bounds)
      initialBoundsFit.current = true
    }

    if (path.length >= 2) {
      const fetchDirections = async () => {
        const pref = formData.routingPreference || 'fastest'
        let totalDist = 0
        let totalDur = 0
        let fullPath: any[] = []
        let success = true

        // Requisita rotas pareadas entre cada parada para garantir
        // que o Google Maps retorne alternativas (provideRouteAlternatives falha com waypoints iterativos diretos)
        for (let i = 0; i < path.length - 1; i++) {
          if (!active) return
          const origin = path[i]
          const destination = path[i + 1]

          try {
            const response: any = await new Promise((resolve, reject) => {
              directionsService.current.route(
                {
                  origin,
                  destination,
                  travelMode: window.google.maps.TravelMode.DRIVING,
                  provideRouteAlternatives: true,
                },
                (res: any, status: string) => {
                  if (status === 'OK') resolve(res)
                  else reject(status)
                },
              )
            })

            if (!active) return

            if (response && response.routes && response.routes.length > 0) {
              const routesWithTotals = response.routes.map((route: any, index: number) => {
                let dist = 0
                let dur = 0
                route.legs.forEach((l: any) => {
                  dist += l.distance?.value || 0
                  dur += l.duration?.value || 0
                })
                return { index, dist, dur, route }
              })

              if (pref === 'shortest') {
                routesWithTotals.sort((a: any, b: any) => a.dist - b.dist)
              } else {
                routesWithTotals.sort((a: any, b: any) => a.dur - b.dur)
              }

              const bestRoute = routesWithTotals[0].route
              totalDist += routesWithTotals[0].dist
              totalDur += routesWithTotals[0].dur

              bestRoute.overview_path.forEach((p: any) => {
                fullPath.push(p)
              })
            } else {
              success = false
              break
            }
          } catch (e) {
            success = false
            break
          }

          // Delay de proteção contra OVER_QUERY_LIMIT
          await new Promise((r) => setTimeout(r, 150))
        }

        if (!active) return

        if (success && fullPath.length > 0) {
          directionsRenderer.current?.setDirections({ routes: [] })
          polylineInstance.current?.setOptions({
            path: fullPath,
            strokeColor: pref === 'shortest' ? '#10b981' : '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 5,
            strokeDasharray: null,
          })

          setRouteStats({
            distance: (totalDist / 1000).toFixed(1) + ' km',
            duration: Math.round(totalDur / 60) + ' min',
          })
        } else {
          directionsRenderer.current?.setDirections({ routes: [] })
          polylineInstance.current?.setOptions({
            path,
            strokeColor: '#94a3b8',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            strokeDasharray: '4 4',
          })
          setRouteStats({})
        }
      }

      fetchDirections()
    } else {
      directionsRenderer.current?.setDirections({ routes: [] })
      polylineInstance.current?.setOptions({
        path,
        strokeColor: '#94a3b8',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        strokeDasharray: '4 4',
      })
      setRouteStats({})
    }

    return () => {
      active = false
    }
  }, [formData.checkpoints, mapReady, formData.routingPreference])

  const handleSave = async () => {
    if (!formData.name || !formData.vehiclePlate)
      return toast.error('Nome e Veículo são obrigatórios.')
    try {
      if (formData.id) await api.routes.update(formData.id, formData)
      else await api.routes.add(formData)
      toast.success('Rota salva com sucesso!')
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar rota.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta rota permanentemente?')) return
    await api.routes.delete(id)
    toast.success('Rota removida.')
    loadData()
  }

  const openModal = (route?: Route) => {
    setRouteStats({})
    setFormData(
      route
        ? JSON.parse(JSON.stringify(route))
        : {
            status: 'Agendada',
            stops: 0,
            whatsappAlerts: false,
            alertRadius: 500,
            checkpoints: [],
            routingPreference: 'fastest',
          },
    )
    setIsModalOpen(true)
  }

  const addCp = () => {
    setFormData((prev) => ({
      ...prev,
      checkpoints: [
        ...(prev.checkpoints || []),
        {
          id: Math.random().toString(),
          name: `Ponto ${(prev.checkpoints?.length || 0) + 1}`,
          lat: -23.561414,
          lng: -46.655881,
          radius: 500,
        },
      ],
    }))
  }

  const updateCp = (idx: number, field: string, value: any) => {
    setFormData((prev) => {
      const cps = [...(prev.checkpoints || [])]
      cps[idx] = { ...cps[idx], [field]: value }
      return { ...prev, checkpoints: cps }
    })
  }

  const removeCp = (idx: number) => {
    setFormData((prev) => {
      const cps = [...(prev.checkpoints || [])]
      cps.splice(idx, 1)
      return { ...prev, checkpoints: cps }
    })
  }

  const openOptimize = (route: Route) => {
    setOptimizingRoute(route)
    setAiSuggestion(null)
    setAiAnalyzing(true)
    setTimeout(() => {
      setAiAnalyzing(false)
      setAiSuggestion({
        message:
          'A IA identificou congestionamento recorrente na Avenida Central. Sugestão: desvio pela Marginal Oeste.',
        timeSaved: '12 min',
        distanceChange: '-2.5 km',
      })
    }, 2500)
  }

  const acceptAiSuggestion = async () => {
    if (!optimizingRoute) return
    await api.routes.update(optimizingRoute.id, {
      optimized: true,
      name: optimizingRoute.name + ' (IA Otimizada)',
    })
    toast.success('Rota atualizada com sugestão da Inteligência Artificial.')
    setOptimizingRoute(null)
    loadData()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Rotas</h1>
          <p className="text-sm text-muted-foreground">
            Mapeamento de percursos escolares e otimização por IA.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/ops/cockpit')}>
            <MapPin className="mr-2 h-4 w-4" /> Mapa de Rotas
          </Button>
          <Button onClick={() => openModal()}>
            <Plus className="mr-2 h-4 w-4" /> Criar Rota
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-slate-50">
          <RouteIcon className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Nenhuma rota configurada</h3>
          <Button onClick={() => openModal()} variant="outline" className="mt-4">
            Adicionar Rota
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((r) => (
            <Card
              key={r.id}
              className={`flex flex-col ${r.optimized ? 'border-purple-200 bg-purple-50/30' : 'hover:border-primary/50'}`}
            >
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {r.name}
                    {r.optimized && (
                      <Sparkles className="w-4 h-4 text-purple-500" title="Rota otimizada por IA" />
                    )}
                  </CardTitle>
                  <p className="text-sm font-mono bg-slate-100 px-1.5 py-0.5 rounded border inline-block mt-2">
                    {r.vehiclePlate}
                  </p>
                </div>
                <div className="flex gap-1 -mr-2 -mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openOptimize(r)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    title="Otimizar com IA"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openModal(r)}>
                    <Pencil className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mt-2">
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" /> {r.checkpoints?.length || 0}{' '}
                    paradas (pontos de coleta)
                  </div>
                  {r.routingPreference && (
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      {r.routingPreference === 'fastest' ? (
                        <>
                          <Clock className="w-3 h-3 text-blue-500" /> Caminho mais rápido
                        </>
                      ) : (
                        <>
                          <Ruler className="w-3 h-3 text-emerald-500" /> Menor caminho
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <Badge
                    variant={r.status === 'Em Andamento' ? 'default' : 'secondary'}
                    className={r.status === 'Em Andamento' ? 'bg-blue-500' : ''}
                  >
                    {r.status}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">
                    Motorista: {r.driver || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Optimization Modal */}
      <Dialog open={!!optimizingRoute} onOpenChange={(open) => !open && setOptimizingRoute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> Otimização por IA
            </DialogTitle>
            <DialogDescription>
              Análise de dados históricos e trânsito em tempo real.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center min-h-[160px]">
            {aiAnalyzing ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm text-slate-600 text-center px-6">
                  Processando distribuição de alunos e histórico de congestionamentos para sugerir o
                  trajeto mais eficiente...
                </p>
              </div>
            ) : aiSuggestion ? (
              <div className="space-y-4 w-full animate-fade-in">
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Sugestão de Rota Encontrada
                  </h4>
                  <p className="text-sm text-purple-800">{aiSuggestion.message}</p>
                  <div className="flex gap-4 mt-4 text-sm font-medium text-purple-700">
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" /> Economia: {aiSuggestion.timeSaved}
                    </span>
                    <span className="flex items-center gap-1">
                      <RouteIcon className="w-4 h-4" /> Distância: {aiSuggestion.distanceChange}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            {!aiAnalyzing && aiSuggestion && (
              <>
                <Button variant="outline" onClick={() => setOptimizingRoute(null)}>
                  Descartar
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={acceptAiSuggestion}>
                  Aceitar Sugestão
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 pb-2 border-b">
            <DialogHeader>
              <DialogTitle>{formData.id ? 'Editar Rota' : 'Nova Rota'}</DialogTitle>
              <DialogDescription>
                Preencha os dados da rota e clique no mapa para adicionar os pontos de coleta
                (paradas).
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Form Column */}
            <div className="w-[40%] flex flex-col p-6 overflow-y-auto border-r bg-slate-50/50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Rota</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Placa Veículo</Label>
                    <Input
                      value={formData.vehiclePlate || ''}
                      onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Motorista</Label>
                    <Input
                      value={formData.driver || ''}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="text-sm font-semibold text-slate-800">Otimização de Trajeto</h4>
                  <div className="flex flex-col gap-3">
                    <ToggleGroup
                      type="single"
                      value={formData.routingPreference || 'fastest'}
                      onValueChange={(v) => {
                        if (v)
                          setFormData({
                            ...formData,
                            routingPreference: v as 'fastest' | 'shortest',
                          })
                      }}
                      className="justify-start bg-slate-100 p-1 rounded-md border inline-flex self-start"
                    >
                      <ToggleGroupItem
                        value="fastest"
                        aria-label="Mais Rápido"
                        className="data-[state=on]:bg-white data-[state=on]:shadow-sm px-3 text-xs"
                      >
                        <Clock className="h-3.5 w-3.5 mr-2 text-blue-500" /> Mais Rápido
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="shortest"
                        aria-label="Menor Caminho"
                        className="data-[state=on]:bg-white data-[state=on]:shadow-sm px-3 text-xs"
                      >
                        <Ruler className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Menor Caminho
                      </ToggleGroupItem>
                    </ToggleGroup>

                    {routeStats.distance && (
                      <div className="text-xs text-slate-600 bg-white border border-slate-200 p-3 rounded-md shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Ruler className="w-4 h-4 text-slate-400" />
                          <span>
                            Distância:{' '}
                            <strong className="text-slate-900">{routeStats.distance}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>
                            Tempo: <strong className="text-slate-900">{routeStats.duration}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Pontos de Coleta</h4>
                      <span className="text-[10px] text-muted-foreground uppercase bg-slate-100 px-2 py-0.5 rounded-full font-bold tracking-wider">
                        {formData.checkpoints?.length || 0} Paradas
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(formData.checkpoints || []).map((cp, idx) => (
                      <div
                        key={cp.id || idx}
                        className="flex gap-2 items-center bg-white p-2 rounded border transition-colors focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 shadow-sm"
                      >
                        <div
                          className={`text-white w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-[11px]`}
                          style={{
                            backgroundColor:
                              formData.routingPreference === 'shortest' ? '#10b981' : '#3b82f6',
                          }}
                        >
                          {idx + 1}
                        </div>
                        <Input
                          value={cp.name}
                          onChange={(e) => updateCp(idx, 'name', e.target.value)}
                          placeholder="Nome da Parada"
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCp(idx)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCp}
                      className="w-full text-xs border-dashed text-slate-500 hover:text-slate-900 mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Adicionar Ponto Manualmente
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="text-sm font-semibold">Geofencing</h4>
                  <div className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                    <Label className="cursor-pointer text-sm text-slate-600 font-normal">
                      Alertas WhatsApp (Aproximação)
                    </Label>
                    <Switch
                      checked={!!formData.whatsappAlerts}
                      onCheckedChange={(v) => setFormData({ ...formData, whatsappAlerts: v })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Map Column */}
            <div className="w-[60%] relative bg-slate-100">
              {(!isLoaded || loadError) && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-500 bg-slate-100/90 z-10 backdrop-blur-sm">
                  {loadError || 'Iniciando Google Maps...'}
                </div>
              )}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-md text-sm font-medium text-slate-700 pointer-events-none flex items-center gap-2 border">
                <MapPin className="w-4 h-4 text-blue-500" />
                Clique no mapa para adicionar pontos
              </div>
              <div ref={mapRef} className="absolute inset-0" />
            </div>
          </div>

          <div className="p-4 border-t bg-slate-50 flex justify-end">
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="mr-2">
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar Rota e Pontos</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
