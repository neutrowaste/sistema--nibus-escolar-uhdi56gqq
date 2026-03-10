import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bus } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsParent = async () => {
    setIsLoading(true)
    try {
      await login('parent@escola.pt', '123456')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 flex flex-col items-center animate-fade-in">
        <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Bus className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 text-center">Sistema Ônibus Escolar</h1>
        <p className="text-slate-500 mt-2 text-center">Plataforma de Gestão de Frotas e Pais</p>
      </div>

      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Acessar Conta</CardTitle>
          <CardDescription className="text-center">
            Insira suas credenciais para acessar o portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@escola.pt"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">PWA & Portal Externo</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={loginAsParent}
            disabled={isLoading}
          >
            Acessar Portal do Responsável (Simulação)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
