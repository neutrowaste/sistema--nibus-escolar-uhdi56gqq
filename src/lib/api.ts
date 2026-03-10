const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
export interface Driver {
  id: string
  name: string
  cnh: string
  phone: string
  vehicleId?: string
  status: 'Ativo' | 'Férias' | 'Afastado'
}
export interface SystemDocument {
  id: string
  title: string
  type: string
  entityType: 'vehicle' | 'driver'
  entityId: string
  issueDate: string
  expiryDate: string
  status: 'Valid' | 'Expiring' | 'Expired'
}
export interface Vehicle {
  id: string
  plate: string
  model: string
  capacity: number
  status: 'Em Rota' | 'Parado' | 'Manutenção'
  documents?: any[]
}
export interface Checkpoint {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
}
export interface Route {
  id: string
  name: string
  startPoint?: string
  endPoint?: string
  driver: string
  vehiclePlate: string
  stops: number
  status: 'Agendada' | 'Em Andamento' | 'Concluída'
  checkpoints: Checkpoint[]
}
export interface MaintenanceTask {
  id: string
  vehicleId: string
  type: string
  description: string
  status: 'Pendente' | 'Em Andamento' | 'Concluída'
  dueDate: string
  thresholdMileage?: number
}
export interface Student {
  id: string
  name: string
  parentName: string
  parentPhone: string
  routeId: string
  stopId: string
}
export interface NotificationSetting {
  id: string
  eventName: string
  smsEnabled: boolean
  whatsappEnabled: boolean
}
export interface NotificationLog {
  id: string
  timestamp: string
  channel: 'SMS' | 'WhatsApp'
  recipientName: string
  recipientPhone: string
  eventName: string
  message: string
  status: 'Sent' | 'Failed' | 'Pending'
}

let mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'João Mendes',
    cnh: '12345678901',
    phone: '11999998888',
    vehicleId: 'v1',
    status: 'Ativo',
  },
  {
    id: 'd2',
    name: 'Miguel Costa',
    cnh: '98765432109',
    phone: '11988887777',
    vehicleId: 'v2',
    status: 'Ativo',
  },
]

let mockVehicles: Vehicle[] = [
  { id: 'v1', plate: 'ABC-1234', model: 'Mercedes Sprinter', capacity: 20, status: 'Em Rota' },
  { id: 'v2', plate: 'XYZ-9876', model: 'Volvo B270F', capacity: 45, status: 'Parado' },
]

let mockDocuments: SystemDocument[] = [
  {
    id: 'doc1',
    title: 'Seguro Veicular',
    type: 'Seguro',
    entityType: 'vehicle',
    entityId: 'v1',
    issueDate: '2023-01-01',
    expiryDate: '2024-01-01',
    status: 'Expired',
  },
  {
    id: 'doc2',
    title: 'CNH Motorista',
    type: 'CNH',
    entityType: 'driver',
    entityId: 'd1',
    issueDate: '2020-05-10',
    expiryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    status: 'Expiring',
  },
  {
    id: 'doc3',
    title: 'Licenciamento',
    type: 'CRLV',
    entityType: 'vehicle',
    entityId: 'v2',
    issueDate: '2024-02-01',
    expiryDate: '2025-02-01',
    status: 'Valid',
  },
]

let mockRoutes: Route[] = [
  {
    id: 'r1',
    name: 'Rota Norte - Manhã',
    startPoint: 'Escola Central',
    endPoint: 'Bairro Norte',
    driver: 'João Mendes',
    vehiclePlate: 'ABC-1234',
    stops: 2,
    status: 'Em Andamento',
    checkpoints: [
      { id: 'cp1', name: 'Ponto A (Mercado)', lat: 150, lng: 200, radius: 20 },
      { id: 'cp2', name: 'Ponto B (Praça)', lat: 250, lng: 350, radius: 20 },
    ],
  },
  {
    id: 'r2',
    name: 'Rota Sul - Tarde',
    startPoint: 'Escola Central',
    endPoint: 'Bairro Sul',
    driver: 'Miguel Costa',
    vehiclePlate: 'XYZ-9876',
    stops: 0,
    status: 'Agendada',
    checkpoints: [],
  },
]

let mockMaintenance: MaintenanceTask[] = [
  {
    id: 'm1',
    vehicleId: 'v1',
    type: 'Troca de Óleo',
    description: 'Revisão 10k',
    status: 'Pendente',
    dueDate: '2024-12-01',
  },
]
let mockStudents: Student[] = []
let mockNotificationSettings: NotificationSetting[] = []
let mockNotificationLogs: NotificationLog[] = []

export const api = {
  drivers: {
    list: async () => {
      await delay(300)
      return [...mockDrivers]
    },
    add: async (d: Partial<Driver>) => {
      await delay(300)
      const newD = { id: Math.random().toString(), ...d } as Driver
      mockDrivers.push(newD)
      return newD
    },
    update: async (id: string, d: Partial<Driver>) => {
      await delay(300)
      mockDrivers = mockDrivers.map((item) => (item.id === id ? { ...item, ...d } : item))
      return d
    },
    delete: async (id: string) => {
      await delay(300)
      mockDrivers = mockDrivers.filter((d) => d.id !== id)
      return true
    },
  },
  vehicles: {
    list: async () => {
      await delay(400)
      return [...mockVehicles]
    },
    add: async (v: Partial<Vehicle>) => {
      await delay(300)
      const newV = { id: Math.random().toString(), ...v } as Vehicle
      mockVehicles.push(newV)
      return newV
    },
    update: async (id: string, v: Partial<Vehicle>) => {
      await delay(300)
      mockVehicles = mockVehicles.map((item) => (item.id === id ? { ...item, ...v } : item))
      return v
    },
    delete: async (id: string) => {
      await delay(300)
      mockVehicles = mockVehicles.filter((v) => v.id !== id)
      return true
    },
  },
  documents: {
    list: async () => {
      await delay(300)
      return [...mockDocuments]
    },
    add: async (d: Partial<SystemDocument>) => {
      await delay(300)
      const newD = { id: Math.random().toString(), status: 'Valid', ...d } as SystemDocument
      mockDocuments.push(newD)
      return newD
    },
    delete: async (id: string) => {
      await delay(300)
      mockDocuments = mockDocuments.filter((d) => d.id !== id)
      return true
    },
  },
  routes: {
    list: async () => {
      await delay(400)
      return [...mockRoutes]
    },
    add: async (r: Partial<Route>) => {
      await delay(300)
      const newR = { id: Math.random().toString(), checkpoints: [], ...r } as Route
      mockRoutes.push(newR)
      return newR
    },
    update: async (id: string, r: Partial<Route>) => {
      await delay(300)
      mockRoutes = mockRoutes.map((item) => (item.id === id ? { ...item, ...r } : item))
      return r
    },
    delete: async (id: string) => {
      await delay(300)
      mockRoutes = mockRoutes.filter((r) => r.id !== id)
      return true
    },
  },
  maintenance: {
    list: async () => {
      await delay(300)
      return [...mockMaintenance]
    },
  },
  students: {
    list: async () => {
      await delay(300)
      return [...mockStudents]
    },
  },
  notifications: {
    getSettings: async () => [...mockNotificationSettings],
    getLogs: async () => [...mockNotificationLogs],
    sendExternal: (eventId: string, message: string, routeId?: string) => {
      auditLog('NOTIFY', eventId, { message, routeId })
    },
  },
  performance: {
    getMetrics: async () => {
      await delay(300)
      return {
        occupancy: [
          { route: 'Norte', rate: 92 },
          { route: 'Sul', rate: 85 },
        ],
        punctuality: [
          { day: 'Seg', onTime: 95, delayed: 5 },
          { day: 'Ter', onTime: 92, delayed: 8 },
        ],
      }
    },
  },
  history: {
    getTrajectory: async (date: string, vehicleId: string) => {
      await delay(500)
      return [
        { lat: 100, lng: 100, time: '07:00' },
        { lat: 120, lng: 150, time: '07:15' },
        { lat: 180, lng: 200, time: '07:30' },
        { lat: 250, lng: 300, time: '07:45' },
        { lat: 300, lng: 400, time: '08:00' },
        { lat: 280, lng: 500, time: '08:15' },
      ]
    },
  },
}
