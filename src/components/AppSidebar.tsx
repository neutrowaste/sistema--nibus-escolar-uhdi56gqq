import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Shield, Bus, Map as MapIcon, Compass, ScanFace, Wrench } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Usuários', url: '/iam/users', icon: Users },
  { title: 'Perfis', url: '/iam/roles', icon: Shield },
  { title: 'Veículos', url: '/fleet/vehicles', icon: Bus },
  { title: 'Manutenção', url: '/fleet/maintenance', icon: Wrench },
  { title: 'Rotas', url: '/ops/routes', icon: MapIcon },
  { title: 'Cockpit', url: '/ops/cockpit', icon: Compass },
  { title: 'Biometria', url: '/ops/biometrics', icon: ScanFace },
]

export function AppSidebar() {
  const location = useLocation()
  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex items-center px-4 font-bold border-b">
        <Bus className="mr-2 h-5 w-5 text-primary" />
        <span>Ônibus Escolar</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
