"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  User,
  Building,
  Briefcase,
  AlertCircle,
  Cpu,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SCENARIOS, ClientScenario } from "@/lib/scenarios";

interface AuthScreensProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (
    name: string,
    email: string,
    pass: string,
    businessName: string,
    segment: string,
    templateKey: string
  ) => Promise<{ success: boolean; error?: string }>;
  initialTab?: "login" | "register";
  onBackToLanding?: () => void;
}

export function AuthScreens({ onLogin, onRegister, initialTab = "login", onBackToLanding }: AuthScreensProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [segment, setSegment] = useState<string>("Food Service / Restaurante");
  const [showCustomSegment, setShowCustomSegment] = useState<boolean>(false);
  const [customSegmentName, setCustomSegmentName] = useState<string>("");
  const [templateKey, setTemplateKey] = useState<string>("pizzaria");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onLogin(email, password);
      if (!res.success) {
        setErrorMsg(res.error || "E-mail ou senha inválidos.");
      } else {
        setSuccessMsg("Acesso autorizado! Redirecionando...");
      }
    } catch (err: any) {
      setErrorMsg("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name || !email || !password || !confirmPassword || !businessName) {
      setErrorMsg("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onRegister(name, email, password, businessName, segment, templateKey);
      if (!res.success) {
        setErrorMsg(res.error || "Ocorreu um erro no cadastro.");
      } else {
        setSuccessMsg("Usuário cadastrado com sucesso! Iniciando sua sessão...");
      }
    } catch (err: any) {
      setErrorMsg("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-neutral-950">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-700/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 -z-10"></div>

      {/* Main Card Container */}
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10" id="auth-main-card">
        {onBackToLanding && (
          <div className="flex justify-start mb-4">
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-all font-semibold font-mono cursor-pointer"
            >
              ← Voltar ao Início (Apresentação)
            </button>
          </div>
        )}
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-emerald-950 border border-emerald-800/60 p-3.5 rounded-2xl mb-4 text-emerald-400 shadow-inner">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            STOCK.BI <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-mono">SaaS</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1.5">Controle de Estoque Inteligente e BI Preditivo</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-neutral-950 border border-neutral-800/80 p-1.5 rounded-2xl mb-6">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === "login"
                ? "bg-neutral-800 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            )}
            id="tab-btn-login"
          >
            Acessar Conta
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === "register"
                ? "bg-neutral-800 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            )}
            id="tab-btn-register"
          >
            Cadastrar Novo
          </button>
        </div>

        {/* Action Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-950/40 border border-rose-900/50 rounded-2xl p-4 mb-5 text-rose-300 text-xs flex items-start gap-3"
              id="auth-error-alert"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold">Atenção</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-950/40 border border-emerald-900/50 rounded-2xl p-4 mb-5 text-emerald-300 text-xs flex items-start gap-3"
              id="auth-success-alert"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Sucesso</p>
                <p className="mt-0.5 leading-relaxed">{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms Rendering */}
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4"
              id="login-form"
            >
              {/* Email */}
              <div>
                <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">E-mail Corporativo</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-neutral-400 font-semibold font-mono uppercase tracking-wider">Senha Secreta</label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                id="btn-login-submit"
              >
                Acessar Painel <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-4 max-h-[480px] overflow-y-auto pr-1"
              id="register-form"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Operator Name */}
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">Seu Nome</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">E-mail</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="contato@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Mín. 6 dígitos"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">Confirme a Senha</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Business Identity */}
              <div className="border-t border-neutral-800/80 pt-4 mt-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-widest mb-3">Identidade do Estabelecimento</h3>
                
                <div className="space-y-4">
                  {/* Name Fantasia */}
                  <div>
                    <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">Nome Fantasia do Negócio</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                        <Building className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pizzaria Sabor Supremo"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Segment and Template Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">Segmento do Negócio</label>
                      <select
                        value={showCustomSegment ? "NEW_SEGMENT_TRIGGER" : segment}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "NEW_SEGMENT_TRIGGER") {
                            setShowCustomSegment(true);
                          } else {
                            setShowCustomSegment(false);
                            setSegment(val);
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 px-3.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="Food Service / Restaurante">Restaurante / Pizzaria</option>
                        <option value="Varejo Alimentar">Mercado / Varejo</option>
                        <option value="Distribuidora de Bebidas">Distribuidora de Bebidas</option>
                        <option value="Hortifrúti / Açougue">Hortifrúti / Açougue</option>
                        <option value="NEW_SEGMENT_TRIGGER" className="text-emerald-400 font-semibold">+ Cadastrar Novo Segmento...</option>
                      </select>

                      {showCustomSegment && (
                        <div className="mt-2 flex gap-2 animate-fadeIn" id="new-segment-auth-container">
                          <input
                            type="text"
                            placeholder="Nome do segmento"
                            value={customSegmentName}
                            onChange={(e) => {
                              setCustomSegmentName(e.target.value);
                              setSegment(e.target.value);
                            }}
                            className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            id="input-auth-new-segment"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customSegmentName.trim()) {
                                setSegment(customSegmentName.trim());
                              }
                              setShowCustomSegment(false);
                            }}
                            className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            OK
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 font-semibold block mb-1.5 font-mono uppercase tracking-wider">Template Inicial</label>
                      <select
                        value={templateKey}
                        onChange={(e) => setTemplateKey(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 px-3.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                      >
                        {Object.entries(SCENARIOS).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value.nome_fantasia} ({value.segmento.split("/")[0].trim()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                id="btn-register-submit"
              >
                Cadastrar e Acessar <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center mt-6 text-xs text-neutral-500 font-mono space-y-2">
        <div>Ambiente 100% Seguro • Seus dados corporativos são isolados e protegidos de forma segura</div>
        <div>
          <button
            onClick={() => {
              if (confirm("Tem certeza que deseja limpar todos os dados cadastrados? Esta ação é irreversível.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-neutral-600 hover:text-red-400 underline transition-all text-[11px] cursor-pointer"
            id="btn-clear-data-auth"
          >
            Limpar todos os dados cadastrados (Reset)
          </button>
        </div>
      </div>
    </div>
  );
}
