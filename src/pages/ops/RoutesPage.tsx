import { useEffect, useState } from 'react'
import { api, Route } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Pencil, Trash2, Route as RouteIcon, Plus, Sparkles, Check, X } from 'lucide-react'
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
import { toast } from 'sonner'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Route>>({})

  // AI Optimization state
  const [optimizingRoute, setOptimizingRoute] = useState<Route | null>(null)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<any>(null)

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
    setFormData(route || { status: 'Agendada', stops: 0, whatsappAlerts: false, alertRadius: 500 })
    setIsModalOpen(true)
  }

  const openOptimize = (route: Route) => {
    setOptimizingRoute(route)
    setAiSuggestion(null)
    setAiAnalyzing(true)
    // Simulate AI delay
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
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Criar Rota
        </Button>
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
                    <MapPin className="h-4 w-4 text-green-500" /> {r.startPoint || 'Não definido'}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <MapPin className="h-4 w-4 text-red-500" /> {r.endPoint || 'Não definido'}
                  </div>
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

      {/* Standard Form Modal omitted body to save space but kept essential structure */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Rota' : 'Nova Rota'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ponto Inicial</Label>
                <Input
                  value={formData.startPoint || ''}
                  onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ponto Final</Label>
                <Input
                  value={formData.endPoint || ''}
                  onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                />
              </div>
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
            <div className="mt-4 pt-4 border-t space-y-4">
              <h4 className="text-sm font-semibold">Geofencing</h4>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded border">
                <Label>Alertas WhatsApp (Aproximação)</Label>
                <Switch
                  checked={!!formData.whatsappAlerts}
                  onCheckedChange={(v) => setFormData({ ...formData, whatsappAlerts: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
