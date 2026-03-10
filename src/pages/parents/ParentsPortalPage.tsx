import React, { useEffect, useState } from 'react'
import { Bus, Clock, BellRing, LogOut, Navigation } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ParentsPortalPage() {
  const { logout, user } = useAuth()
  const [telemetry, setTelemetry] = useState({ lat: 100, lng: 100 })
  const [arrivalAlertSent, setArrivalAlertSent] = useState(false)

  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += 0.005
      if (p > 1) p = 0

      const lng = 100 + 300 * p
      const lat = 100 + 200 * p

      setTelemetry({ lng, lat })

      if (p >= 0.8 && p < 0.85 && !arrivalAlertSent) {
        setArrivalAlertSent(true)
        toast.info('Notificação de Chegada!', {
          description: 'O ônibus está próximo ao ponto de parada. Previsão: 5 minutos.',
          icon: <BellRing className="h-5 w-5 text-blue-500" />,
          duration: 10000,
        })
      }
    }, 100)
    return () => clearInterval(interval)
  }, [arrivalAlertSent])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans animate-fade-in">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <h1 className="font-bold text-lg leading-none">Portal Família</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-primary-foreground hover:bg-primary/90 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 p-4 w-full max-w-md mx-auto space-y-5 mt-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Olá, Responsável</h2>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhe a viagem do seu dependente em tempo real.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-slate-200 shadow-sm">
          <div className="h-56 bg-slate-100 relative">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 500 300"
              preserveAspectRatio="none"
            >
              <path
                d="M 100 100 L 400 300"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="6"
                strokeDasharray="10 10"
                className="animate-pulse"
              />
              <circle
                cx={telemetry.lng}
                cy={telemetry.lat}
                r="14"
                fill="#3b82f6"
                className="transition-all duration-100 ease-linear shadow-lg"
              />
              <circle
                cx={telemetry.lng}
                cy={telemetry.lat}
                r="24"
                fill="#3b82f6"
                opacity="0.2"
                className="animate-ping"
              />
              <circle cx="400" cy="300" r="12" fill="#10b981" />
              <text
                x="400"
                y="275"
                fill="#10b981"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                Sua Casa
              </text>
              <text
                x="100"
                y="75"
                fill="#64748b"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                Escola
              </text>
            </svg>
            <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1.5 rounded-full shadow-sm text-xs font-semibold flex items-center gap-1.5 border">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Ao vivo
            </div>
          </div>
          <CardContent className="p-5 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Veículo ABC-1234</h3>
                <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                  <Clock className="h-4 w-4 text-slate-400" /> Chegada est. 12:45 PM
                </p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Em Rota
              </div>
            </div>
            <Button className="w-full" variant="outline">
              <Navigation className="mr-2 h-4 w-4" /> Ver Rota Completa
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <h4 className="font-semibold text-slate-800 mb-6">Status da Viagem</h4>
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
              <div className="relative pl-6">
                <div className="absolute -left-[11px] top-0 bg-green-500 rounded-full w-5 h-5 ring-4 ring-white shadow-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="font-semibold text-sm text-slate-900">
                  Embarque Confirmado na Escola
                </p>
                <p className="text-xs text-slate-500 mt-0.5">12:30 PM • Autenticação Biométrica</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[11px] top-0 bg-blue-500 rounded-full w-5 h-5 ring-4 ring-white shadow-sm">
                  <div className="w-full h-full rounded-full animate-ping bg-blue-400 opacity-50"></div>
                </div>
                <p className="font-semibold text-sm text-slate-900">A caminho (Rota Sul)</p>
                <p className="text-xs text-slate-500 mt-0.5">Posição atual do ônibus</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[11px] top-0 bg-slate-200 rounded-full w-5 h-5 ring-4 ring-white shadow-sm border-2 border-slate-300"></div>
                <p className="font-medium text-sm text-slate-500">Ponto de Parada (Sua Casa)</p>
                <p className="text-xs text-slate-400 mt-0.5">Previsão: 12:45 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
