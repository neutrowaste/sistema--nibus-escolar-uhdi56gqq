import { useEffect, useState } from 'react'
import { api, Vehicle } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Bus } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Vehicle>>({})

  const loadData = () => {
    setIsLoading(true)
    api.vehicles.list().then((data) => {
      setVehicles(data)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.plate || !formData.model) return toast.error('Preencha os campos obrigatórios.')
    try {
      if (formData.id) await api.vehicles.update(formData.id, formData)
      else await api.vehicles.add(formData)
      toast.success('Veículo salvo com sucesso!')
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar veículo.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este veículo?')) return
    await api.vehicles.delete(id)
    toast.success('Veículo removido.')
    loadData()
  }

  const openModal = (vehicle?: Vehicle) => {
    setFormData(vehicle || { status: 'Parado', capacity: 20 })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Frota de Veículos</h1>
          <p className="text-sm text-muted-foreground">Gestão e registro dos ônibus escolares.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center border-dashed border-2 rounded-lg bg-slate-50 m-4">
              <Bus className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Nenhum veículo registrado</h3>
              <p className="text-sm text-slate-500 mb-4">Cadastre o primeiro veículo da frota.</p>
              <Button onClick={() => openModal()} variant="outline">
                Adicionar Veículo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs border">
                        {v.plate}
                      </span>
                    </TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell>{v.capacity} alunos</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          v.status === 'Em Rota'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'Manutenção'
                              ? 'bg-amber-100 text-amber-800'
                              : ''
                        }
                      >
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(v.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placa</Label>
                <Input
                  value={formData.plate || ''}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  placeholder="ABC-1234"
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: VW Volksbus"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacidade</Label>
                <Input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parado">Parado</SelectItem>
                    <SelectItem value="Em Rota">Em Rota</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar Veículo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
