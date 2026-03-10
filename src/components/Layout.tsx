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
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

            <div className="flex items-center gap-4">
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
