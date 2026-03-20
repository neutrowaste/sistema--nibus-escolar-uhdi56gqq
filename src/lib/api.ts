const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
export interface Vehicle {
  id: string
  plate: string
  model: string
  capacity: number
  status: 'Em Rota' | 'Parado' | 'Manutenção'
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
  whatsappAlerts?: boolean
  alertRadius?: number
  optimized?: boolean
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
export interface ChatMessage {
  id: string
  sender: 'admin' | 'parent'
  text: string
  timestamp: string
}
export interface Conversation {
  id: string
  parentName: string
  studentName: string
  unread: number
  messages: ChatMessage[]
}
export interface Incident {
  id: string
  studentId: string
  description: string
  severity: 'Baixa' | 'Média' | 'Alta'
  date: string
  status: 'Ativa' | 'Arquivada'
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

export interface MaintenanceTask {
  id: string
  vehicleId: string
  type: string
  description: string
  dueDate: string
  thresholdMileage?: number
  status: 'Pendente' | 'Em Andamento' | 'Concluída'
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
]
let mockVehicles: Vehicle[] = [
  { id: 'v1', plate: 'ABC-1234', model: 'Sprinter', capacity: 20, status: 'Em Rota' },
]
let mockRoutes: Route[] = [
  {
    id: 'r1',
    name: 'Rota Norte',
    startPoint: 'Escola',
    endPoint: 'Bairro',
    driver: 'João Mendes',
    vehiclePlate: 'ABC-1234',
    stops: 2,
    status: 'Em Andamento',
    whatsappAlerts: true,
    alertRadius: 500,
    checkpoints: [
      { id: 'cp1', name: 'Parada 1 (Escola)', lat: -23.561414, lng: -46.655881, radius: 500 },
      { id: 'cp2', name: 'Parada 2 (Bairro)', lat: -23.573416, lng: -46.653633, radius: 500 },
    ],
  },
]
let mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Lucas Silva',
    parentName: 'Ana Silva',
    parentPhone: '11999991111',
    routeId: 'r1',
    stopId: 'cp1',
  },
  {
    id: 's2',
    name: 'Mariana Souza',
    parentName: 'Carlos Souza',
    parentPhone: '11988882222',
    routeId: 'r2',
    stopId: 'cp2',
  },
]
let mockIncidents: Incident[] = [
  {
    id: 'i1',
    studentId: 's1',
    description: 'Conversa excessiva e recusa a sentar',
    severity: 'Média',
    date: '2023-10-25T14:30',
    status: 'Ativa',
  },
]
let mockConversations: Conversation[] = [
  {
    id: 'c1',
    parentName: 'Ana Silva',
    studentName: 'Lucas Silva',
    unread: 1,
    messages: [
      {
        id: 'm1',
        sender: 'parent',
        text: 'Bom dia, o Lucas não vai hoje.',
        timestamp: new Date().toISOString(),
      },
    ],
  },
]

export const api = {
  drivers: {
    list: async () => [...mockDrivers],
    add: async (d: Partial<Driver>) => true,
    update: async (id: string, d: Partial<Driver>) => true,
    delete: async (id: string) => true,
  },
  vehicles: {
    list: async () => [...mockVehicles],
    add: async (v: Partial<Vehicle>) => true,
    update: async (id: string, v: Partial<Vehicle>) => true,
    delete: async (id: string) => true,
  },
  routes: {
    list: async () => [...mockRoutes],
    add: async (r: Partial<Route>) => {
      const newR = { id: Math.random().toString(), checkpoints: [], ...r } as Route
      mockRoutes.push(newR)
      return newR
    },
    update: async (id: string, r: Partial<Route>) => {
      mockRoutes = mockRoutes.map((item) => (item.id === id ? { ...item, ...r } : item))
      return r
    },
    delete: async (id: string) => {
      mockRoutes = mockRoutes.filter((r) => r.id !== id)
      return true
    },
  },
  students: {
    list: async () => [...mockStudents],
    update: async (id: string, s: Partial<Student>) => {
      mockStudents = mockStudents.map((item) => (item.id === id ? { ...item, ...s } : item))
      return mockStudents.find((x) => x.id === id)
    },
    getIncidents: async (studentId: string) =>
      mockIncidents.filter((i) => i.studentId === studentId),
    addIncident: async (incident: Partial<Incident>) => {
      const newI = { id: Math.random().toString(), status: 'Ativa', ...incident } as Incident
      mockIncidents.push(newI)
      return newI
    },
    updateIncident: async (id: string, data: Partial<Incident>) => {
      mockIncidents = mockIncidents.map((i) => (i.id === id ? { ...i, ...data } : i))
      return true
    },
  },
  notifications: {
    getSettings: async () => [],
    getLogs: async () => [],
    updateSetting: async (id: string, val: any) => true,
  },
  chat: {
    getConversations: async () => [...mockConversations],
    sendMessage: async (convId: string, text: string, sender: 'admin' | 'parent') => {
      const newMsg = {
        id: Math.random().toString(),
        sender,
        text,
        timestamp: new Date().toISOString(),
      }
      const conv = mockConversations.find((c) => c.id === convId)
      if (conv) conv.messages.push(newMsg)
      return newMsg
    },
    markAsRead: async (convId: string) => {
      const conv = mockConversations.find((c) => c.id === convId)
      if (conv) conv.unread = 0
      return true
    },
  },
  history: {
    getTrajectory: async (date: string, vehicleId: string) => [
      { lat: -23.561414, lng: -46.655881 },
      { lat: -23.573416, lng: -46.653633 },
      { lat: -23.587416, lng: -46.657633 },
    ],
  },
  performance: {
    getMetrics: async () => ({
      occupancy: [
        { route: 'Rota Norte', rate: 85 },
        { route: 'Rota Sul', rate: 60 },
      ],
      punctuality: [
        { day: 'Seg', onTime: 90, delayed: 10 },
        { day: 'Ter', onTime: 85, delayed: 15 },
      ],
      fuelData: [
        { route: 'Rota Norte', distance: 120 },
        { route: 'Rota Sul', distance: 85 },
      ],
    }),
  },
  biometrics: {
    requestPresignedUrl: async (id: string, fileName: string) => ({
      uploadUrl: 'https://mock-s3-url.com/upload',
    }),
    processImage: async (url: string) => {
      await delay(1500)
      return { status: 'MATCH', confidence: 0.98 }
    },
  },
  documents: {
    list: async () => [],
    add: async (d: Partial<SystemDocument>) => true,
    delete: async (id: string) => true,
  },
  maintenance: {
    list: async () => [],
    add: async (d: Partial<MaintenanceTask>) => true,
    update: async (id: string, d: Partial<MaintenanceTask>) => true,
  },
  users: {
    list: async () => [],
  },
}
