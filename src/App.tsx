import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider } from './contexts/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import Layout from './components/Layout'

import Login from './pages/Login'
import Index from './pages/Index'
import UsersPage from './pages/iam/UsersPage'
import RolesPage from './pages/iam/RolesPage'
import VehiclesPage from './pages/fleet/VehiclesPage'
import RoutesPage from './pages/ops/RoutesPage'
import CockpitPage from './pages/ops/CockpitPage'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
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
              <Route path="/fleet/vehicles" element={<VehiclesPage />} />
              <Route path="/ops/routes" element={<RoutesPage />} />
              <Route path="/ops/cockpit" element={<CockpitPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
