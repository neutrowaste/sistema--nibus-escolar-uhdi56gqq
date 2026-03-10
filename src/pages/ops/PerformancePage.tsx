import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api } from '@/lib/api'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Clock } from 'lucide-react'

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.performance.getMetrics().then((data) => {
      setMetrics(data)
      setIsLoading(false)
    })
  }, [])

  const occupancyConfig = {
    rate: { label: 'Taxa de Ocupação (%)', color: 'hsl(var(--primary))' },
  }

  const punctualityConfig = {
    onTime: { label: 'No Horário', color: 'hsl(var(--primary))' },
    delayed: { label: 'Atrasado', color: 'hsl(var(--destructive))' },
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Desempenho da Frota</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Desempenho e Eficiência</h1>
        <p className="text-sm text-muted-foreground">
          Dashboards analíticos de métricas operacionais.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Ocupação Média por Rota
            </CardTitle>
            <CardDescription>
              Percentual de assentos utilizados em relação à capacidade do veículo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={occupancyConfig} className="h-[300px] w-full">
              <BarChart
                data={metrics.occupancy}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="route"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" fill="var(--color-rate)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" /> Pontualidade Semanal
            </CardTitle>
            <CardDescription>Tendência de viagens no horário vs. atrasadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={punctualityConfig} className="h-[300px] w-full">
              <LineChart
                data={metrics.punctuality}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="onTime"
                  stroke="var(--color-onTime)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="delayed"
                  stroke="var(--color-delayed)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
