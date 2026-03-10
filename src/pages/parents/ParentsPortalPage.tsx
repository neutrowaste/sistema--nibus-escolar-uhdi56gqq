import React, { useEffect, useState } from 'react'
import { Bus, Clock, BellRing, LogOut, Navigation, MessageSquare, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, ChatMessage } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ParentsPortalPage() {
  const { logout } = useAuth()
  const [telemetry, setTelemetry] = useState({ lat: 100, lng: 100 })
  const [arrivalAlertSent, setArrivalAlertSent] = useState(false)
  const [progress, setProgress] = useState(0)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgText, setMsgText] = useState('')

  useEffect(() => {
    api.chat.getConversations().then((data) => {
      const parentConv = data.find((c) => c.id === 'c1')
      if (parentConv) setMessages(parentConv.messages)
    })

    let p = 0
    const interval = setInterval(() => {
      p += 0.005
      if (p > 1) p = 0
      setProgress(p)
      setTelemetry({ lng: 100 + 300 * p, lat: 100 + 200 * p })
      if (p >= 0.8 && p < 0.85 && !arrivalAlertSent) {
        setArrivalAlertSent(true)
        toast.info('Notificação de Chegada!', {
          description: 'O ônibus está próximo ao ponto de parada.',
          icon: <BellRing className="h-5 w-5 text-blue-500" />,
        })
      }
    }, 100)
    return () => clearInterval(interval)
  }, [arrivalAlertSent])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!msgText.trim()) return
    const newMsg = await api.chat.sendMessage('c1', msgText, 'parent')
    setMessages((prev) => [...prev, newMsg])
    setMsgText('')
  }

  const etaMinutes = Math.max(1, Math.floor((1 - progress) * 20))

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

      <main className="flex-1 p-4 w-full max-w-md mx-auto mt-2 flex flex-col">
        <Tabs defaultValue="map" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Navigation className="w-4 h-4 mr-2" /> Rastreio
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Contato
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-5 mt-0 flex-1">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Rota Designada: Rota Norte</h2>
              <p className="text-sm text-slate-500 mt-1">
                Acompanhe a viagem do seu dependente ao vivo.
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
                  <circle cx="400" cy="300" r="12" fill="#10b981" />
                  <text
                    x="400"
                    y="275"
                    fill="#10b981"
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Sua Parada
                  </text>
                </svg>
                <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1.5 rounded-full shadow-sm text-xs font-semibold flex items-center gap-1.5 border">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  GPS Ao vivo
                </div>
              </div>
              <CardContent className="p-5 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Veículo ABC-1234</h3>
                    <p className="text-sm text-blue-600 flex items-center gap-1.5 mt-1 font-bold">
                      <Clock className="h-4 w-4" /> Chegada est. em {etaMinutes} min
                    </p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Em Rota
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-0 flex-1 flex flex-col min-h-[60vh]">
            <Card className="flex-1 flex flex-col overflow-hidden border-2 border-slate-200">
              <div className="bg-slate-100 p-4 border-b font-semibold text-slate-800 text-center text-sm">
                Atendimento - Base Escolar
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex flex-col max-w-[85%]',
                      m.sender === 'parent' ? 'ml-auto items-end' : 'items-start',
                    )}
                  >
                    <div
                      className={cn(
                        'px-4 py-2.5 rounded-2xl text-sm shadow-sm',
                        m.sender === 'parent'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none',
                      )}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) || 'Agora'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="flex-1 rounded-full"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full"
                    disabled={!msgText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
