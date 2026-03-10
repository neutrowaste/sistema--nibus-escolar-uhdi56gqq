import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CockpitPage() {
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cockpit de Monitoramento</h1>
          <p className="text-sm text-muted-foreground">
            Rastreamento em tempo real da frota ativa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filtrar por Rota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Rotas</SelectItem>
              <SelectItem value="r1">Rota Norte - Manhã</SelectItem>
              <SelectItem value="r2">Rota Sul - Tarde</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="bg-white px-3 py-1.5 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>2
            Veículos Online
          </Badge>
        </div>
      </div>

      <Card className="flex-1 relative overflow-hidden bg-slate-100 border-2 border-slate-200 rounded-xl shadow-inner">
        {/* Fake Map Implementation */}
        <div className="absolute inset-0 map-grid-pattern opacity-50"></div>

        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Rota 1 Line */}
          <path
            d="M 100 100 C 200 150, 300 100, 400 300 C 450 400, 600 450, 800 400"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray="8 8"
            className="opacity-60"
          />
          {/* Rota 2 Line */}
          <path
            d="M 800 150 L 600 200 L 400 500"
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeDasharray="8 8"
            className="opacity-60"
          />

          {/* Stops for Rota 1 */}
          <circle cx="100" cy="100" r="6" fill="#fff" stroke="#3b82f6" strokeWidth="3" />
          <circle cx="400" cy="300" r="6" fill="#fff" stroke="#3b82f6" strokeWidth="3" />
          <circle cx="800" cy="400" r="6" fill="#fff" stroke="#3b82f6" strokeWidth="3" />
        </svg>

        {/* Fake Moving Bus 1 */}
        <div
          className="absolute top-[280px] left-[380px] group cursor-pointer animate-float"
          style={{ animationDuration: '4s' }}
        >
          <div className="h-6 w-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center relative z-10">
            <div className="h-2 w-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ABC-1234 (40km/h)
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Fake Moving Bus 2 */}
        <div
          className="absolute top-[180px] left-[680px] group cursor-pointer animate-float"
          style={{ animationDuration: '5s', animationDelay: '1s' }}
        >
          <div className="h-6 w-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center relative z-10">
            <div className="h-2 w-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            XYZ-9876 (Parado)
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>

        {/* School Pin */}
        <div className="absolute top-[400px] left-[600px] flex flex-col items-center">
          <div className="text-4xl">🏫</div>
          <span className="bg-white/80 px-2 py-0.5 rounded text-xs font-bold shadow-sm backdrop-blur-sm mt-1">
            Escola Central
          </span>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <div className="bg-white rounded-md shadow-md p-1 flex flex-col">
            <button className="p-2 hover:bg-slate-100 rounded-t-sm border-b font-bold text-slate-600">
              +
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-b-sm font-bold text-slate-600">
              -
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
