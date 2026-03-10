import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api, NotificationSetting, NotificationLog } from '@/lib/api'
import { MessageSquare, Smartphone, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoadingSettings(true)
    const data = await api.notifications.getSettings()
    setSettings(data)
    setLoadingSettings(false)
  }

  const fetchLogs = async () => {
    setLoadingLogs(true)
    const data = await api.notifications.getLogs()
    setLogs(data)
    setLoadingLogs(false)
  }

  const toggleSetting = async (
    id: string,
    channel: 'smsEnabled' | 'whatsappEnabled',
    currentValue: boolean,
  ) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, [channel]: !currentValue } : s)))
    try {
      await api.notifications.updateSetting(id, { [channel]: !currentValue })
      toast.success('Configuração atualizada com sucesso')
    } catch (e) {
      toast.error('Erro ao atualizar configuração')
      setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, [channel]: currentValue } : s)))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notificações Externas</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie alertas via WhatsApp e SMS para responsáveis.
        </p>
      </div>

      <Tabs defaultValue="settings" onValueChange={(val) => val === 'logs' && fetchLogs()}>
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Configurações de Gatilhos</TabsTrigger>
          <TabsTrigger value="logs">Histórico de Envios (Logs)</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gatilhos de Alerta</CardTitle>
              <CardDescription>
                Defina quais canais externos serão utilizados para cada tipo de evento do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evento</TableHead>
                      <TableHead className="text-center">WhatsApp</TableHead>
                      <TableHead className="text-center">SMS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell className="font-medium">{setting.eventName}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={setting.whatsappEnabled}
                            onCheckedChange={() =>
                              toggleSetting(setting.id, 'whatsappEnabled', setting.whatsappEnabled)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={setting.smsEnabled}
                            onCheckedChange={() =>
                              toggleSetting(setting.id, 'smsEnabled', setting.smsEnabled)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Mensagens</CardTitle>
              <CardDescription>
                Registro de todas as mensagens disparadas assincronamente pelo gateway de
                notificações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Evento / Mensagem</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.channel === 'WhatsApp' ? (
                              <MessageSquare className="h-4 w-4 text-green-500" />
                            ) : (
                              <Smartphone className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="text-sm font-medium">{log.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.recipientName}</span>
                            <span className="text-xs text-muted-foreground">
                              {log.recipientPhone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col max-w-[300px]">
                            <span className="text-sm font-semibold">{log.eventName}</span>
                            <span
                              className="text-xs text-muted-foreground truncate"
                              title={log.message}
                            >
                              {log.message}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.status === 'Sent' ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Enviado
                            </Badge>
                          ) : log.status === 'Failed' ? (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 gap-1"
                            >
                              <XCircle className="h-3 w-3" /> Falha
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 gap-1"
                            >
                              <Clock className="h-3 w-3" /> Pendente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
