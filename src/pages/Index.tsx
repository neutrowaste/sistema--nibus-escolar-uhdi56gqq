import { useNotifications, AlertCategory } from '@/contexts/NotificationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Bell, Volume2, VolumeX, TrafficCone, Wrench, Settings2, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    soundSettings,
    toggleSoundSetting,
    addNotification,
  } = useNotifications()

  const simulateAlert = () => {
    const categories: AlertCategory[] = ['Traffic', 'Maintenance', 'Operational']
    const cat = categories[Math.floor(Math.random() * categories.length)]
    addNotification({
      title: `Alerta Simulado (${cat})`,
      message: 'Este é um evento em tempo real disparado pelo sistema de telemetria.',
      category: cat,
    })
  }

  const getIcon = (cat: AlertCategory) => {
    if (cat === 'Traffic') return <TrafficCone className="w-5 h-5 text-orange-500" />
    if (cat === 'Maintenance') return <Wrench className="w-5 h-5 text-blue-500" />
    return <Settings2 className="w-5 h-5 text-purple-500" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard & Alertas</h1>
          <p className="text-sm text-muted-foreground">
            Central de notificações em tempo real e visão geral da frota.
          </p>
        </div>
        <Button onClick={simulateAlert} variant="outline" className="bg-white">
          <Bell className="w-4 h-4 mr-2" /> Simular Alerta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Configurar Alertas (Som)</CardTitle>
              <CardDescription>Ative alertas sonoros por categoria.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(soundSettings) as AlertCategory[]).map((cat) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(cat)}
                    <span className="text-sm font-medium capitalize">
                      {cat === 'Traffic'
                        ? 'Trânsito'
                        : cat === 'Maintenance'
                          ? 'Manutenção'
                          : 'Operacional'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {soundSettings[cat] ? (
                      <Volume2 className="w-4 h-4 text-slate-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-300" />
                    )}
                    <Switch
                      checked={soundSettings[cat]}
                      onCheckedChange={() => toggleSoundSetting(cat)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-12 h-12 mb-4 opacity-80" />
              <h3 className="text-2xl font-bold">Frota Operacional</h3>
              <p className="text-primary-foreground/80 mt-1 text-sm">
                Nenhum incidente crítico no momento bloqueando a operação.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                Central de Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="rounded-full px-2">
                    {unreadCount} não lidas
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Alertas recentes do rastreamento e manutenção.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Marcar todas como lidas
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[600px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma notificação recente.
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="mt-1">{getIcon(n.category)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <p
                          className={`text-sm font-medium ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}
                        >
                          {n.title}
                        </p>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{n.message}</p>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-xs text-primary font-medium hover:underline mt-2"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
