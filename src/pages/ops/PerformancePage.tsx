import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Clock, Banknote } from 'lucide-react'

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fuel Cost settings
  const [fuelPrice, setFuelPrice] = useState(5.89)
  const [avgConsumption, setAvgConsumption] = useState(4.5)

  useEffect(() => {
    api.performance.getMetrics().then((data) => {
      setMetrics(data)
      setIsLoading(false)
    })
  }, [])

  const occupancyConfig = { rate: { label: 'Ocupação (%)', color: 'hsl(var(--primary))' } }
  const punctualityConfig = {
    onTime: { label: 'No Horário', color: 'hsl(var(--primary))' },
    delayed: { label: 'Atrasado', color: 'hsl(var(--destructive))' },
  }
  const fuelConfig = {
    cost: { label: 'Custo Estimado (R$)', color: 'hsl(var(--warning, 38 92% 50%))' },
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

  const fuelChartData = metrics.fuelData?.map((d: any) => ({
    route: d.route,
    cost: Number(((d.distance / avgConsumption) * fuelPrice).toFixed(2)),
  }))

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Desempenho e Eficiência</h1>
        <p className="text-sm text-muted-foreground">
          Analíticos operacionais e rastreio de custos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Ocupação Média
            </CardTitle>
            <CardDescription>Percentual de assentos utilizados.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={occupancyConfig} className="h-[250px] w-full">
              <BarChart
                data={metrics.occupancy}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="route" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" fill="var(--color-rate)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" /> Pontualidade
            </CardTitle>
            <CardDescription>Tendência de viagens no horário vs. atrasadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={punctualityConfig} className="h-[250px] w-full">
              <LineChart
                data={metrics.punctuality}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
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

        <Card className="col-span-1 md:col-span-2 border-amber-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Banknote className="h-5 w-5 text-amber-500" /> Custo Operacional e Combustível
            </CardTitle>
            <CardDescription>
              Cálculo em tempo real baseado na quilometragem percorrida pelas rotas e nos valores
              configurados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-8 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <div className="space-y-2">
                <Label>Preço do Combustível (R$/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Consumo Médio do Veículo (km/L)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={avgConsumption}
                  onChange={(e) => setAvgConsumption(Number(e.target.value))}
                  className="bg-white"
                />
              </div>
            </div>

            <ChartContainer config={fuelConfig} className="h-[250px] w-full">
              <BarChart data={fuelChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="route" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
