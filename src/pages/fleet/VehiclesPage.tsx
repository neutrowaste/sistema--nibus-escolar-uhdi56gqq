import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Plus, Wrench, FileText, Settings2, Upload } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    api.vehicles.list().then((data) => {
      setVehicles(data)
      setIsLoading(false)
    })
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Rota':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'Parado':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100'
      case 'Manutenção':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100'
      default:
        return ''
    }
  }

  const formatDate = (isoString: string) =>
    new Intl.DateTimeFormat('pt-BR').format(new Date(isoString))

  const handleUploadDocument = () => {
    toast.success('Documento anexado com sucesso. Sincronizando com a frota...')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Frota de Veículos</h1>
          <p className="text-sm text-muted-foreground">
            Gestão e configuração dos dispositivos da frota.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/fleet/maintenance">
              <Wrench className="mr-2 h-4 w-4" /> Manutenções
            </Link>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Veículo
          </Button>
        </div>
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
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded-md border border-slate-200">
                        <span className="font-mono text-xs font-bold uppercase">{v.plate}</span>
                      </div>
                    </TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell>{v.capacity} alunos</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(v.status)}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedVehicle(v)}>
                              <FileText className="mr-2 h-4 w-4" /> Docs
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="sm:max-w-md overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Documentação do Veículo</SheetTitle>
                              <SheetDescription>
                                Placa: {selectedVehicle?.plate} | {selectedVehicle?.model}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                              {selectedVehicle?.documents?.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                  Nenhum documento anexado.
                                </p>
                              )}
                              {selectedVehicle?.documents?.map((doc) => {
                                const isExpired = new Date(doc.expiryDate) < new Date()
                                const isExpiring =
                                  !isExpired &&
                                  new Date(doc.expiryDate) < new Date(Date.now() + 30 * 86400000)
                                return (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">{doc.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Vence em: {formatDate(doc.expiryDate)}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        isExpired
                                          ? 'destructive'
                                          : isExpiring
                                            ? 'secondary'
                                            : 'default'
                                      }
                                      className={cn(isExpiring && 'bg-amber-100 text-amber-800')}
                                    >
                                      {isExpired
                                        ? 'Vencido'
                                        : isExpiring
                                          ? 'Vence em breve'
                                          : 'Regular'}
                                    </Badge>
                                  </div>
                                )
                              })}

                              <div className="pt-6 border-t mt-6">
                                <h4 className="text-sm font-semibold mb-4">
                                  Anexar Novo Documento
                                </h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Nome do Documento</Label>
                                    <Input placeholder="Ex: CRLV 2024" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Data de Vencimento</Label>
                                    <Input type="date" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Arquivo</Label>
                                    <Input type="file" className="cursor-pointer" />
                                  </div>
                                  <Button className="w-full" onClick={handleUploadDocument}>
                                    <Upload className="mr-2 h-4 w-4" /> Fazer Upload
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                        <Button variant="ghost" size="sm">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
