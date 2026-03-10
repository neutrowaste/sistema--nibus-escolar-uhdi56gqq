import { useEffect } from 'react'
import { Bus, Shield, Map, Wrench, Wifi, Smartphone, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CommercialSummary() {
  useEffect(() => {
    // Automatically open print dialog after styles/fonts are likely loaded
    const timer = setTimeout(() => {
      window.print()
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 w-full print:bg-white flex flex-col items-center py-10 print:py-0 font-sans">
      {/* Action button visible only on screen to retry print or close */}
      <div className="print:hidden mb-6 flex gap-4">
        <Button onClick={() => window.print()} className="shadow-md">
          Imprimir / Salvar PDF
        </Button>
        <Button onClick={() => window.close()} variant="outline" className="shadow-sm">
          Fechar
        </Button>
      </div>

      <div className="max-w-[210mm] w-full bg-white print:shadow-none shadow-xl border border-slate-200 print:border-none p-10 md:p-16">
        {/* Header */}
        <header className="border-b-2 border-primary pb-8 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-lg print:bg-primary/10">
              <Bus className="h-8 w-8 text-white print:text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Sistema Ônibus Escolar
              </h1>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">
                Plataforma de Gestão Integrada
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">Resumo Comercial</p>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </header>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Visão Geral do Sistema
          </h2>
          <p className="text-slate-700 leading-relaxed text-lg text-justify">
            O <strong>Sistema Ônibus Escolar</strong> é uma solução tecnológica robusta e
            inteligente desenvolvida para modernizar a gestão de frotas e garantir a máxima
            segurança no transporte de alunos. Através de um ecossistema em nuvem, a plataforma
            centraliza a operação diária, combinando monitoramento em tempo real, comunicação
            proativa e ferramentas operacionais avançadas para tomada de decisão ágil e precisa.
          </p>
        </section>

        {/* Grid of Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Gestão de Frota e Manutenção
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Documentação e Compliance:</strong> Controle rigoroso e alertas
                  automáticos para vencimentos de CNH dos motoristas, seguros e alvarás municipais.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Manutenção Preventiva:</strong> Agendamento e tracking de ordens de
                  serviço (ex.: troca de óleo, vistorias) baseados na rodagem e telemetria.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Map className="h-5 w-5 text-blue-600" />
              Excelência Operacional
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Cockpit e Rastreamento Ao Vivo:</strong> Painel de controle consolidado
                  para acompanhamento em tempo real do progresso das viagens.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Geofencing:</strong> Delimitação de áreas seguras e disparo de eventos
                  automáticos ao entrar ou sair de rotas e pontos de parada predefinidos.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              Experiência e Comunicação
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Portal dos Responsáveis (PWA):</strong> Aplicativo web otimizado para que
                  familiares acompanhem o status de embarque e desembarque do aluno.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Motor Omnichannel:</strong> Integração nativa com WhatsApp e SMS para
                  alertas imediatos, como veículo se aproximando e imprevistos de rota.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Wifi className="h-5 w-5 text-blue-600" />
              Arquitetura Avançada
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Capacidade Offline-First:</strong> O sistema enfileira telemetria
                  localmente em áreas sem sinal de internet, sincronizando sem perdas de dados.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">
                  <strong>Relatórios e Exportações:</strong> Geração de dados operacionais e de
                  faturamento consolidados nos formatos PDF e CSV.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer / Conclusion */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 print:bg-slate-50 print:border-none print:-mx-4 print:px-10 mt-12">
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            Compromisso com o Futuro e Segurança
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            A plataforma foi desenhada com escalabilidade em mente, possuindo suporte nativo e
            preparação para módulos inovadores como a <strong>Biometria Facial</strong>, assegurando
            precisão absoluta na validação da identidade no momento do embarque. Nosso compromisso
            contínuo é entregar paz de espírito aos responsáveis, e máxima eficiência financeira e
            logística aos operadores e escolas.
          </p>
        </div>

        <div className="mt-16 text-center text-slate-400 text-xs border-t pt-6">
          Documento gerado automaticamente pela Plataforma Sistema Ônibus Escolar &copy;{' '}
          {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
