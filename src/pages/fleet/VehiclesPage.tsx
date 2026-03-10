import React, { useEffect, useState } from 'react'
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
import { Bus, Plus, Wrench } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Frota de Veículos</h1>
          <p className="text-sm text-muted-foreground">
            Gestão e configuração dos dispositivos da frota.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Wrench className="mr-2 h-4 w-4" /> Manutenções
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
                      <Button variant="ghost" size="sm">
                        Configurar
                      </Button>
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
