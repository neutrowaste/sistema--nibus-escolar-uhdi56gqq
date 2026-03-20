import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  Shield,
  GraduationCap,
  IdCard,
  Bus,
  Wrench,
  FileText,
  Map,
  Activity,
  BarChart,
  ScanFace,
  MessageSquare,
  Bell,
} from 'lucide-react'

export function AppSidebar() {
  const location = useLocation()

  const navGroups = [
    {
      title: 'Visão Geral',
      items: [{ title: 'Dashboard', path: '/', icon: LayoutDashboard }],
    },
    {
      title: 'Gestão (IAM)',
      items: [
        { title: 'Usuários', path: '/iam/users', icon: Users },
        { title: 'Perfis e Acessos', path: '/iam/roles', icon: Shield },
        { title: 'Alunos', path: '/iam/students', icon: GraduationCap },
        { title: 'Motoristas', path: '/iam/drivers', icon: IdCard },
      ],
    },
    {
      title: 'Frota',
      items: [
        { title: 'Veículos', path: '/fleet/vehicles', icon: Bus },
        { title: 'Manutenção', path: '/fleet/maintenance', icon: Wrench },
        { title: 'Documentos', path: '/fleet/documents', icon: FileText },
      ],
    },
    {
      title: 'Operações',
      items: [
        { title: 'Rotas', path: '/ops/routes', icon: Map },
        { title: 'Cockpit', path: '/ops/cockpit', icon: Activity },
        { title: 'Desempenho', path: '/ops/performance', icon: BarChart },
        { title: 'Biometria', path: '/ops/biometrics', icon: ScanFace },
        { title: 'Comunicações', path: '/ops/chat', icon: MessageSquare },
      ],
    },
    {
      title: 'Configurações',
      items: [{ title: 'Notificações', path: '/settings/notifications', icon: Bell }],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex items-center px-4 border-b">
        <Bus className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg tracking-tight">Ônibus Escolar</span>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.path}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
