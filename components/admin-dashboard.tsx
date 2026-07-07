"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  UserCheck,
  Trash2,
  Plus,
  Search,
  Check,
  RefreshCw,
  X,
  CreditCard,
  Sparkles,
  Filter,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SCENARIOS } from "@/lib/scenarios";

interface AdminDashboardProps {
  currentUserEmail: string;
  currentUserRole: string;
  onUserDatabaseChange: () => void;
}

export function AdminDashboard({
  currentUserEmail,
  currentUserRole,
  onUserDatabaseChange
}: AdminDashboardProps) {
  const [users, setUsers] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
    }
    return [];
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Todos");
  const [subFilter, setSubFilter] = useState<string>("Todos");

  // New user form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Cliente");
  const [newIsPaid, setNewIsPaid] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Edit states for user roles
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [tempRole, setTempRole] = useState<string>("");

  const saveUsersList = (updatedList: any[]) => {
    localStorage.setItem("stock_bi_registered_users", JSON.stringify(updatedList));
    setUsers(updatedList);
    onUserDatabaseChange();
  };

  // KPI calculations
  const totalUsers = users.length;
  const activeSubs = users.filter((u) => u.isPaid).length;
  const totalAIQueries = users.reduce((acc, u) => acc + (u.aiAnalysisCount || 0), 0);
  const superUsersCount = users.filter((u) => u.role === "Super usuário").length;
  const adminsCount = users.filter((u) => u.role === "Administrador").length;
  const clientsCount = users.filter((u) => u.role === "Cliente" || !u.role).length;

  // Add new user handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    const emailClean = newEmail.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === emailClean);
    if (exists) {
      setFormError("Este e-mail já está cadastrado.");
      return;
    }

    // Assign a default client scenario template based on role
    const defaultClient = {
      ...JSON.parse(JSON.stringify(SCENARIOS.pizzaria)),
      id_cliente: `CLI-ADMIN-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      nome_fantasia: `${newName.split(" ")[0]}'s Business`,
      segmento: "Food Service / Restaurante",
      contato_compras: emailClean
    };

    const newUser = {
      name: newName.trim(),
      email: emailClean,
      passwordHash: newPassword,
      role: newRole,
      isPaid: newIsPaid,
      aiAnalysisCount: 0,
      createdAt: new Date().toISOString(),
      client: defaultClient
    };

    const updated = [...users, newUser];
    saveUsersList(updated);

    // Reset form
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("Cliente");
    setNewIsPaid(false);
    setFormSuccess("Usuário cadastrado com sucesso!");
    setTimeout(() => {
      setShowAddForm(false);
      setFormSuccess(null);
    }, 2000);
  };

  // Role modification helper
  const handleUpdateRole = (email: string, targetRole: string) => {
    // Validate hierarchy constraints
    // 1. Only Super usuário can promote/demote or modify a Super usuário role
    const targetUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!targetUser) return;

    if (targetUser.role === "Super usuário" && currentUserRole !== "Super usuário") {
      alert("Acesso Negado: Apenas Super Usuários podem alterar perfis de Super Usuários.");
      return;
    }
    if (targetRole === "Super usuário" && currentUserRole !== "Super usuário") {
      alert("Acesso Negado: Apenas Super Usuários podem promover usuários para Super Usuário.");
      return;
    }

    const updated = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, role: targetRole };
      }
      return u;
    });

    saveUsersList(updated);
    setEditingEmail(null);
  };

  // Toggle Subscription helper
  const handleToggleSubscription = (email: string) => {
    const updated = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isPaid: !u.isPaid };
      }
      return u;
    });
    saveUsersList(updated);
  };

  // Reset AI Counter
  const handleResetAICounter = (email: string) => {
    const updated = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, aiAnalysisCount: 0 };
      }
      return u;
    });
    saveUsersList(updated);
  };

  // Delete User
  const handleDeleteUser = (email: string) => {
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      alert("Erro: Você não pode excluir seu próprio usuário ativo.");
      return;
    }

    const targetUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!targetUser) return;

    if (targetUser.role === "Super usuário" && currentUserRole !== "Super usuário") {
      alert("Acesso Negado: Apenas Super Usuários podem excluir um Super Usuário.");
      return;
    }

    if (confirm(`Tem certeza que deseja excluir permanentemente o usuário ${targetUser.name} (${email})?`)) {
      const updated = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
      saveUsersList(updated);
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const userRole = u.role || "Cliente";
    const matchesRole = roleFilter === "Todos" || userRole === roleFilter;

    const matchesSub =
      subFilter === "Todos" ||
      (subFilter === "Ativo" && u.isPaid) ||
      (subFilter === "Inativo" && !u.isPaid);

    return matchesSearch && matchesRole && matchesSub;
  });

  return (
    <div className="space-y-8" id="admin-dashboard-container">
      {/* Intro section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="admin-header">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Painel Geral de Gestão de Assinaturas & Usuários
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gerenciamento corporativo do SaaS STOCK.BI. Ative planos premium, redefina limites e gerencie privilégios com controle de hierarquias.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          id="btn-toggle-add-user"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancelar Cadastro" : "Cadastrar Novo Usuário"}
        </button>
      </div>

      {/* Add New User Collapsible Panel */}
      {showAddForm && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl" id="add-user-panel">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Inserir Novo Usuário no Sistema
          </h3>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1.5">
                E-mail (Login)
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1.5">
                Senha Inicial
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 caracteres"
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1.5">
                Perfil (Role)
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Cliente">Cliente (Visualizador)</option>
                <option value="Administrador">Administrador</option>
                {currentUserRole === "Super usuário" && (
                  <option value="Super usuário">Super usuário</option>
                )}
              </select>
            </div>

            <div className="md:col-span-1 flex flex-col justify-end">
              <div className="flex items-center gap-3 h-full mb-2.5">
                <input
                  type="checkbox"
                  id="newIsPaid"
                  checked={newIsPaid}
                  onChange={(e) => setNewIsPaid(e.target.checked)}
                  className="w-4 h-4 bg-neutral-950 border-neutral-800 text-emerald-500 focus:ring-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="newIsPaid" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  Plano Premium Ativo (Paid)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-3 rounded-xl transition-all cursor-pointer"
              >
                Confirmar Cadastro
              </button>
            </div>
          </form>

          {formError && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-pulse">
              <CheckCircle className="w-4 h-4" /> {formSuccess}
            </div>
          )}
        </div>
      )}

      {/* KPI Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-kpis">
        <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/40">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalUsers}</div>
          <div className="text-xs text-neutral-400 mt-1">Usuários Registrados</div>
          <div className="text-[10px] text-neutral-500 mt-3 font-mono flex items-center gap-1.5 border-t border-neutral-850 pt-2">
            <span>{superUsersCount} Super</span>
            <span>•</span>
            <span>{adminsCount} Admin</span>
            <span>•</span>
            <span>{clientsCount} Clientes</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/40">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeSubs}</div>
          <div className="text-xs text-neutral-400 mt-1">Assinaturas Premium (Paid)</div>
          <div className="text-[10px] text-neutral-500 mt-3 font-mono flex items-center gap-1.5 border-t border-neutral-850 pt-2">
            <span className="text-emerald-400 font-semibold">
              {totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(0) : 0}% de Conversão
            </span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/40">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalAIQueries}</div>
          <div className="text-xs text-neutral-400 mt-1">Consultas de IA Executadas</div>
          <div className="text-[10px] text-neutral-500 mt-3 font-mono flex items-center gap-1.5 border-t border-neutral-850 pt-2">
            <span>Média de {(totalUsers > 0 ? totalAIQueries / totalUsers : 0).toFixed(1)} requisições por conta</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/40">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-emerald-400 font-mono truncate">{currentUserEmail}</div>
          <div className="text-xs text-neutral-400 mt-2">Seu Perfil Ativo</div>
          <div className="text-[10px] text-neutral-500 mt-3 font-mono flex items-center gap-1 border-t border-neutral-850 pt-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white font-bold">{currentUserRole}</span>
          </div>
        </div>
      </div>

      {/* Filter and search control bar */}
      <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl flex flex-col md:flex-row gap-3.5 justify-between items-center" id="admin-filters">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou e-mail..."
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400 font-medium">Perfil:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Todos">Todos os Perfis</option>
              <option value="Cliente">Cliente</option>
              <option value="Administrador">Administrador</option>
              <option value="Super usuário">Super usuário</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400 font-medium">Plano:</span>
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Todos">Todas as Assinaturas</option>
              <option value="Ativo">Ativo (Premium)</option>
              <option value="Inativo">Inativo (Trial/Cancelado)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl" id="admin-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-850 font-mono tracking-wider text-[10px] uppercase">
                <th className="p-4">Operador / Conta</th>
                <th className="p-4">Nível de Acesso (Role)</th>
                <th className="p-4">Status da Assinatura</th>
                <th className="p-4 text-center">Consultas IA (Limites)</th>
                <th className="p-4">Data de Cadastro</th>
                <th className="p-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 font-mono">
                    Nenhum usuário correspondente aos filtros foi encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userObj) => {
                  const isCurrentUser = userObj.email.toLowerCase() === currentUserEmail.toLowerCase();
                  const roleValue = userObj.role || "Cliente";
                  const isEditing = editingEmail === userObj.email;

                  return (
                    <tr key={userObj.email} className="hover:bg-neutral-900/40 transition-colors">
                      {/* Name and Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-emerald-400">
                            {userObj.name ? userObj.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {userObj.name || "Sem Nome"}
                              {isCurrentUser && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 border border-neutral-750 text-neutral-300 font-mono">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-neutral-400 text-[11px] font-mono mt-0.5">{userObj.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Access Role */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={tempRole}
                              onChange={(e) => setTempRole(e.target.value)}
                              className="bg-neutral-950 border border-neutral-850 text-white text-xs rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            >
                              <option value="Cliente">Cliente</option>
                              <option value="Administrador">Administrador</option>
                              {currentUserRole === "Super usuário" && (
                                <option value="Super usuário">Super usuário</option>
                              )}
                            </select>
                            <button
                              onClick={() => handleUpdateRole(userObj.email, tempRole)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                              title="Salvar perfil"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingEmail(null)}
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-all"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide font-mono flex items-center gap-1",
                                roleValue === "Super usuário"
                                  ? "bg-purple-950/60 text-purple-300 border border-purple-800/40"
                                  : roleValue === "Administrador"
                                  ? "bg-blue-950/60 text-blue-300 border border-blue-800/40"
                                  : "bg-neutral-950 text-neutral-400 border border-neutral-800"
                              )}
                            >
                              {roleValue === "Super usuário" && <Shield className="w-3 h-3 text-purple-400" />}
                              {roleValue === "Administrador" && <UserCheck className="w-3 h-3 text-blue-400" />}
                              {roleValue}
                            </span>

                            {/* Allow edit unless hierarchical constraints prevent it */}
                            {(!isCurrentUser || roleValue !== "Super usuário") && (
                              <button
                                onClick={() => {
                                  if (roleValue === "Super usuário" && currentUserRole !== "Super usuário") {
                                    alert("Erro: Apenas Super Usuários podem editar outros Super Usuários.");
                                    return;
                                  }
                                  setEditingEmail(userObj.email);
                                  setTempRole(roleValue);
                                }}
                                className="text-neutral-500 hover:text-emerald-400 text-[11px] underline transition-all ml-1 cursor-pointer"
                              >
                                Editar
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Subscription Status */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSubscription(userObj.email)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1",
                              userObj.isPaid
                                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60"
                                : "bg-neutral-950 text-neutral-500 border border-neutral-800 hover:border-red-900/40 hover:text-red-400"
                            )}
                            title="Clique para alternar o plano"
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", userObj.isPaid ? "bg-emerald-400 animate-pulse" : "bg-neutral-600")} />
                            {userObj.isPaid ? "Ativo (Premium)" : "Inativo (Trial)"}
                          </button>
                        </div>
                      </td>

                      {/* AI usage counts */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono font-bold text-white">{userObj.aiAnalysisCount || 0}</span>
                          <span className="text-neutral-600">/</span>
                          <span className="text-neutral-400 font-mono">∞</span>
                          <button
                            onClick={() => handleResetAICounter(userObj.email)}
                            className="p-1 text-neutral-500 hover:text-emerald-400 rounded hover:bg-neutral-850 transition-all"
                            title="Zerar contador de requisições de IA"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-neutral-400 font-mono text-[11px]">
                        {userObj.createdAt ? new Date(userObj.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        }) : "N/D"}
                      </td>

                      {/* Delete actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(userObj.email)}
                          disabled={isCurrentUser}
                          className={cn(
                            "p-2 rounded-xl transition-all border border-transparent",
                            isCurrentUser
                              ? "opacity-30 cursor-not-allowed text-neutral-600"
                              : "bg-red-950/20 hover:bg-red-950/60 border-red-900/10 hover:border-red-500/30 text-red-400 hover:text-red-300 cursor-pointer"
                          )}
                          title={isCurrentUser ? "Você não pode excluir seu próprio usuário" : "Excluir Usuário"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
