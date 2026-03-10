const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getHeaders = () => {
  return {
    'X-Org-Id': localStorage.getItem('orgId') || 'org-8103',
    'X-Branch-Id': localStorage.getItem('branchId') || 'br-001',
    'Content-Type': 'application/json',
  }
}

export const auditLog = (action: string, entity: string, details: any) => {
  console.log(
    `[AUDIT] Action: ${action} | Entity: ${entity} | Headers:`,
    getHeaders(),
    '| Details:',
    details,
  )
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

export const api = {
  users: {
    list: async () => {
      auditLog('LIST', 'User', {})
      await delay(500)
      return [...mockUsers]
    },
    update: async (id: string, data: Partial<User>) => {
      auditLog('UPDATE', 'User', { id, ...data })
      await delay(300)
      mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, ...data } : u))
    },
  },
  vehicles: {
    list: async () => {
      auditLog('LIST', 'Vehicle', {})
      await delay(600)
      return [...mockVehicles]
    },
  },
  routes: {
    list: async () => {
      auditLog('LIST', 'Route', {})
      await delay(400)
      return [...mockRoutes]
    },
  },
  biometrics: {
    requestPresignedUrl: async (studentId: string, filename: string) => {
      auditLog('REQUEST_URL', 'Biometrics', { studentId, filename })
      await delay(800)
      return {
        uploadUrl: `https://mock-s3.usecurling.com/uploads/${studentId}/${filename}?token=sec123`,
      }
    },
    processImage: async (url: string) => {
      auditLog('PROCESS', 'Biometrics', { url })
      await delay(1500)
      const success = Math.random() > 0.2
      return {
        status: success ? 'MATCH' : 'MISMATCH',
        confidence: success ? 0.95 + Math.random() * 0.04 : 0.4 + Math.random() * 0.3,
      }
    },
  },
}
