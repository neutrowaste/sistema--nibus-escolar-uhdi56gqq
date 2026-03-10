import React, { useEffect, useState } from 'react'
import { api, SystemDocument, Vehicle, Driver } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, FileText, UploadCloud, FileSpreadsheet } from 'lucide-react'
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
import { format } from 'date-fns'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<SystemDocument[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<SystemDocument>>({ entityType: 'vehicle' })

  const loadData = () => {
    setIsLoading(true)
    Promise.all([api.documents.list(), api.vehicles.list(), api.drivers.list()]).then(
      ([d, v, dr]) => {
        setDocs(d)
        setVehicles(v)
        setDrivers(dr)
        setIsLoading(false)
      },
    )
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.title || !formData.type || !formData.entityId || !formData.expiryDate) {
      return toast.error('Preencha os campos obrigatórios.')
    }
    try {
      await api.documents.add(formData)
      toast.success('Documento salvo e digitalizado com sucesso!')
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar documento.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este documento do repositório?')) return
    await api.documents.delete(id)
    toast.success('Documento removido.')
    loadData()
  }

  const getEntityName = (doc: SystemDocument) => {
    if (doc.entityType === 'vehicle')
      return vehicles.find((v) => v.id === doc.entityId)?.plate || 'Veículo Desconhecido'
    return drivers.find((d) => d.id === doc.entityId)?.name || 'Motorista Desconhecido'
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Documentos</h1>
          <p className="text-sm text-muted-foreground">
            Repositório centralizado para digitalização e monitoramento de validades.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ entityType: 'vehicle' })
            setIsModalOpen(true)
          }}
        >
          <UploadCloud className="mr-2 h-4 w-4" /> Novo Documento
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : docs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center border-dashed border-2 rounded-lg bg-slate-50 m-4">
              <FileSpreadsheet className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Nenhum documento</h3>
              <p className="text-sm text-slate-500 mb-4">
                Faça o upload do primeiro documento da frota ou equipe.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título / Tipo</TableHead>
                  <TableHead>Vinculado a</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-sm">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{d.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{getEntityName(d)}</span>
                      <p className="text-xs text-muted-foreground capitalize">
                        {d.entityType === 'vehicle' ? 'Veículo' : 'Motorista'}
                      </p>
                    </TableCell>
                    <TableCell>{format(new Date(d.issueDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className={d.status === 'Expired' ? 'text-red-600 font-bold' : ''}>
                      {format(new Date(d.expiryDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          d.status === 'Valid'
                            ? 'bg-green-50 text-green-700'
                            : d.status === 'Expired'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700'
                        }
                      >
                        {d.status === 'Valid'
                          ? 'Regular'
                          : d.status === 'Expiring'
                            ? 'Vence em Breve'
                            : 'Vencido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
            <DialogTitle>Upload de Documento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entidade</Label>
                <Select
                  value={formData.entityType}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, entityType: v, entityId: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle">Veículo</SelectItem>
                    <SelectItem value="driver">Motorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registro Vinculado</Label>
                <Select
                  value={formData.entityId}
                  onValueChange={(v) => setFormData({ ...formData, entityId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.entityType === 'vehicle'
                      ? vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.plate}
                          </SelectItem>
                        ))
                      : drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título / Referência</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: CNH Categoria D"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Input
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Seguro, CRLV, CNH"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={formData.issueDate || ''}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Label>Arquivo Escaneado (PDF/JPG)</Label>
              <Input type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar e Monitorar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
