import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api, Student, Incident } from '@/lib/api'
import { Edit2, Search, Smartphone, ShieldAlert, Plus, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editPhone, setEditPhone] = useState('')

  // Incident Management State
  const [studentForIncidents, setStudentForIncidents] = useState<Student | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentForm, setIncidentForm] = useState<Partial<Incident>>({ severity: 'Baixa' })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    const data = await api.students.list()
    setStudents(data)
    setLoading(false)
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setEditPhone(student.parentPhone)
  }

  const handleSaveContact = async () => {
    if (!editingStudent) return
    try {
      const updated = await api.students.update(editingStudent.id, { parentPhone: editPhone })
      if (updated) {
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        toast.success('Contato atualizado.')
        setEditingStudent(null)
      }
    } catch (e) {
      toast.error('Erro ao atualizar.')
    }
  }

  const openIncidents = async (student: Student) => {
    setStudentForIncidents(student)
    setShowIncidentForm(false)
    const data = await api.students.getIncidents(student.id)
    setIncidents(data)
  }

  const handleSaveIncident = async () => {
    if (!incidentForm.description || !incidentForm.date || !studentForIncidents)
      return toast.error('Preencha os dados.')
    if (incidentForm.id) {
      await api.students.updateIncident(incidentForm.id, incidentForm)
      toast.success('Incidente atualizado.')
    } else {
      await api.students.addIncident({ ...incidentForm, studentId: studentForIncidents.id })
      toast.success('Incidente registrado.')
    }
    const data = await api.students.getIncidents(studentForIncidents.id)
    setIncidents(data)
    setShowIncidentForm(false)
    setIncidentForm({ severity: 'Baixa' })
  }

  const handleArchiveIncident = async (id: string) => {
    await api.students.updateIncident(id, { status: 'Arquivada' })
    toast.info('Incidente arquivado.')
    if (studentForIncidents) {
      const data = await api.students.getIncidents(studentForIncidents.id)
      setIncidents(data)
    }
  }

  const filtered = students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alunos e Ocorrências</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie alunos, contatos e o histórico de incidentes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Lista de Alunos</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.routeId}</Badge>
                    </TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" /> {student.parentPhone}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(student)}
                        title="Editar Contato"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openIncidents(student)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        title="Incidentes"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingStudent} onOpenChange={(o) => !o && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato - {editingStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Celular</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveContact}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!studentForIncidents} onOpenChange={(o) => !o && setStudentForIncidents(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Módulo de Incidentes - {studentForIncidents?.name}</DialogTitle>
            <DialogDescription>
              Gestão de ocorrências disciplinares ou de trânsito vinculadas a este aluno.
            </DialogDescription>
          </DialogHeader>

          {!showIncidentForm ? (
            <div className="space-y-4 py-2">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setIncidentForm({ severity: 'Baixa' })
                    setShowIncidentForm(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Novo Incidente
                </Button>
              </div>
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  Nenhum incidente registrado.
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className={`p-3 rounded-lg border ${inc.status === 'Arquivada' ? 'bg-slate-50 opacity-60' : 'bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 items-center">
                          <Badge
                            variant={
                              inc.severity === 'Alta'
                                ? 'destructive'
                                : inc.severity === 'Média'
                                  ? 'default'
                                  : 'secondary'
                            }
                            className={inc.severity === 'Média' ? 'bg-amber-500' : ''}
                          >
                            {inc.severity}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(inc.date).toLocaleString()}
                          </span>
                          {inc.status === 'Arquivada' && (
                            <Badge variant="outline" className="text-xs">
                              Arquivada
                            </Badge>
                          )}
                        </div>
                        {inc.status === 'Ativa' && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setIncidentForm(inc)
                                setShowIncidentForm(true)
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400"
                              onClick={() => handleArchiveIncident(inc.id)}
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">{inc.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Descrição da Ocorrência</Label>
                <Textarea
                  value={incidentForm.description || ''}
                  onChange={(e) =>
                    setIncidentForm({ ...incidentForm, description: e.target.value })
                  }
                  placeholder="Ex: Atraso recorrente, indisciplina..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gravidade</Label>
                  <Select
                    value={incidentForm.severity}
                    onValueChange={(v: any) => setIncidentForm({ ...incidentForm, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data e Hora</Label>
                  <Input
                    type="datetime-local"
                    value={incidentForm.date || ''}
                    onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowIncidentForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveIncident}>Salvar Registro</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
