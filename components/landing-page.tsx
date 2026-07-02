"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  DollarSign,
  CheckCircle,
  Database,
  Lock,
  FileText,
  BarChart2,
  Sparkles,
  ChevronRight,
  Cpu,
  Globe,
  Settings,
  AlertCircle,
  FileSpreadsheet,
  UploadCloud,
  ArrowRight,
  TrendingDown,
  Layers,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Calculator,
  MessageSquare,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  onNavigateToAuth: (tab: "login" | "register") => void;
}

export function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  // ROI Calculator States
  const [faturamento, setFaturamento] = useState<number>(50000);
  const [taxaPerda, setTaxaPerda] = useState<number>(6); // 6% default loss/inefficiency
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Calculated ROI values
  const perdaMensal = faturamento * (taxaPerda / 100);
  const perdaAnual = perdaMensal * 12;
  const economiaEstimada = perdaAnual * 0.70; // STOCK.BI usually recovers 70% of overstock and loss

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const formattedCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth" id="landing-page-root">
      
      {/* Floating Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-50/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-neutral-900">
              STOCK<span className="text-emerald-600 font-extrabold">.BI</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono font-bold">
              IA Preditiva
            </span>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#problemas" className="hover:text-emerald-600 transition-all">Problemas Resolvidos</a>
            <a href="#beneficios" className="hover:text-emerald-600 transition-all">Benefícios</a>
            <a href="#roi" className="hover:text-emerald-600 transition-all">Calculadora de ROI</a>
            <a href="#funciona" className="hover:text-emerald-600 transition-all">Como Funciona</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToAuth("login")}
              className="text-sm font-semibold text-neutral-700 hover:text-emerald-600 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Entrar
            </button>
            <button
              onClick={() => onNavigateToAuth("register")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              Começar Grátis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/30 to-white pt-16 pb-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gestão de Estoque Preditiva Inteligente</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1]">
                A Inteligência Artificial que <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">elimina o desperdício</span> e maximiza o lucro do seu estoque
              </h1>
              
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl">
                Chega de dinheiro congelado em mercadoria parada ou vendas perdidas por falta de estoque. O <strong>STOCK.BI</strong> analisa suas vendas e histórico de 30 dias para prever o consumo ideal usando IA avançada.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigateToAuth("register")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 hover:shadow-emerald-500/30 text-center flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  Criar Minha Conta Grátis <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#roi"
                  className="px-6 py-4 bg-white border border-neutral-200 text-neutral-700 hover:text-emerald-600 hover:border-emerald-200 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Calculator className="w-4 h-4 text-emerald-500" /> Calcular Minha Economia
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-emerald-50 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-neutral-900">72 Horas</div>
                  <div className="text-[11px] text-neutral-500 font-medium">Teste Grátis Completo</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">Até 90%</div>
                  <div className="text-[11px] text-neutral-500 font-medium">Redução de Rupturas</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-neutral-900">Pix/Cartão</div>
                  <div className="text-[11px] text-neutral-500 font-medium">via Mercado Pago</div>
                </div>
              </div>
            </div>

            {/* Right Visual Dashboard Mockup (Predominantly white/green beautiful layout) */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-3xl -z-10"></div>
              
              <div className="bg-neutral-50 border border-emerald-100 rounded-3xl p-5 shadow-2xl space-y-4">
                {/* Simulated Header */}
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span className="text-[11px] text-neutral-400 font-mono ml-1">Painel Preditivo STOCK.BI</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">LIVE IA</span>
                </div>

                {/* Dashboard Metrics Widgets */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 border border-emerald-100 rounded-2xl shadow-sm space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Capital Liberado</span>
                    <span className="text-lg font-black text-emerald-600">R$ 8.430,00</span>
                    <span className="text-[9px] text-emerald-500 font-semibold block">↑ Estoque excedente evitado</span>
                  </div>
                  <div className="bg-white p-3.5 border border-emerald-100 rounded-2xl shadow-sm space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Ruptura Evitada</span>
                    <span className="text-lg font-black text-neutral-900">+34 Itens</span>
                    <span className="text-[9px] text-emerald-500 font-semibold block">↑ Compras feitas no tempo ideal</span>
                  </div>
                </div>

                {/* Simulated AI Alert */}
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Recomendação de Inteligência Artificial</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    &quot;O item <strong>Queijo Mozarela</strong> apresenta aumento de demanda de 18% nos fins de semana. Sugiro adiantar o pedido em 3 dias para evitar ruptura antes de sexta-feira.&quot;
                  </p>
                  <div className="flex justify-end pt-1">
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded cursor-pointer">
                      Aplicar Sugestão
                    </span>
                  </div>
                </div>

                {/* Real-time Sales Curve Simulation */}
                <div className="bg-white p-3.5 border border-emerald-100 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 font-mono">
                    <span>HISTÓRICO VS PREVISÃO (30d)</span>
                    <span className="text-emerald-600 font-bold">Margem +8.4%</span>
                  </div>
                  <div className="h-16 flex items-end gap-1 px-1 pt-2">
                    {[35, 45, 60, 40, 50, 75, 90, 85, 70, 95, 110, 130].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-100 hover:bg-emerald-500 rounded-t-sm transition-all relative group cursor-pointer" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[8px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all">
                          Dia {i+1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Problems We Solve Section */}
      <section className="py-20 bg-neutral-50 border-y border-emerald-50 px-4 sm:px-6 lg:px-8" id="problemas">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-100 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Desafios Operacionais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Os 4 maiores vilões da margem de lucro do seu negócio
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-2xl mx-auto">
            Sem processos inteligentes de BI, donos de restaurantes, mercados e comércios de alimentos perdem milhares de reais todos os meses de forma invisível.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 text-left">
            {/* Pain Card 1 */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm hover:border-rose-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 font-bold">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">1. Quebra de Caixa por Validade Vencida</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ingredientes perecíveis esquecidos no fundo da câmara fria ou prateleira que vencem antes de serem utilizados. Dinheiro direto para o lixo sem aviso prévio.
              </p>
            </div>

            {/* Pain Card 2 */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm hover:border-rose-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">2. Ruptura de Estoque (Falta de Mercadoria)</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                O cliente faz o pedido ou procura o item, mas você não tem o ingrediente. Você perde a venda na hora e compromete a experiência e a fidelidade do cliente.
              </p>
            </div>

            {/* Pain Card 3 */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm hover:border-rose-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">3. Capital de Giro Congelado em Prateleira</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Comprar dezenas de caixas a mais porque o fornecedor ofereceu desconto, deixando milhares de reais parados no estoque físico por meses, enquanto falta caixa para contas básicas.
              </p>
            </div>

            {/* Pain Card 4 */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm hover:border-rose-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">4. Horas e Mais Horas Perdidas em Planilhas</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Fazer contagem manual, digitar dados em tabelas lentas de Excel e tentar prever o consumo médio de cada ingrediente &quot;no olho&quot; sem nenhuma ferramenta estatística avançada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Benefits Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8" id="beneficios">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Benefícios da Plataforma</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            A solução completa para transformar seu estoque em lucro limpo
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-2xl mx-auto">
            Combinamos inteligência artificial avançada e processamento simplificado para entregar recomendações práticas e automáticas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            {/* Benefit Card 1 */}
            <div className="bg-neutral-50 border border-emerald-50 p-6 rounded-3xl space-y-3 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Previsão Inteligente com IA</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Nossa IA analisa o histórico de consumo real de 30 dias de cada produto, o ritmo diário e gera sugestões de pedidos sob medida para sua operação.
              </p>
            </div>

            {/* Benefit Card 2 */}
            <div className="bg-neutral-50 border border-emerald-50 p-6 rounded-3xl space-y-3 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Mapeamento Inteligente Excel</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Carregue qualquer planilha XLSX ou CSV de faturamento ou ERP. Nossa inteligência flexível detecta cabeçalhos automaticamente e sincroniza os dados sem complicação.
              </p>
            </div>

            {/* Benefit Card 3 */}
            <div className="bg-neutral-50 border border-emerald-50 p-6 rounded-3xl space-y-3 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Monitor de Alerta de Validades</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Monitore os lotes críticos com vencimento próximo. O sistema avisa com antecedência para você fazer promoções ou priorizar o consumo na produção.
              </p>
            </div>

            {/* Benefit Card 4 */}
            <div className="bg-neutral-50 border border-emerald-50 p-6 rounded-3xl space-y-3 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Múltiplas Fontes de Conexão</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Atualize seus dados inserindo valores manualmente pelo painel rápido, importando planilhas de faturamento ou simulando chamadas integradas de API do seu ERP atual.
              </p>
            </div>

            {/* Benefit Card 5 */}
            <div className="bg-neutral-50 border border-emerald-50 p-6 rounded-3xl space-y-3 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Calculadora de Receitas (Ficha Técnica)</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Cadastre seus pratos ou produtos compostos. Ao simular vendas, o sistema realiza a baixa automática dos ingredientes componentes correspondentes no estoque.
              </p>
            </div>

            {/* Benefit Card 6 */}
            <div className="bg-neutral-50 border border-emerald-50 p-6 rounded-3xl space-y-3 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Segurança & Sandbox Local</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Não solicitamos dados bancários ou cartões no período de teste gratuito. Seus dados cadastrados ficam salvos com segurança de forma isolada e privativa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section className="py-20 bg-neutral-50 border-y border-emerald-50 px-4 sm:px-6 lg:px-8 animate-fade-in" id="roi">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Calculadora de Viabilidade Financeira</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Quanto dinheiro você está deixando na mesa hoje?
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mx-auto">
              Simule o faturamento mensal do seu negócio e a taxa estimada de perda ou estoque ineficiente para visualizar o retorno financeiro com o STOCK.BI.
            </p>
          </div>

          {/* Interactive Calculator Container */}
          <div className="bg-white border border-emerald-100/80 rounded-3xl p-6 md:p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Left inputs */}
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-neutral-700">
                  <span>Faturamento Mensal do Negócio</span>
                  <span className="text-emerald-600 font-extrabold text-sm">{formattedCurrency(faturamento)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="5000"
                  value={faturamento}
                  onChange={(e) => setFaturamento(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-emerald-50 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>R$ 5.000</span>
                  <span>R$ 300.000+</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-neutral-700">
                  <span>Perda / Ineficiência de Estoque (%)</span>
                  <span className="text-rose-600 font-extrabold text-sm">{taxaPerda}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={taxaPerda}
                  onChange={(e) => setTaxaPerda(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-rose-50 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>2% (Excelente)</span>
                  <span>15% (Altas Perdas)</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Média de mercado brasileira:
                </h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  No segmento de varejo alimentar e restaurantes, as perdas por validade expirada, roubo, descarte e excesso de compra variam entre <strong>5% e 12% do faturamento total</strong>.
                </p>
              </div>
            </div>

            {/* Right calculated outputs */}
            <div className="bg-neutral-50 p-6 rounded-3xl border border-emerald-100 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block">Seu prejuízo anual atual</span>
                <span className="text-2xl font-black text-rose-500 font-mono">{formattedCurrency(perdaAnual)}</span>
                <span className="text-[10px] text-neutral-500 block">Perda estimada de {formattedCurrency(perdaMensal)}/mês</span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  Sua Economia com o STOCK.BI
                </span>
                <span className="text-3xl font-black text-emerald-600 font-mono block">{formattedCurrency(economiaEstimada)}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block bg-emerald-50 py-0.5 px-2 rounded inline-block">
                  Recuperação média de 70% das perdas
                </span>
              </div>

              <button
                onClick={() => onNavigateToAuth("register")}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Evitar Esse Prejuízo Agora <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8" id="funciona">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Como Funciona</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Gestão inteligente em 3 passos rápidos
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-xl mx-auto">
            Processo descomplicado feito sob medida para empresários ocupados. Você não precisa programar nada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 relative text-left">
            {/* Step 1 */}
            <div className="space-y-3.5 relative">
              <div className="absolute top-5 left-10 right-0 h-0.5 bg-emerald-100/60 hidden md:block -z-10"></div>
              <div className="w-10 h-10 rounded-2xl bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-neutral-900">Importe ou Conecte</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Insira seus níveis de estoque e histórico de vendas manualmente ou arraste uma planilha Excel gerada pelo seu sistema/ERP.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3.5 relative">
              <div className="absolute top-5 left-10 right-0 h-0.5 bg-emerald-100/60 hidden md:block -z-10"></div>
              <div className="w-10 h-10 rounded-2xl bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-neutral-900">A IA Inteligente Analisa</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Nossa IA processa o ritmo de consumo, projeta vendas futuras, cruza prazos de validade e avalia os custos unitários automaticamente.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3.5 relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/10">
                3
              </div>
              <h3 className="text-base font-bold text-neutral-900">Aja com Inteligência</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Veja a lista de compras sugerida com as quantidades ideais a comprar, alertas de produtos parados e insights de demanda direto no seu celular ou PC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Segment Grid */}
      <section className="py-16 bg-neutral-50 border-t border-emerald-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Perfeito para diversos segmentos do setor alimentar e comércio
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/60 shadow-sm text-center">
              <span className="text-2xl block mb-2">🍕</span>
              <span className="text-xs font-bold text-neutral-900 block">Pizzarias & Restaurantes</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/60 shadow-sm text-center">
              <span className="text-2xl block mb-2">🛒</span>
              <span className="text-xs font-bold text-neutral-900 block">Mercados & Varejos</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/60 shadow-sm text-center">
              <span className="text-2xl block mb-2">🍻</span>
              <span className="text-xs font-bold text-neutral-900 block">Distribuidoras de Bebidas</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/60 shadow-sm text-center">
              <span className="text-2xl block mb-2">🍓</span>
              <span className="text-xs font-bold text-neutral-900 block">Hortifrúti & Açougue</span>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Perguntas Frequentes</h2>
            <p className="text-xs text-neutral-500">Tudo o que você precisa saber sobre o STOCK.BI antes de começar.</p>
          </div>

          <div className="space-y-4 text-left">
            {[
              {
                q: "Como funciona o período de testes gratuito?",
                a: "Ao se cadastrar, você ganha 72 horas de acesso completo para testar com calma, conectar suas planilhas de faturamento ou inventário e rodar sua primeira análise preditiva com nossa Inteligência Artificial."
              },
              {
                q: "Como funciona a atualização de dados via Excel?",
                a: "É super simples! Você baixa nosso modelo de planilha padrão de 1 linha ou arrasta qualquer relatório em formato .xlsx ou .csv que você exporte do seu ERP/sistema atual. Nossa IA mapeia automaticamente os campos de ingrediente, estoque atual e custo."
              },
              {
                q: "Qual o valor após o período de teste e como assinar?",
                a: "A assinatura mensal custa apenas R$ 99,00 para ter acesso ilimitado. A integração de pagamento é feita de forma extremamente segura através do Mercado Pago, aceitando Pix ou Cartão de Crédito."
              },
              {
                q: "Posso cancelar a assinatura quando quiser?",
                a: "Sim! Não há taxas de fidelidade ou de cancelamento. Você pode assinar e gerenciar de forma rápida direto pelo link oficial de assinaturas do Mercado Pago."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-neutral-900 text-sm flex items-center justify-between cursor-pointer focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-emerald-600 text-lg">{activeFaq === idx ? "−" : "+"}</span>
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-500 leading-relaxed border-t border-neutral-200/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="bg-neutral-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STOCK.BI PREDICTIVE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Recupere o controle financeiro do seu estoque hoje mesmo
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Comece a tomar decisões de compras baseadas em dados e inteligência artificial preditiva de demanda. Pare de adivinhar compras e reduza descarte de ingredientes perecíveis.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigateToAuth("register")}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              Criar Conta e Começar a Usar <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToAuth("login")}
              className="px-8 py-4 bg-transparent border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white font-semibold text-sm rounded-2xl transition-all w-full sm:w-auto justify-center cursor-pointer"
            >
              Fazer Login na Minha Conta
            </button>
          </div>

          <p className="text-[10px] text-neutral-500 pt-2 font-mono">
            Acesso ilimitado e completo • Sem necessidade de cartão de crédito • Grátis por tempo indeterminado
          </p>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="bg-white border-t border-neutral-100 py-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-tight text-neutral-900">
              STOCK<span className="text-emerald-600 font-extrabold">.BI</span>
            </span>
          </div>

          <p>© 2026 SaaS STOCK.BI Inc. Todos os direitos reservados. Motor de Inteligência Artificial preditiva integrado.</p>

          <div className="flex gap-4">
            <span className="hover:text-emerald-600 transition-all cursor-pointer">Segurança</span>
            <span>•</span>
            <span className="hover:text-emerald-600 transition-all cursor-pointer">Termos do Serviço</span>
            <span>•</span>
            <span className="hover:text-emerald-600 transition-all cursor-pointer">Privacidade LGPD</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
