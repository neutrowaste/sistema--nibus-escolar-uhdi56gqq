import React, { useEffect, useState } from 'react'
import { api, MaintenanceTask, Vehicle } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Wrench, Edit, Trash2, Calendar, Gauge } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    Promise.all([api.maintenance.list(), api.vehicles.list()]).then(([m, v]) => {
      setTasks(m)
      setVehicles(v)
      setIsLoading(false)
    })
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Tarefa de manutenção registrada com sucesso.')
    setIsDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-emerald-100 text-emerald-800'
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-amber-100 text-amber-800'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Módulo de Manutenção</h1>
          <p className="text-sm text-muted-foreground">
            Gestão preventiva e corretiva da frota. Controle baseado em Km ou Tempo.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Manutenção</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate} ({v.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Input required placeholder="Ex: Troca de Óleo, Revisão de Freios" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Limite</Label>
                  <Input type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Km Limite (Alerta)</Label>
                  <Input type="number" placeholder="Ex: 50000" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full">
                  Salvar e Agendar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Limites e Alertas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => {
                  const vehicle = vehicles.find((v) => v.id === t.vehicleId)
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-slate-400" />
                          {vehicle?.plate || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{t.type}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{' '}
                            {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                          {t.thresholdMileage && (
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3 w-3" /> {t.thresholdMileage.toLocaleString()} km
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(t.status)}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
