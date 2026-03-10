import { useEffect, useState } from 'react'
import { api, Route } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Pencil, Trash2, Route as RouteIcon, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Route>>({})

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
    setFormData(route || { status: 'Agendada', stops: 0 })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Rotas</h1>
          <p className="text-sm text-muted-foreground">
            Criação e mapeamento de percursos escolares.
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
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Defina pontos de partida e paradas para criar rotas.
          </p>
          <Button onClick={() => openModal()} variant="outline">
            Adicionar Rota
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((r) => (
            <Card key={r.id} className="hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{r.name}</CardTitle>
                  <p className="text-sm font-mono bg-slate-100 px-1.5 py-0.5 rounded border inline-block mt-2">
                    {r.vehiclePlate}
                  </p>
                </div>
                <div className="flex gap-1 -mr-2 -mt-2">
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
                  <div className="text-sm text-slate-500 ml-6 border-l-2 border-slate-200 pl-4 py-1">
                    {r.stops} paradas intermediárias
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <Badge
                    variant={r.status === 'Em Andamento' ? 'default' : 'secondary'}
                    className={r.status === 'Em Andamento' ? 'bg-blue-500 hover:bg-blue-600' : ''}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Rota' : 'Nova Rota'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Rota</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Rota Leste - Tarde"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ponto Inicial</Label>
                <Input
                  value={formData.startPoint || ''}
                  onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                  placeholder="Origem"
                />
              </div>
              <div className="space-y-2">
                <Label>Ponto Final</Label>
                <Input
                  value={formData.endPoint || ''}
                  onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                  placeholder="Destino"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total de Paradas</Label>
                <Input
                  type="number"
                  value={formData.stops || ''}
                  onChange={(e) => setFormData({ ...formData, stops: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Veículo Alocado (Placa)</Label>
                <Input
                  value={formData.vehiclePlate || ''}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                  placeholder="ABC-1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Motorista</Label>
                <Input
                  value={formData.driver || ''}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  placeholder="Nome do Condutor"
                />
              </div>
              <div className="space-y-2">
                <Label>Status Inicial</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agendada">Agendada</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar Rota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
