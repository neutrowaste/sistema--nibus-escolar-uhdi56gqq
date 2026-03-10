import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { OfflineSyncProvider } from './contexts/OfflineSyncContext'
import { RequireAuth } from './components/RequireAuth'
import Layout from './components/Layout'

import Login from './pages/Login'
import Index from './pages/Index'
import UsersPage from './pages/iam/UsersPage'
import RolesPage from './pages/iam/RolesPage'
import StudentsPage from './pages/iam/StudentsPage'
import VehiclesPage from './pages/fleet/VehiclesPage'
import MaintenancePage from './pages/fleet/MaintenancePage'
import RoutesPage from './pages/ops/RoutesPage'
import CockpitPage from './pages/ops/CockpitPage'
import BiometricsPage from './pages/ops/BiometricsPage'
import NotificationsPage from './pages/settings/NotificationsPage'
import ParentsPortalPage from './pages/parents/ParentsPortalPage'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <OfflineSyncProvider>
      <NotificationProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<RequireAuth />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/iam/users" element={<UsersPage />} />
                  <Route path="/iam/roles" element={<RolesPage />} />
                  <Route path="/iam/students" element={<StudentsPage />} />
                  <Route path="/fleet/vehicles" element={<VehiclesPage />} />
                  <Route path="/fleet/maintenance" element={<MaintenancePage />} />
                  <Route path="/ops/routes" element={<RoutesPage />} />
                  <Route path="/ops/cockpit" element={<CockpitPage />} />
                  <Route path="/ops/biometrics" element={<BiometricsPage />} />
                  <Route path="/settings/notifications" element={<NotificationsPage />} />
                </Route>
                <Route path="/parents/portal" element={<ParentsPortalPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </NotificationProvider>
    </OfflineSyncProvider>
  </BrowserRouter>
)

export default App
