import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Plus } from 'lucide-react'

const mockRoles = [
  { id: 1, name: 'Administrador Global', desc: 'Acesso total ao sistema', perms: 24 },
  {
    id: 2,
    name: 'Coordenador de Frota',
    desc: 'Acesso a relatórios e cadastro de veículos',
    perms: 12,
  },
  { id: 3, name: 'Motorista', desc: 'Acesso limitado ao aplicativo móvel', perms: 3 },
]

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis e Permissões</h1>
          <p className="text-sm text-muted-foreground">Controle refinado de acessos (IAM).</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Criar Perfil
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockRoles.map((role) => (
          <Card
            key={role.id}
            className="relative overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {role.name}
              </CardTitle>
              <CardDescription>{role.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-4">
                <Badge variant="outline">{role.perms} permissões ativas</Badge>
                <Button variant="link" size="sm" className="px-0">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
