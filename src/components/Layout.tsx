import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAuth } from '@/contexts/AuthContext'
import { MapPin, Bell, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/contexts/NotificationContext'
import { useOfflineSync } from '@/contexts/OfflineSyncContext'

function NetworkStatus() {
  const { isOnline, syncQueueCount, toggleSimulation } = useOfflineSync()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSimulation}
          className={cn(
            'relative',
            !isOnline && 'text-red-500 hover:text-red-600',
            isOnline && syncQueueCount > 0 && 'text-blue-500',
          )}
        >
          {!isOnline ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <Wifi className={cn('h-5 w-5', syncQueueCount > 0 && 'animate-pulse')} />
          )}
          {syncQueueCount > 0 && isOnline && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 min-w-4 flex items-center justify-center px-1">
              {syncQueueCount}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm font-medium mb-1">
          {!isOnline ? 'Modo Offline Ativado' : 'Sistema Online'}
        </p>
        {!isOnline && (
          <p className="text-xs text-muted-foreground">Pacotes na fila: {syncQueueCount}</p>
        )}
        {isOnline && syncQueueCount > 0 && (
          <p className="text-xs text-muted-foreground">Sincronizando {syncQueueCount} itens...</p>
        )}
        <p className="text-[10px] text-slate-400 mt-2">
          Clique para simular {isOnline ? 'offline' : 'online'}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b flex items-center justify-between bg-slate-50">
          <h4 className="font-semibold">Notificações</h4>
          <span className="text-xs text-muted-foreground">{unreadCount} não lidas</span>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  'p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors',
                  !n.read && 'bg-blue-50/50',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 rounded-full p-1',
                      n.type === 'alert'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-600',
                    )}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', !n.read && 'text-slate-900')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function Layout() {
  const location = useLocation()
  const { user } = useAuth()

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    if (paths.length === 0) return [{ name: 'Dashboard', path: '/' }]

    return paths.map((path, idx) => {
      const url = `/${paths.slice(0, idx + 1).join('/')}`
      return {
        name: path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '),
        path: url,
      }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
          <SidebarTrigger />
          <div className="flex-1 flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                  <BreadcrumbItem key={crumb.path}>
                    {idx === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink href={crumb.path}>{crumb.name}</BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-2 sm:gap-4">
              <NetworkStatus />
              <NotificationBell />
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Filial Principal ({user?.branchId})
              </Badge>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in overflow-auto">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
