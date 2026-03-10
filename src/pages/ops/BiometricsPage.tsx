import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScanFace, UploadCloud, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function BiometricsPage() {
  const [studentId, setStudentId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle')
  const [result, setResult] = useState<{ match: boolean; conf: number } | null>(null)

  const handleProcess = async () => {
    if (!studentId || !file) {
      toast.error('Preencha os dados e selecione a foto.')
      return
    }
    try {
      setStatus('uploading')
      const { uploadUrl } = await api.biometrics.requestPresignedUrl(studentId, file.name)
      setStatus('processing')
      const res = await api.biometrics.processImage(uploadUrl)
      setStatus('done')
      setResult({ match: res.status === 'MATCH', conf: res.confidence })
      toast.success('Validação concluída com sucesso.')
    } catch (e) {
      setStatus('idle')
      toast.error('Erro no pipeline biométrico.')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline Biométrico</h1>
        <p className="text-sm text-muted-foreground">
          Upload seguro e processamento de face-match de estudantes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanFace className="w-5 h-5" /> Verificação Avulsa
          </CardTitle>
          <CardDescription>
            Obtém uma URL pre-assinada (S3) e executa o processamento assíncrono.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID do Estudante</Label>
              <Input
                placeholder="Ex: STD-84729"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={status !== 'idle'}
              />
            </div>
            <div className="space-y-2">
              <Label>Foto do Estudante</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  id="photo-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={status !== 'idle'}
                />
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center cursor-pointer w-full"
                >
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">
                    {file ? file.name : 'Clique para selecionar uma imagem'}
                  </span>
                </label>
              </div>
            </div>
            <Button className="w-full" onClick={handleProcess} disabled={status !== 'idle'}>
              {status === 'idle' ? 'Iniciar Processamento' : 'Processando...'}
            </Button>
          </div>

          {status !== 'idle' && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-3 border">
              <div className="flex items-center gap-3 text-sm">
                {status === 'uploading' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                <span className={status === 'uploading' ? 'font-medium' : 'text-slate-500'}>
                  1. Solicitando URL Pre-assinada & Upload (S3)
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {status === 'processing' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                )}
                <span
                  className={
                    status === 'processing'
                      ? 'font-medium'
                      : status === 'done'
                        ? 'text-slate-500'
                        : 'text-slate-400'
                  }
                >
                  2. Processamento Face-Match (Assíncrono)
                </span>
              </div>
            </div>
          )}

          {status === 'done' && result && (
            <div
              className={`p-4 rounded-lg flex items-start gap-4 ${result.match ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}
            >
              {result.match ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
              )}
              <div>
                <h4
                  className={`font-semibold ${result.match ? 'text-emerald-800' : 'text-red-800'}`}
                >
                  {result.match ? 'Face-Match Confirmado' : 'Divergência Biométrica Detectada'}
                </h4>
                <p className={`text-sm mt-1 ${result.match ? 'text-emerald-700' : 'text-red-700'}`}>
                  Nível de confiança: <strong>{(result.conf * 100).toFixed(1)}%</strong>
                </p>
                {!result.match && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-200 text-red-700 hover:bg-red-100 bg-white"
                  >
                    Sinalizar para Auditoria
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
