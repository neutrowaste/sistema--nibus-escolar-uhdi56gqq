import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bus, Users, Map, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { api, Vehicle, Route } from '@/lib/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionGate } from '@/components/PermissionGate'
import { useAuth } from '@/contexts/AuthContext'

export default function Index() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.vehicles.list(), api.routes.list()]).then(([v, r]) => {
      setVehicles(v)
      setRoutes(r)
      setIsLoading(false)
    })
  }, [])

  const chartData = [
    { name: 'Seg', passageiros: 400 },
    { name: 'Ter', passageiros: 430 },
    { name: 'Qua', passageiros: 410 },
    { name: 'Qui', passageiros: 450 },
    { name: 'Sex', passageiros: 390 },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Executivo</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  const fleetHealth =
    vehicles.length > 0
      ? Math.round(
          (vehicles.filter((v) => v.status !== 'Manutenção').length / vehicles.length) * 100,
        )
      : 0
  const presenceRate = 94.2

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Executivo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consolidado da Org: {user?.orgId} | Filial: {user?.branchId}
          </p>
        </div>
      </div>

      <PermissionGate permission="page:dashboard:executive">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saúde da Frota</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fleetHealth}%</div>
              <p className="text-xs text-muted-foreground mt-1">Veículos operacionais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presença de Alunos</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presenceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Média semanal confirmada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos (Ativos)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.284</div>
              <p className="text-xs text-muted-foreground mt-1">+4% em relação ao mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">Desvios ou manutenções atrasadas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Volume de Passageiros Confirmados (Semana)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="passageiros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Rotas em Andamento (Cockpit Resumo)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes
                  .filter((r) => r.status === 'Em Andamento')
                  .map((route) => (
                    <div
                      key={route.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{route.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Veículo: {route.vehiclePlate}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                          Ao vivo
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Motorista: {route.driver}
                        </p>
                      </div>
                    </div>
                  ))}
                {routes.filter((r) => r.status === 'Em Andamento').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma rota em andamento no momento.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGate>
    </div>
  )
}
