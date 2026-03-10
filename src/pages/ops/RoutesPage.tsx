import React, { useEffect, useState } from 'react'
import { api, Route } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Calendar as CalendarIcon, MoreVertical } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.routes.list().then((data) => {
      setRoutes(data)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rotas Planejadas</h1>
          <p className="text-sm text-muted-foreground">Planejamento e alocação de rotas diárias.</p>
        </div>
        <Button>Criar Rota</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((r) => (
            <Card key={r.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{r.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Veículo: {r.vehiclePlate}</p>
                </div>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                    {r.stops} pontos
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="h-4 w-4 mr-1 text-slate-400" />
                    ~45 min
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <Badge
                    variant={r.status === 'Em Andamento' ? 'default' : 'secondary'}
                    className={r.status === 'Em Andamento' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                  >
                    {r.status}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">{r.driver}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
