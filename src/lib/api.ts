// Mock API Client to simulate backend interactions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Auditing interceptor simulation
export const auditLog = (action: string, entity: string, details: any) => {
  console.log(`[AUDIT] Action: ${action} | Entity: ${entity} | Details:`, details)
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'Ativo' | 'Inativo'
}

export interface Vehicle {
  id: string
  plate: string
  model: string
  capacity: number
  status: 'Em Rota' | 'Parado' | 'Manutenção'
}

export interface Route {
  id: string
  name: string
  driver: string
  vehiclePlate: string
  stops: number
  status: 'Agendada' | 'Em Andamento' | 'Concluída'
}

// Mock Data
let mockUsers: User[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos@escola.pt',
    role: 'Administrador',
    status: 'Ativo',
  },
  { id: '2', name: 'Ana Oliveira', email: 'ana@escola.pt', role: 'Coordenador', status: 'Ativo' },
  { id: '3', name: 'Pedro Santos', email: 'pedro@escola.pt', role: 'Motorista', status: 'Inativo' },
]

let mockVehicles: Vehicle[] = [
  { id: 'v1', plate: 'ABC-1234', model: 'Mercedes Sprinter', capacity: 20, status: 'Em Rota' },
  { id: 'v2', plate: 'XYZ-9876', model: 'Volvo B270F', capacity: 45, status: 'Parado' },
  { id: 'v3', plate: 'DEF-5678', model: 'VW Volksbus', capacity: 30, status: 'Manutenção' },
]

let mockRoutes: Route[] = [
  {
    id: 'r1',
    name: 'Rota Norte - Manhã',
    driver: 'João Mendes',
    vehiclePlate: 'ABC-1234',
    stops: 12,
    status: 'Em Andamento',
  },
  {
    id: 'r2',
    name: 'Rota Sul - Tarde',
    driver: 'Miguel Costa',
    vehiclePlate: 'XYZ-9876',
    stops: 8,
    status: 'Agendada',
  },
]

// Fetchers
export const api = {
  users: {
    list: async () => {
      await delay(500)
      return [...mockUsers]
    },
    update: async (id: string, data: Partial<User>) => {
      await delay(300)
      mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, ...data } : u))
      auditLog('UPDATE', 'User', { id, ...data })
    },
  },
  vehicles: {
    list: async () => {
      await delay(600)
      return [...mockVehicles]
    },
  },
  routes: {
    list: async () => {
      await delay(400)
      return [...mockRoutes]
    },
  },
}
