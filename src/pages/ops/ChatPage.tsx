import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, User, MessageCircle } from 'lucide-react'
import { api, Conversation } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [msgText, setMsgText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.chat.getConversations().then((data) => {
      setConversations(data)
      setIsLoading(false)
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id)
        api.chat.markAsRead(data[0].id)
      }
    })
  }, [activeConvId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, activeConvId])

  const handleSend = async () => {
    if (!msgText.trim() || !activeConvId) return
    const text = msgText
    setMsgText('')
    await api.chat.sendMessage(activeConvId, text, 'admin')
    const updated = await api.chat.getConversations()
    setConversations(updated)
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  if (isLoading)
    return <div className="p-8 text-center text-slate-500">Carregando mensagens...</div>

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Central de Comunicações</h1>
        <p className="text-sm text-muted-foreground">
          Atenda responsáveis, tire dúvidas e receba avisos de faltas.
        </p>
      </div>

      <Card className="flex-1 flex overflow-hidden border-slate-200">
        <div className="w-1/3 max-w-sm border-r flex flex-col bg-slate-50">
          <div className="p-4 font-semibold text-slate-800 border-b bg-white shadow-sm">
            Conversas Ativas
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConvId(c.id)
                  api.chat.markAsRead(c.id)
                  setConversations((prev) =>
                    prev.map((item) => (item.id === c.id ? { ...item, unread: 0 } : item)),
                  )
                }}
                className={cn(
                  'p-4 border-b cursor-pointer transition-colors hover:bg-slate-100 flex items-start gap-3',
                  activeConvId === c.id
                    ? 'bg-blue-50/50 border-l-4 border-l-blue-500'
                    : 'border-l-4 border-l-transparent',
                )}
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold truncate text-slate-900">
                      {c.parentName}
                    </h4>
                    {c.unread > 0 && (
                      <Badge className="bg-blue-500 rounded-full px-1.5 min-w-5 justify-center">
                        {c.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">Aluno: {c.studentName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              <div className="p-4 border-b bg-white shadow-sm flex items-center gap-3 z-10">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{activeConv.parentName}</h3>
                  <p className="text-xs text-slate-500">Responsável por {activeConv.studentName}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {activeConv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex flex-col max-w-[75%]',
                      m.sender === 'admin' ? 'ml-auto items-end' : 'items-start',
                    )}
                  >
                    <div
                      className={cn(
                        'px-4 py-2 rounded-2xl text-sm shadow-sm',
                        m.sender === 'admin'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none',
                      )}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!msgText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
              <MessageCircle className="w-12 h-12 opacity-20" />
              <p>Selecione uma conversa para iniciar</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
