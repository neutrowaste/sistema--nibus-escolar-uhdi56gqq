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
    driver: 'João',
    vehiclePlate: 'ABC-1234',
    stops: 2,
    status: 'Em Andamento',
    whatsappAlerts: true,
    alertRadius: 500,
    checkpoints: [],
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

export const api = {
  drivers: { list: async () => [...mockDrivers] },
  vehicles: { list: async () => [...mockVehicles] },
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
    getConversations: async () => [],
    sendMessage: async () =>
      ({ id: '1', sender: 'parent', text: 'ok', timestamp: '' }) as ChatMessage,
  },
}
