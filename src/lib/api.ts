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

export interface VehicleDocument {
  id: string
  title: string
  type: string
  expiryDate: string
}

export interface Vehicle {
  id: string
  plate: string
  model: string
  capacity: number
  status: 'Em Rota' | 'Parado' | 'Manutenção'
  documents: VehicleDocument[]
}

export interface Route {
  id: string
  name: string
  driver: string
  vehiclePlate: string
  stops: number
  status: 'Agendada' | 'Em Andamento' | 'Concluída'
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
  {
    id: 'v1',
    plate: 'ABC-1234',
    model: 'Mercedes Sprinter',
    capacity: 20,
    status: 'Em Rota',
    documents: [
      {
        id: 'd1',
        title: 'Seguro Obrigatório',
        type: 'Seguro',
        expiryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      },
      {
        id: 'd2',
        title: 'Licença Municipal',
        type: 'Alvará',
        expiryDate: new Date(Date.now() + 120 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'v2',
    plate: 'XYZ-9876',
    model: 'Volvo B270F',
    capacity: 45,
    status: 'Parado',
    documents: [
      {
        id: 'd3',
        title: 'Inspeção Veicular',
        type: 'Manutenção',
        expiryDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'v3',
    plate: 'DEF-5678',
    model: 'VW Volksbus',
    capacity: 30,
    status: 'Manutenção',
    documents: [],
  },
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

let mockMaintenance: MaintenanceTask[] = [
  {
    id: 'm1',
    vehicleId: 'v1',
    type: 'Troca de Óleo',
    description: 'Óleo sintético 5W30',
    status: 'Pendente',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    thresholdMileage: 50000,
  },
  {
    id: 'm2',
    vehicleId: 'v3',
    type: 'Revisão Motor',
    description: 'Correia dentada',
    status: 'Em Andamento',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    thresholdMileage: 120000,
  },
]

let mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Lucas Silva',
    parentName: 'Mariana Silva',
    parentPhone: '+55 11 98765-4321',
    routeId: 'r1',
    stopId: 'st1',
  },
  {
    id: 's2',
    name: 'Beatriz Costa',
    parentName: 'Roberto Costa',
    parentPhone: '+55 11 91234-5678',
    routeId: 'r1',
    stopId: 'st2',
  },
  {
    id: 's3',
    name: 'Enzo Gabriel',
    parentName: 'Fernanda Oliveira',
    parentPhone: '+55 21 99999-0000',
    routeId: 'r2',
    stopId: 'st3',
  },
]

let mockNotificationSettings: NotificationSetting[] = [
  {
    id: 'bus_approaching',
    eventName: 'Aproximação do Ponto',
    smsEnabled: true,
    whatsappEnabled: true,
  },
  {
    id: 'geofence_breach',
    eventName: 'Desvio de Rota Crítico',
    smsEnabled: true,
    whatsappEnabled: true,
  },
  {
    id: 'speeding',
    eventName: 'Excesso de Velocidade',
    smsEnabled: false,
    whatsappEnabled: false,
  },
  { id: 'route_delay', eventName: 'Atraso na Rota', smsEnabled: false, whatsappEnabled: true },
  {
    id: 'incident_reported',
    eventName: 'Incidente Reportado',
    smsEnabled: true,
    whatsappEnabled: true,
  },
]

let mockNotificationLogs: NotificationLog[] = [
  {
    id: 'log1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    channel: 'WhatsApp',
    recipientName: 'Mariana Silva',
    recipientPhone: '+55 11 98765-4321',
    eventName: 'Atraso na Rota',
    message:
      'Aviso: O ônibus da Rota Norte - Manhã está com um atraso estimado de 15 minutos devido ao trânsito.',
    status: 'Sent',
  },
  {
    id: 'log2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    channel: 'SMS',
    recipientName: 'Roberto Costa',
    recipientPhone: '+55 11 91234-5678',
    eventName: 'Aproximação do Ponto',
    message: 'O ônibus escolar chegará ao seu ponto em aproximadamente 5 minutos.',
    status: 'Sent',
  },
]

export const api = {
  users: {
    list: async () => {
      auditLog('LIST', 'User', {})
      await delay(500)
      return [...mockUsers]
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
  maintenance: {
    list: async () => {
      auditLog('LIST', 'Maintenance', {})
      await delay(400)
      return [...mockMaintenance]
    },
    add: async (task: Partial<MaintenanceTask>) => {
      auditLog('ADD', 'Maintenance', { task })
      await delay(500)
      const newTask = { id: Math.random().toString(), ...task } as MaintenanceTask
      mockMaintenance = [...mockMaintenance, newTask]
      return newTask
    },
  },
  students: {
    list: async () => {
      auditLog('LIST', 'Students', {})
      await delay(400)
      return [...mockStudents]
    },
    update: async (id: string, updates: Partial<Student>) => {
      auditLog('UPDATE', 'Students', { id, updates })
      await delay(500)
      mockStudents = mockStudents.map((s) => (s.id === id ? { ...s, ...updates } : s))
      return mockStudents.find((s) => s.id === id)
    },
  },
  notifications: {
    getSettings: async () => {
      auditLog('LIST', 'NotificationSettings', {})
      await delay(300)
      return [...mockNotificationSettings]
    },
    updateSetting: async (id: string, updates: Partial<NotificationSetting>) => {
      auditLog('UPDATE', 'NotificationSettings', { id, updates })
      await delay(300)
      mockNotificationSettings = mockNotificationSettings.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      )
      return mockNotificationSettings.find((s) => s.id === id)
    },
    getLogs: async () => {
      auditLog('LIST', 'NotificationLogs', {})
      await delay(400)
      return [...mockNotificationLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
    },
    sendExternal: (eventId: string, message: string, routeId?: string) => {
      // Processed asynchronously to ensure real-time tracking is not impacted
      setTimeout(() => {
        auditLog('SEND_EXTERNAL', 'Notifications', { eventId, message, routeId })
        const setting = mockNotificationSettings.find((s) => s.id === eventId)
        if (!setting || (!setting.smsEnabled && !setting.whatsappEnabled)) return

        const targetStudents = routeId
          ? mockStudents.filter((s) => s.routeId === routeId)
          : mockStudents

        targetStudents.forEach((student) => {
          if (setting.whatsappEnabled) {
            mockNotificationLogs.unshift({
              id: Math.random().toString(36).substring(7),
              timestamp: new Date().toISOString(),
              channel: 'WhatsApp',
              recipientName: student.parentName,
              recipientPhone: student.parentPhone,
              eventName: setting.eventName,
              message,
              status: Math.random() > 0.1 ? 'Sent' : 'Failed',
            })
          }
          if (setting.smsEnabled) {
            mockNotificationLogs.unshift({
              id: Math.random().toString(36).substring(7),
              timestamp: new Date().toISOString(),
              channel: 'SMS',
              recipientName: student.parentName,
              recipientPhone: student.parentPhone,
              eventName: setting.eventName,
              message,
              status: Math.random() > 0.1 ? 'Sent' : 'Failed',
            })
          }
        })
      }, 50)
    },
  },
}
