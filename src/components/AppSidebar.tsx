import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import {
  Bus,
  LayoutDashboard,
  Map,
  Route,
  ShieldAlert,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
  {
    title: 'Gestão de Acessos',
    items: [
      { title: 'Usuários', icon: Users, url: '/iam/users' },
      { title: 'Perfis e Permissões', icon: ShieldAlert, url: '/iam/roles' },
    ],
  },
  {
    title: 'Frota',
    items: [{ title: 'Veículos', icon: Bus, url: '/fleet/vehicles' }],
  },
  {
    title: 'Operacional',
    items: [
      { title: 'Rotas Planejadas', icon: Route, url: '/ops/routes' },
      { title: 'Cockpit (Ao Vivo)', icon: Map, url: '/ops/cockpit' },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
          <Bus className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight">Sistema Ônibus</span>
          <span className="text-xs text-sidebar-foreground/60">Portal Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map((group, idx) => (
          <SidebarGroup key={idx}>
            {group.title !== 'Dashboard' && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items ? (
                  group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === group.url}>
                      <Link to={group.url!}>
                        <group.icon className="h-4 w-4" />
                        <span>{group.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors text-left">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.name}</span>
                <span className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
