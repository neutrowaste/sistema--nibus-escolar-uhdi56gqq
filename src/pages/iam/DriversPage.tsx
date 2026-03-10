import { useEffect, useState } from 'react'
import { api, Driver, Vehicle } from '@/lib/api'
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
import { Plus, Pencil, Trash2, IdCard } from 'lucide-react'
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

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Driver>>({})

  const loadData = () => {
    setIsLoading(true)
    Promise.all([api.drivers.list(), api.vehicles.list()]).then(([d, v]) => {
      setDrivers(d)
      setVehicles(v)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.name || !formData.cnh) return toast.error('Nome e CNH são obrigatórios.')
    try {
      if (formData.id) await api.drivers.update(formData.id, formData)
      else await api.drivers.add(formData)
      toast.success('Motorista salvo com sucesso!')
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar motorista.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este motorista?')) return
    await api.drivers.delete(id)
    toast.success('Motorista removido.')
    loadData()
  }

  const openModal = (driver?: Driver) => {
    setFormData(driver || { status: 'Ativo' })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Motoristas</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre condutores e vincule-os aos veículos da frota.
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Motorista
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center border-dashed border-2 rounded-lg bg-slate-50 m-4">
              <IdCard className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Nenhum motorista registrado</h3>
              <p className="text-sm text-slate-500 mb-4">
                Cadastre o primeiro condutor da sua operação.
              </p>
              <Button onClick={() => openModal()} variant="outline">
                Adicionar Motorista
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Veículo Vinculado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.cnh}</TableCell>
                    <TableCell>{d.phone}</TableCell>
                    <TableCell>
                      {d.vehicleId ? (
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs border font-mono">
                          {vehicles.find((v) => v.id === d.vehicleId)?.plate || 'N/A'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Não vinculado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={d.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : ''}
                      >
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(d)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(d.id)}
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
            <DialogTitle>{formData.id ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Carlos Silva"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CNH</Label>
                <Input
                  value={formData.cnh || ''}
                  onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="11 99999-9999"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veículo Principal</Label>
                <Select
                  value={formData.vehicleId || 'none'}
                  onValueChange={(val) =>
                    setFormData({ ...formData, vehicleId: val === 'none' ? undefined : val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum veículo</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate} ({v.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Férias">Férias</SelectItem>
                    <SelectItem value="Afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar Motorista</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
