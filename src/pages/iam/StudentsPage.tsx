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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api, Student } from '@/lib/api'
import { Edit2, Search, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editPhone, setEditPhone] = useState('')
  const [editParentName, setEditParentName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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
    setEditParentName(student.parentName)
  }

  const handleSave = async () => {
    if (!editingStudent) return
    setIsSaving(true)
    try {
      const updated = await api.students.update(editingStudent.id, {
        parentPhone: editPhone,
        parentName: editParentName,
      })
      if (updated) {
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        toast.success('Contatos do responsável atualizados com sucesso.')
        setEditingStudent(null)
      }
    } catch (e) {
      toast.error('Erro ao atualizar os contatos.')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alunos e Responsáveis</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie o cadastro de alunos e vincule telefones para notificações externas.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Alunos</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar aluno ou responsável..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Rota Vinculada</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Celular (WhatsApp/SMS)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {student.routeId === 'r1'
                          ? 'Rota Norte - Manhã'
                          : student.routeId === 'r2'
                            ? 'Rota Sul - Tarde'
                            : student.routeId}
                      </span>
                    </TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        {student.parentPhone}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum aluno encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato do Responsável</DialogTitle>
            <DialogDescription>
              Atualize as informações de contato para garantir a entrega de notificações externas
              para {editingStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">Nome do Responsável</Label>
              <Input
                id="parentName"
                value={editParentName}
                onChange={(e) => setEditParentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Celular (com DDD e DDI)</Label>
              <Input
                id="parentPhone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
