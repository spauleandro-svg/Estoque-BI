"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  ShoppingCart,
  Tag,
  AlertTriangle,
  Calendar,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Play,
  Send,
  Database,
  Lock,
  Plus,
  Trash2,
  FileText,
  BarChart2,
  Sparkles,
  ChevronRight,
  User,
  Mail,
  FileSignature,
  Cpu,
  Info,
  AlertOctagon,
  Globe,
  Key,
  Plug,
  Settings,
  AlertCircle,
  Code,
  Cloud,
  Check,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CreditCard,
  Clock
} from "lucide-react";
import { SCENARIOS, ClientScenario, StockItem, SalesHistory, ExpirationAlert, Recipe } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import { AuthScreens } from "@/components/auth-screens";
import { LandingPage } from "@/components/landing-page";

export default function Dashboard() {
  // --- USER AUTHENTICATION & MULTI-TENANCY STATES ---
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [userRecord, setUserRecord] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [dbSaving, setDbSaving] = useState<boolean>(false);
  const [dbSaveSuccess, setDbSaveSuccess] = useState<string | null>(null);

  // --- MERCADO PAGO & PAYWALL STATES ---
  const [stripeSuccessModal, setStripeSuccessModal] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loadUserRecord = (email: string) => {
    const allUsers = JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
    const found = allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      let changed = false;
      if (!found.createdAt) {
        found.createdAt = new Date().toISOString();
        changed = true;
      }
      if (found.isPaid === undefined) {
        found.isPaid = false;
        changed = true;
      }
      if (found.aiAnalysisCount === undefined) {
        found.aiAnalysisCount = 0;
        changed = true;
      }
      if (changed) {
        const updatedUsers = allUsers.map((u: any) => u.email.toLowerCase() === email.toLowerCase() ? found : u);
        localStorage.setItem("stock_bi_registered_users", JSON.stringify(updatedUsers));
      }
      setUserRecord(found);
    }
  };

  const updateFullUserRecord = (email: string, updates: Partial<any>) => {
    const allUsers = JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
    const updatedUsers = allUsers.map((u: any) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, ...updates };
      }
      return u;
    });
    localStorage.setItem("stock_bi_registered_users", JSON.stringify(updatedUsers));
    
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      const activeRecord = updatedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      setUserRecord(activeRecord);
    }
  };

  useEffect(() => {
    // 1. Seed default accounts if empty
    const storedUsers = localStorage.getItem("stock_bi_registered_users");
    if (!storedUsers) {
      const defaultUsers = [
        {
          name: "Paulo Leandro",
          email: "pauleandronunes@gmail.com",
          passwordHash: "123456",
          createdAt: new Date().toISOString(),
          isPaid: false,
          aiAnalysisCount: 0,
          client: {
            ...JSON.parse(JSON.stringify(SCENARIOS.pizzaria)),
            nome_fantasia: "Pizzaria do Paulo",
            id_cliente: "CLI-PAULO-99"
          }
        }
      ];
      localStorage.setItem("stock_bi_registered_users", JSON.stringify(defaultUsers));
    }

    // 2. Check Mercado Pago redirect parameters in URL
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get("payment_status") || urlParams.get("status") || urlParams.get("collection_status");
      const sessionId = urlParams.get("session_id") || urlParams.get("preference_id");
      if ((status === "success" || status === "approved") && sessionId) {
        const activeUserStr = localStorage.getItem("stock_bi_active_user");
        if (activeUserStr) {
          const parsedUser = JSON.parse(activeUserStr);
          const allUsers = JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
          const updatedUsers = allUsers.map((u: any) => {
            if (u.email.toLowerCase() === parsedUser.email.toLowerCase()) {
              return { ...u, isPaid: true };
            }
            return u;
          });
          localStorage.setItem("stock_bi_registered_users", JSON.stringify(updatedUsers));
          
          // Clear query parameters from URL so they don't trigger again on reload
          window.history.replaceState({}, document.title, window.location.pathname);
          setStripeSuccessModal(true);
        }
      }
    }

    // 3. Load active session
    const activeUser = localStorage.getItem("stock_bi_active_user");
    if (activeUser) {
      const parsedUser = JSON.parse(activeUser);
      setUser({ name: parsedUser.name, email: parsedUser.email });
      loadUserRecord(parsedUser.email);
      
      // Load user-specific client
      const allUsers = JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
      const userRecord = allUsers.find((u: any) => u.email.toLowerCase() === parsedUser.email.toLowerCase());
      if (userRecord && userRecord.client) {
        setCurrentScenario(userRecord.client);
        setSelectedKey("custom");
      }
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = (email: string, pass: string) => {
    const allUsers = JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
    const found = allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!found) {
      return { success: false, error: "Usuário não cadastrado." };
    }
    if (found.passwordHash !== pass) {
      return { success: false, error: "Senha incorreta." };
    }

    localStorage.setItem("stock_bi_active_user", JSON.stringify({ name: found.name, email: found.email }));
    setUser({ name: found.name, email: found.email });
    loadUserRecord(found.email);
    
    if (found.client) {
      setCurrentScenario(found.client);
      setSelectedKey("custom");
    }

    return { success: true };
  };

  const handleRegister = (
    name: string,
    email: string,
    pass: string,
    businessName: string,
    segment: string,
    templateKey: string
  ) => {
    const allUsers = JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
    const exists = allUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return { success: false, error: "Este e-mail já está cadastrado." };
    }

    const baseTemplate = SCENARIOS[templateKey] || SCENARIOS.pizzaria;
    const userClient: ClientScenario = {
      ...JSON.parse(JSON.stringify(baseTemplate)),
      id_cliente: `CLI-${name.split(" ")[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      nome_fantasia: businessName,
      segmento: segment,
      contato_compras: email
    };

    const newUser = {
      name,
      email,
      passwordHash: pass,
      createdAt: new Date().toISOString(),
      isPaid: false,
      aiAnalysisCount: 0,
      client: userClient
    };

    const updatedUsers = [...allUsers, newUser];
    localStorage.setItem("stock_bi_registered_users", JSON.stringify(updatedUsers));
    localStorage.setItem("stock_bi_active_user", JSON.stringify({ name, email }));
    
    setUser({ name, email });
    loadUserRecord(email);
    setCurrentScenario(userClient);
    setSelectedKey("custom");

    return { success: true };
  };

  const handleLogout = () => {
    localStorage.removeItem("stock_bi_active_user");
    setUser(null);
    setUserRecord(null);
    setSelectedKey("pizzaria");
    setCurrentScenario(SCENARIOS.pizzaria);
  };

  const handleSaveActiveClient = () => {
    if (!user) return;
    setDbSaving(true);
    setDbSaveSuccess(null);
    
    try {
      const allUsers = JSON.parse(localStorage.getItem("stock_bi_registered_users") || "[]");
      const updated = allUsers.map((u: any) => {
        if (u.email.toLowerCase() === user.email.toLowerCase()) {
          return { ...u, client: currentScenario };
        }
        return u;
      });
      
      localStorage.setItem("stock_bi_registered_users", JSON.stringify(updated));
      setDbSaveSuccess("Dados salvos no seu sandbox corporativo!");
      setTimeout(() => setDbSaveSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setDbSaving(false);
    }
  };

  // Scenario selector and loaded state
  const [selectedKey, setSelectedKey] = useState<string>("pizzaria");
  const [currentScenario, setCurrentScenario] = useState<ClientScenario>(SCENARIOS.pizzaria);
  const [jsonString, setJsonString] = useState<string>("");
  const [inputMode, setInputMode] = useState<"tables" | "json" | "api" | "excel">("tables");

  // API Sync configuration states
  const [apiUrl, setApiUrl] = useState<string>("/api/mock-erp");
  const [apiMethod, setApiMethod] = useState<"GET" | "POST">("GET");
  const [apiHeaders, setApiHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: "Authorization", value: "Bearer sim-token-12345" },
    { key: "Accept", value: "application/json" }
  ]);
  const [apiBody, setApiBody] = useState<string>("{\n  \"filial\": \"01\"\n}");
  const [apiIsLoading, setApiIsLoading] = useState<boolean>(false);
  const [apiRawResponse, setApiRawResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiIsMapping, setApiIsMapping] = useState<boolean>(false);
  const [apiSuccessMessage, setApiSuccessMessage] = useState<string | null>(null);

  // Excel integration states
  const [excelSelectedTable, setExcelSelectedTable] = useState<"estoque" | "vendas" | "validade">("estoque");
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelSuccess, setExcelSuccess] = useState<string | null>(null);
  const [excelRows, setExcelRows] = useState<Array<any>>([]);
  const [excelMergeMode, setExcelMergeMode] = useState<"merge" | "replace">("merge");
  const [excelFileName, setExcelFileName] = useState<string | null>(null);

  // Live editing helpers for stock table
  const [activeTab, setActiveTab] = useState<"estoque" | "vendas" | "validade" | "fichas">("estoque");

  // App running states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Output insights dashboard state
  const [activeInsightTab, setActiveInsightTab] = useState<"compras" | "promocoes" | "chat">("compras");

  // Email draft / Action simulation modal states
  const [modalType, setModalType] = useState<"purchase_email" | "promo_activation" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [simulationStatus, setSimulationStatus] = useState<string>("");

  // Chat integration states
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      sender: "bot",
      text: "Olá! Sou o seu Analista Virtual de Compras e Suprimentos. Posso ajudar você a refinar os insights acima, planejar promoções ou negociar com fornecedores. Pergunte-me qualquer coisa!"
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Sync state to JSON string whenever scenario changes
  useEffect(() => {
    if (inputMode !== "json") {
      setJsonString(JSON.stringify(currentScenario, null, 2));
    }
  }, [currentScenario, inputMode]);

  // Handle template selection change
  const handleScenarioChange = (key: string) => {
    setSelectedKey(key);
    if (key === "custom") {
      setInputMode("json");
    } else {
      setInputMode("tables");
      setCurrentScenario(JSON.parse(JSON.stringify(SCENARIOS[key]))); // Deep clone
      setError(null);
    }
  };

  // Helper functions for headers management
  const addHeaderRow = () => {
    setApiHeaders([...apiHeaders, { key: "", value: "" }]);
  };

  const removeHeaderRow = (index: number) => {
    setApiHeaders(apiHeaders.filter((_, i) => i !== index));
  };

  const updateHeaderRow = (index: number, field: "key" | "value", value: string) => {
    const updated = apiHeaders.map((hdr, i) => {
      if (i === index) {
        return { ...hdr, [field]: value };
      }
      return hdr;
    });
    setApiHeaders(updated);
  };

  // Excel File Parsing & Normalization Handler
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelError(null);
    setExcelSuccess(null);
    setExcelRows([]);
    setExcelFileName(null);

    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const XLSX = await import("xlsx");
        // Read file using XLSX
        const workbook = XLSX.read(bstr, { type: "binary", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          throw new Error("A planilha está vazia ou não pôde ser lida.");
        }

        setExcelRows(rawJson);
      } catch (err: any) {
        setExcelError(err.message || "Erro ao ler o arquivo Excel.");
      }
    };

    reader.onerror = () => {
      setExcelError("Erro ao ler o arquivo.");
    };

    reader.readAsBinaryString(file);
  };

  // Export active table or prediction analysis to XLSX
  const handleExportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      if (inputMode === "tables") {
        if (activeTab === "estoque") {
          const dataToExport = currentScenario.niveis_estoque.map(item => ({
            "ID do Item": item.id,
            "Nome do Item": item.nome,
            "Estoque Atual": item.estoque_atual,
            "Unidade de Medida": item.unidade,
            "Custo Unitário (R$)": item.custo_unitario,
            "Data de Validade": item.data_validade || "N/A"
          }));
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Níveis de Estoque");
          XLSX.writeFile(wb, `estoque_${currentScenario.id_cliente.toLowerCase()}.xlsx`);
        } else if (activeTab === "vendas") {
          const dataToExport = currentScenario.historico_vendas.map(item => ({
            "ID do Produto": item.produto_id,
            "Nome do Produto": item.nome,
            "Quantidade Vendida (30 Dias)": item.quantidade_vendida_30_dias,
            "Média Diária de Vendas": item.media_diaria,
            "Fator Sazonal FDS": item.vendas_sazonal_fim_de_semana_fator
          }));
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Histórico de Vendas");
          XLSX.writeFile(wb, `vendas_${currentScenario.id_cliente.toLowerCase()}.xlsx`);
        } else if (activeTab === "validade") {
          const dataToExport = currentScenario.alertas_validade.map(item => ({
            "Nome do Item": item.nome,
            "Lote": item.lote,
            "Quantidade Afetada": item.quantidade_afetada,
            "Data de Vencimento": item.data_vencimento
          }));
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Alertas de Validade");
          XLSX.writeFile(wb, `validade_${currentScenario.id_cliente.toLowerCase()}.xlsx`);
        } else if (activeTab === "fichas") {
          const dataToExport: any[] = [];
          currentScenario.fichas_tecnicas?.forEach(recipe => {
            recipe.ingredientes.forEach(ing => {
              const matchedItem = currentScenario.niveis_estoque.find(i => i.id === ing.produto_id);
              dataToExport.push({
                "ID da Ficha": recipe.id,
                "Nome do Prato": recipe.nome_prato,
                "ID do Ingrediente": ing.produto_id,
                "Nome do Ingrediente": matchedItem ? matchedItem.nome : ing.produto_id,
                "Quantidade Necessária": ing.quantidade,
                "Unidade": matchedItem ? matchedItem.unidade : ""
              });
            });
          });
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Fichas Técnicas");
          XLSX.writeFile(wb, `fichas_tecnicas_${currentScenario.id_cliente.toLowerCase()}.xlsx`);
        }
      } else if (results) {
        if (activeInsightTab === "compras") {
          const dataToExport = results.insights_compras?.map((item: any) => ({
            "ID do Produto": item.produto_id,
            "Nome do Produto": item.nome,
            "Urgência": item.urgencia,
            "Estoque Atual": item.estoque_atual,
            "Ritmo de Vendas Diário": item.ritmo_vendas_diario,
            "Dias para Ruptura": item.dias_para_ruptura,
            "Quantidade Recomendada": item.quantidade_recomendada,
            "Custo Estimado (R$)": item.custo_estimado,
            "Justificativa": item.justificativa
          })) || [];
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Recomendações de Compra");
          XLSX.writeFile(wb, `recomendacoes_compras_${results.id_cliente?.toLowerCase()}.xlsx`);
        } else if (activeInsightTab === "promocoes") {
          const dataToExport = results.insights_promocoes?.map((item: any) => ({
            "ID do Produto": item.produto_id,
            "Nome do Produto": item.nome,
            "Motivo do Risco": item.motivo_risco,
            "Estratégia Sugerida": item.estrategia_sugerida,
            "Detalhes da Campanha": item.detalhes_campanha,
            "Retorno Esperado Estimado (R$)": item.retorno_esperado_estimado,
            "Markup Ajustado": item.markup_ajustado
          })) || [];
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Campanhas e Promoções");
          XLSX.writeFile(wb, `campanhas_promocoes_${results.id_cliente?.toLowerCase()}.xlsx`);
        }
      }
    } catch (err) {
      console.error("Erro ao exportar Excel:", err);
    }
  };

  // Apply parsed Excel rows to the current scenario
  const applyExcelImport = () => {
    try {
      if (excelRows.length === 0) {
        throw new Error("Nenhum dado carregado para aplicar.");
      }

      const parseNum = (val: any, defaultVal = 0) => {
        if (val === undefined || val === null) return defaultVal;
        if (typeof val === "number") return val;
        const str = String(val).replace(/[^\d.,-]/g, "").replace(",", ".");
        const num = parseFloat(str);
        return isNaN(num) ? defaultVal : num;
      };

      if (excelSelectedTable === "estoque") {
        const mappedItems: StockItem[] = excelRows.map((row: any, index: number) => {
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(k => {
            normalizedRow[k.toLowerCase().trim()] = row[k];
          });

          const nomeVal = normalizedRow.nome || normalizedRow.item || normalizedRow.produto || normalizedRow.name || normalizedRow.descricao || "";
          if (!nomeVal) {
            throw new Error(`Linha ${index + 1} não possui uma coluna de Nome/Produto/Item.`);
          }

          const estoqueVal = parseNum(normalizedRow.estoque_atual || normalizedRow.quantidade || normalizedRow.estoque || normalizedRow.qtd || normalizedRow.quantity || normalizedRow.qtde, 0);
          const custoVal = parseNum(normalizedRow.custo_unitario || normalizedRow.custo || normalizedRow.cost || normalizedRow.valor_custo || normalizedRow.preco_compra, 0);
          const unidadeVal = String(normalizedRow.unidade || normalizedRow.un || normalizedRow.medida || "un").trim();

          let dateVal: string | undefined = undefined;
          const rawDate = normalizedRow.validade || normalizedRow.vencimento || normalizedRow.data_validade || normalizedRow.vence;
          if (rawDate) {
            if (rawDate instanceof Date) {
              dateVal = rawDate.toISOString().split("T")[0];
            } else {
              dateVal = String(rawDate).trim();
            }
          }

          const existingItem = currentScenario.niveis_estoque.find(item => item.nome.toLowerCase() === String(nomeVal).toLowerCase().trim());
          const id = existingItem ? existingItem.id : `prod-${Math.random().toString(36).substring(2, 9)}`;

          return {
            id,
            nome: String(nomeVal).trim(),
            estoque_atual: estoqueVal,
            unidade: unidadeVal,
            custo_unitario: custoVal,
            data_validade: dateVal
          };
        });

        let newStockList: StockItem[] = [];
        if (excelMergeMode === "replace") {
          newStockList = mappedItems;
        } else {
          newStockList = [...currentScenario.niveis_estoque];
          mappedItems.forEach(newItem => {
            const idx = newStockList.findIndex(item => item.nome.toLowerCase() === newItem.nome.toLowerCase());
            if (idx > -1) {
              newStockList[idx] = {
                ...newStockList[idx],
                estoque_atual: newItem.estoque_atual,
                custo_unitario: newItem.custo_unitario,
                unidade: newItem.unidade,
                data_validade: newItem.data_validade || newStockList[idx].data_validade
              };
            } else {
              newStockList.push(newItem);
            }
          });
        }

        setCurrentScenario({
          ...currentScenario,
          niveis_estoque: newStockList
        });
        setExcelSuccess(`Tabela de Estoque atualizada com sucesso! ${mappedItems.length} itens processados.`);
      } else if (excelSelectedTable === "vendas") {
        const mappedSales: SalesHistory[] = excelRows.map((row: any, index: number) => {
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(k => {
            normalizedRow[k.toLowerCase().trim()] = row[k];
          });

          const nomeVal = normalizedRow.nome || normalizedRow.item || normalizedRow.produto || normalizedRow.name || normalizedRow.descricao || "";
          if (!nomeVal) {
            throw new Error(`Linha ${index + 1} não possui uma coluna de Nome/Produto/Item.`);
          }

          const vendasVal = parseNum(normalizedRow.quantidade_vendida_30_dias || normalizedRow.quantidade || normalizedRow.vendas || normalizedRow.sold || normalizedRow.qtd || normalizedRow.quantity, 0);
          const mediaVal = parseNum(normalizedRow.media_diaria || normalizedRow.media, Number((vendasVal / 30).toFixed(2)));
          const fatorVal = parseNum(normalizedRow.vendas_sazonal_fim_de_semana_fator || normalizedRow.fator || normalizedRow.sazonalidade, 1.2);

          const existingItem = currentScenario.niveis_estoque.find(item => item.nome.toLowerCase() === String(nomeVal).toLowerCase().trim());
          const produto_id = existingItem ? existingItem.id : `prod-${Math.random().toString(36).substring(2, 9)}`;

          return {
            produto_id,
            nome: String(nomeVal).trim(),
            quantidade_vendida_30_dias: vendasVal,
            media_diaria: mediaVal,
            vendas_sazonal_fim_de_semana_fator: fatorVal
          };
        });

        let newSalesList: SalesHistory[] = [];
        if (excelMergeMode === "replace") {
          newSalesList = mappedSales;
        } else {
          newSalesList = [...currentScenario.historico_vendas];
          mappedSales.forEach(newSale => {
            const idx = newSalesList.findIndex(item => item.nome.toLowerCase() === newSale.nome.toLowerCase());
            if (idx > -1) {
              newSalesList[idx] = {
                ...newSalesList[idx],
                quantidade_vendida_30_dias: newSale.quantidade_vendida_30_dias,
                media_diaria: newSale.media_diaria,
                vendas_sazonal_fim_de_semana_fator: newSale.vendas_sazonal_fim_de_semana_fator
              };
            } else {
              newSalesList.push(newSale);
            }
          });
        }

        setCurrentScenario({
          ...currentScenario,
          historico_vendas: newSalesList
        });
        setExcelSuccess(`Histórico de Vendas atualizado com sucesso! ${mappedSales.length} itens processados.`);
      } else if (excelSelectedTable === "validade") {
        const mappedAlerts: ExpirationAlert[] = excelRows.map((row: any, index: number) => {
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(k => {
            normalizedRow[k.toLowerCase().trim()] = row[k];
          });

          const nomeVal = normalizedRow.nome || normalizedRow.item || normalizedRow.produto || normalizedRow.name || normalizedRow.descricao || "";
          if (!nomeVal) {
            throw new Error(`Linha ${index + 1} não possui uma coluna de Nome/Produto/Item.`);
          }

          const quantidadeVal = parseNum(normalizedRow.quantidade_afetada || normalizedRow.quantidade || normalizedRow.qtd || normalizedRow.quantity || normalizedRow.afetado, 0);
          const loteVal = String(normalizedRow.lote || normalizedRow.batch || "L-MIGRADO").trim();

          let dateVal = "";
          const rawDate = normalizedRow.data_vencimento || normalizedRow.vencimento || normalizedRow.validade || normalizedRow.data;
          if (rawDate) {
            if (rawDate instanceof Date) {
              dateVal = rawDate.toISOString().split("T")[0];
            } else {
              dateVal = String(rawDate).trim();
            }
          } else {
            throw new Error(`Linha ${index + 1} não possui uma coluna de Data de Vencimento.`);
          }

          const existingItem = currentScenario.niveis_estoque.find(item => item.nome.toLowerCase() === String(nomeVal).toLowerCase().trim());
          const produto_id = existingItem ? existingItem.id : `prod-${Math.random().toString(36).substring(2, 9)}`;

          return {
            produto_id,
            nome: String(nomeVal).trim(),
            lote: loteVal,
            quantidade_afetada: quantidadeVal,
            data_vencimento: dateVal
          };
        });

        let newAlertsList: ExpirationAlert[] = [];
        if (excelMergeMode === "replace") {
          newAlertsList = mappedAlerts;
        } else {
          newAlertsList = [...currentScenario.alertas_validade];
          mappedAlerts.forEach(newAlert => {
            const idx = newAlertsList.findIndex(item => item.nome.toLowerCase() === newAlert.nome.toLowerCase() && item.lote.toLowerCase() === newAlert.lote.toLowerCase());
            if (idx > -1) {
              newAlertsList[idx] = {
                ...newAlertsList[idx],
                quantidade_afetada: newAlert.quantidade_afetada,
                data_vencimento: newAlert.data_vencimento
              };
            } else {
              newAlertsList.push(newAlert);
            }
          });
        }

        setCurrentScenario({
          ...currentScenario,
          alertas_validade: newAlertsList
        });
        setExcelSuccess(`Alertas de Validade atualizados com sucesso! ${mappedAlerts.length} itens processados.`);
      }

      setExcelRows([]);
      setExcelFileName(null);
      
      // Automatically switch to standard tables mode to see the updated table!
      setTimeout(() => {
        setInputMode("tables");
        setActiveTab(excelSelectedTable === "estoque" ? "estoque" : excelSelectedTable === "vendas" ? "vendas" : "validade");
        setExcelSuccess(null);
      }, 3000);

    } catch (err: any) {
      setExcelError(err.message || "Erro ao aplicar os dados importados.");
    }
  };

  // Download simple sample template (CSV/Excel-friendly) for selected table
  const downloadExcelTemplate = () => {
    let headers: string[] = [];
    let sampleRows: Record<string, any>[] = [];
    let filename = "";

    if (excelSelectedTable === "estoque") {
      headers = ["item", "quantidade", "unidade", "custo_unitario", "data_validade"];
      sampleRows = [
        { item: "Farinha de Trigo Premium", quantidade: 150, unidade: "kg", custo_unitario: 4.50, data_validade: "2026-12-15" },
        { item: "Molho de Tomate Orgânico", quantidade: 80, unidade: "lata", custo_unitario: 8.90, data_validade: "2026-09-30" },
        { item: "Queijo Mussarela Especial", quantidade: 15, unidade: "kg", custo_unitario: 38.00, data_validade: "2026-07-20" }
      ];
      filename = "modelo_estoque.csv";
    } else if (excelSelectedTable === "vendas") {
      headers = ["item", "quantidade_vendida_30_dias", "media_diaria", "vendas_sazonal_fim_de_semana_fator"];
      sampleRows = [
        { item: "Farinha de Trigo Premium", quantidade_vendida_30_dias: 450, media_diaria: 15, vendas_sazonal_fim_de_semana_fator: 1.1 },
        { item: "Molho de Tomate Orgânico", quantidade_vendida_30_dias: 240, media_diaria: 8, vendas_sazonal_fim_de_semana_fator: 1.3 },
        { item: "Queijo Mussarela Especial", quantidade_vendida_30_dias: 120, media_diaria: 4, vendas_sazonal_fim_de_semana_fator: 1.6 }
      ];
      filename = "modelo_vendas.csv";
    } else if (excelSelectedTable === "validade") {
      headers = ["item", "lote", "quantidade_afetada", "data_vencimento"];
      sampleRows = [
        { item: "Farinha de Trigo Premium", lote: "L-FAR22", quantidade_afetada: 20, data_vencimento: "2026-11-01" },
        { item: "Molho de Tomate Orgânico", lote: "L-TOM41", quantidade_afetada: 12, data_vencimento: "2026-08-15" }
      ];
      filename = "modelo_validade.csv";
    }

    const csvRows = [];
    csvRows.push(headers.join(","));
    sampleRows.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        if (typeof val === "string" && val.includes(",")) {
          return `"${val}"`;
        }
        return val !== undefined ? val : "";
      });
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler to fetch from external API via server proxy
  const handleApiFetch = async () => {
    setApiIsLoading(true);
    setApiError(null);
    setApiRawResponse(null);
    setApiSuccessMessage(null);

    try {
      const headerObj: Record<string, string> = {};
      apiHeaders.forEach(hdr => {
        if (hdr.key.trim()) {
          headerObj[hdr.key.trim()] = hdr.value;
        }
      });

      let parsedBody = null;
      if (apiMethod !== "GET" && apiBody.trim()) {
        try {
          parsedBody = JSON.parse(apiBody);
        } catch (e) {
          throw new Error("O corpo da requisição (JSON Body) contém erros de sintaxe.");
        }
      }

      const response = await fetch("/api/sync-external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: apiUrl,
          method: apiMethod,
          headers: headerObj,
          body: parsedBody
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.sucesso) {
        throw new Error(resData.erro || "Falha ao se conectar com a API externa.");
      }

      setApiRawResponse(resData.raw_data);
      setApiSuccessMessage("Dados obtidos com sucesso! Clique no botão abaixo para mapear e carregar os dados.");
    } catch (err: any) {
      setApiError(err.message || "Erro na conexão por API.");
    } finally {
      setApiIsLoading(false);
    }
  };

  // Handler to normalize fetched JSON into ClientScenario using Gemini AI mapping
  const handleApiMapping = async () => {
    if (!apiRawResponse) return;
    setApiIsMapping(true);
    setApiError(null);
    setApiSuccessMessage(null);

    try {
      const response = await fetch("/api/map-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_data: apiRawResponse })
      });

      const resData = await response.json();

      if (!response.ok || !resData.sucesso) {
        throw new Error(resData.erro || "Falha ao mapear os dados obtidos.");
      }

      const mappedScenario = resData.mapped_scenario;
      setCurrentScenario(mappedScenario);
      setSelectedKey("custom");
      setInputMode("tables");
      setApiSuccessMessage(`Sucesso! Dados do cliente "${mappedScenario.nome_fantasia}" importados e normalizados.`);
      setError(null);
    } catch (err: any) {
      setApiError(err.message || "Erro ao mapear os dados com IA.");
    } finally {
      setApiIsMapping(false);
    }
  };

  // Handle text area manual input
  const handleManualJsonChange = (val: string) => {
    setJsonString(val);
    try {
      const parsed = JSON.parse(val);
      setCurrentScenario(parsed);
      setError(null);
    } catch (e) {
      // Don't crash, just let the user type, but we can display a subtle format indicator
    }
  };

  // Update specific fields in current scenario
  const updateStockItem = (id: string, field: keyof StockItem, value: any) => {
    const updatedStock = currentScenario.niveis_estoque.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setCurrentScenario({
      ...currentScenario,
      niveis_estoque: updatedStock
    });
  };

  const updateSalesHistory = (id: string, field: keyof SalesHistory, value: any) => {
    const updatedSales = currentScenario.historico_vendas.map((item) => {
      if (item.produto_id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setCurrentScenario({
      ...currentScenario,
      historico_vendas: updatedSales
    });
  };

  const deleteStockItem = (id: string) => {
    const updatedStock = currentScenario.niveis_estoque.filter(item => item.id !== id);
    const updatedSales = currentScenario.historico_vendas.filter(item => item.produto_id !== id);
    const updatedAlerts = currentScenario.alertas_validade.filter(item => item.produto_id !== id);
    setCurrentScenario({
      ...currentScenario,
      niveis_estoque: updatedStock,
      historico_vendas: updatedSales,
      alertas_validade: updatedAlerts
    });
  };

  const addNewItem = () => {
    const newId = `PROD-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: StockItem = {
      id: newId,
      nome: "Novo Produto Simulado",
      estoque_atual: 10,
      unidade: "unidades",
      custo_unitario: 10.00,
      data_validade: "2026-08-30"
    };
    const newSale: SalesHistory = {
      produto_id: newId,
      nome: "Novo Produto Simulado",
      quantidade_vendida_30_dias: 30,
      media_diaria: 1.0,
      vendas_sazonal_fim_de_semana_fator: 1.0
    };

    setCurrentScenario({
      ...currentScenario,
      niveis_estoque: [...currentScenario.niveis_estoque, newItem],
      historico_vendas: [...currentScenario.historico_vendas, newSale]
    });
  };

  // Run predictive BI analysis
  const runAnalysis = async () => {
    // Check if user is paid or has trial remaining with analysis allowance
    const isPaid = true;
    const aiCount = userRecord?.aiAnalysisCount || 0;
    
    setLoading(true);
    setError(null);
    setResults(null);
    setLoadingStep(0);

    // Simulate multi-tenant secure isolation steps for a fully immersive BI experience
    const steps = [
      "Isolando contexto do Tenant...",
      "Processando dados sob segurança Single-Tenant...",
      "Calculando ritmos diários de escoamento...",
      "Detectando produtos sob risco de validade...",
      "Executando motor preditivo com Inteligência Artificial...",
      "Consolidando metas de ROI e capital de giro..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      // Validate JSON input syntax first
      let payload;
      try {
        payload = JSON.parse(jsonString);
      } catch (e) {
        throw new Error("O JSON de entrada é inválido ou contém erros de sintaxe. Corrija o formato antes de prosseguir.");
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok || !resData.sucesso) {
        throw new Error(resData.erro || "Falha ao gerar a análise preditiva.");
      }

      setResults(resData.data);
      setActiveInsightTab("compras");

      // Increment AI analysis count for trial users
      if (!isPaid && user) {
        const newCount = aiCount + 1;
        updateFullUserRecord(user.email, { aiAnalysisCount: newCount });
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido durante a análise.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Email Draft Handler
  const openActionModal = (type: "purchase_email" | "promo_activation", item: any) => {
    setSelectedItem(item);
    setModalType(type);
    setModalOpen(true);
    setSimulationStatus("");
  };

  // Simulate action on checkout/ERP
  const simulateERPAction = () => {
    setSimulationStatus("loading");
    setTimeout(() => {
      setSimulationStatus("success");
    }, 1500);
  };

  // Submit follow-up question to Analyst Chat
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userQuery = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { sender: "user", text: userQuery }]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userQuery,
          id_cliente: currentScenario.id_cliente,
          scenario_data: currentScenario,
          analyzed_insights: results,
          chat_history: chatHistory.slice(-5) // Send last 5 messages for context
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao consultar o analista virtual.");
      }

      setChatHistory(prev => [...prev, { sender: "bot", text: data.text }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { sender: "bot", text: `Erro: ${err.message || "Não consegui responder agora."}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // 1. Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center font-sans" id="auth-loading-screen">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs text-neutral-400 mt-3 font-mono">Carregando STOCK.BI...</span>
      </div>
    );
  }

  // 2. Unauthenticated screen
  if (!user) {
    if (showAuth) {
      return (
        <AuthScreens
          onLogin={handleLogin}
          onRegister={handleRegister}
          initialTab={authTab}
          onBackToLanding={() => setShowAuth(false)}
        />
      );
    }
    return (
      <LandingPage
        onNavigateToAuth={(tab) => {
          setAuthTab(tab);
          setShowAuth(true);
        }}
      />
    );
  }

  // Check trial and payment status
  const isPaid = userRecord?.isPaid === true;

  const handleCheckout = async () => {
    if (!user) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          returnUrl: window.location.origin + window.location.pathname
        })
      });
      const data = await response.json();
      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Falha ao iniciar sessão do Mercado Pago.");
      }
      // Redirect to Mercado Pago
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error(err);
      // Fallback directly to the official link
      window.open("https://mpago.la/1r2Bdr8", "_blank");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    if (!user) return;
    updateFullUserRecord(user.email, { isPaid: true });
    setStripeSuccessModal(true);
  };

  const getTrialStatus = () => {
    if (!userRecord || !userRecord.createdAt) return { active: false, hoursLeft: 0, text: "" };
    const createdTime = new Date(userRecord.createdAt).getTime();
    const currentTime = new Date().getTime();
    const diffInMs = currentTime - createdTime;
    const seventyTwoHoursInMs = 3 * 24 * 60 * 60 * 1000;
    const timeLeftInMs = seventyTwoHoursInMs - diffInMs;
    
    if (timeLeftInMs <= 0) {
      return { active: false, hoursLeft: 0, text: "Período de teste expirado" };
    } else {
      const hoursLeft = Math.ceil(timeLeftInMs / (1000 * 60 * 60));
      return { active: true, hoursLeft, text: `${hoursLeft}h restantes` };
    }
  };

  const trialStatus = getTrialStatus();
  const showPaymentScreen = !isPaid && !trialStatus.active;

  // Render Payment / Subscription Screen if trial has expired and user has not paid
  if (showPaymentScreen) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans text-white" id="payment-gate-screen">
        {/* Background decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-700/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 -z-10"></div>

        <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center bg-rose-950/40 border border-rose-800/40 p-4 rounded-full text-rose-400 mb-2">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              STOCK.BI <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-900/50 font-mono">TESTE EXPIRADO</span>
            </h1>
            <p className="text-sm text-neutral-400">
              Seu período de avaliação gratuita de 72 horas expirou. Ative seu perfil para continuar.
            </p>
          </div>

          {/* Pricing card / Features */}
          <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-850 text-left space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2 flex items-center justify-between">
              <span>Plano Mensal Ilimitado</span>
              <span className="text-white font-bold text-sm">R$ 99,00/mês</span>
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                Acesso completo a todas as conexões (Planilhas Excel, APIs, ERPs)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                Análises preditivas ilimitadas com Inteligência Artificial
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                Previsões de demanda, ruptura e análise de validade automatizada
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                Suporte prioritário e relatórios personalizados
              </li>
            </ul>
          </div>

          {checkoutError && (
            <div className="p-3 bg-rose-950/20 text-rose-400 border border-rose-900/40 rounded-xl text-xs text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              {checkoutLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Assinar via Mercado Pago (Real)
                </>
              )}
            </button>

            <button
              onClick={handleSimulatePayment}
              className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-700"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" /> Ativar Sandbox (Grátis)
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <button
              onClick={handleLogout}
              className="text-xs text-neutral-500 hover:text-neutral-300 font-medium cursor-pointer transition-all"
            >
              Sair da conta / Entrar com outro usuário
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500 selection:text-neutral-950" id="main-container">
      
      {/* Mercado Pago Success Modal */}
      <AnimatePresence>
        {stripeSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 max-w-md w-full p-6 rounded-3xl text-center space-y-4 shadow-2xl relative"
            >
              <div className="inline-flex items-center justify-center bg-emerald-950 p-4 rounded-full text-emerald-400 border border-emerald-800/40 mb-2">
                <Check className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-white">Assinatura Ativada!</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Parabéns! Sua assinatura do <strong>STOCK.BI</strong> está ativa e validada com sucesso pelo <strong>Mercado Pago</strong>. 
                Você agora tem acesso ilimitado a todas as conexões, dados integrados e análises preditivas com inteligência artificial.
              </p>
              <button
                onClick={() => setStripeSuccessModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Começar a usar o Painel Ilimitado
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trial Countdown Banner */}
      {!isPaid && trialStatus.active && (
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 py-2.5 px-4 text-center text-xs text-neutral-300 flex flex-col sm:flex-row items-center justify-center gap-2" id="trial-banner">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            Período de Teste Grátis: <strong className="text-white font-semibold">{trialStatus.hoursLeft}h restantes</strong>
          </span>
          <span className="hidden sm:inline text-neutral-600">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            Análise Inteligente (IA): <strong className="text-white font-semibold">{userRecord?.aiAnalysisCount || 0}/1 usada</strong>
          </span>
          <span className="hidden sm:inline text-neutral-600">•</span>
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer disabled:opacity-50"
          >
            {checkoutLoading ? "Iniciando Mercado Pago..." : "Assinar Acesso Ilimitado via Mercado Pago →"}
          </button>
          <span className="text-neutral-500 text-[10px] sm:ml-2">
            (ou clique para simular:{" "}
            <button
              onClick={handleSimulatePayment}
              className="text-emerald-400 hover:text-white underline cursor-pointer font-bold"
            >
              Confirmar Ativação
            </button>
            )
          </span>
        </div>
      )}
      {/* Upper Navigation/Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur sticky top-0 z-40" id="header-nav">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950 text-emerald-400 p-2.5 rounded-xl border border-emerald-800/60" id="brand-logo">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SaaS STOCK.BI
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-mono font-medium">
                  BI Preditivo
                </span>
              </h1>
              <p className="text-xs text-neutral-400">Analista Virtual de Compras, Suprimentos e Prevenção de Perdas</p>
            </div>
          </div>

          {/* Active Operator & Logout Action */}
          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 flex items-center gap-2.5" id="operator-info">
              <User className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">Operador Ativo</div>
                <div className="text-xs font-semibold text-neutral-200">{user?.email}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-xs bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white transition-all font-semibold cursor-pointer"
              id="btn-logout"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6" id="dashboard-main">
        {/* Intro Banner */}
        <div className="mb-8 bg-neutral-900/40 border border-neutral-900 rounded-2xl p-6 relative overflow-hidden" id="intro-banner">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Analista de Suprimentos Virtual — Varejo & Food Service
          </h2>
          <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
            Esta plataforma simula o motor inteligente de um SaaS de BI. Selecione um perfil de cliente abaixo para carregar seu inventário privativo,
            historique de vendas e alertas. Você pode editar os dados diretamente ou enviar o payload JSON estruturado para que a Inteligência Artificial analise o escoamento, estime rupturas e monte combos promocionais focados na recuperação de capital.
          </p>
        </div>

        {/* Client Identity & Cloud Sync Control Panel */}
        <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl" id="tenant-selectors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-800/60">
            <div>
              <h3 className="text-xs font-mono font-semibold text-neutral-400 tracking-widest uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                1. DADOS DE SEU ESTABELECIMENTO ATIVO (SANDBOX MULTITENANCY)
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Seu usuário logado gerencia este estabelecimento de forma 100% isolada e segura.
              </p>
            </div>

            {/* Save Buttons & Notifications */}
            <div className="flex items-center gap-3">
              {dbSaveSuccess && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/40 px-3 py-1.5 rounded-xl">
                  <Check className="w-3.5 h-3.5" /> {dbSaveSuccess}
                </span>
              )}

              <button
                type="button"
                onClick={handleSaveActiveClient}
                disabled={dbSaving}
                className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                {dbSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 text-emerald-100" /> Salvar Sandbox
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Business Fields Editor */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={currentScenario.nome_fantasia || ""}
                onChange={(e) => setCurrentScenario({ ...currentScenario, nome_fantasia: e.target.value })}
                placeholder="Ex: Minha Pizzaria"
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">Segmento de Mercado</label>
              <select
                value={currentScenario.segmento || ""}
                onChange={(e) => setCurrentScenario({ ...currentScenario, segmento: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Food Service / Restaurante">Food Service / Restaurante</option>
                <option value="Varejo Alimentar">Varejo Alimentar</option>
                <option value="Distribuidora de Bebidas">Distribuidora de Bebidas</option>
                <option value="Hortifrúti / Açougue">Hortifrúti / Açougue</option>
                <option value="Outro Segmento">Outro Segmento</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">ID do Cliente (Fixo)</label>
              <input
                type="text"
                disabled
                value={currentScenario.id_cliente || ""}
                className="w-full bg-neutral-950/50 border border-neutral-800/80 text-neutral-500 text-xs rounded-xl p-2.5 font-mono cursor-not-allowed"
                title="Identificação única do seu tenant"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">E-mail de Compras</label>
              <input
                type="email"
                value={currentScenario.contato_compras || ""}
                onChange={(e) => setCurrentScenario({ ...currentScenario, contato_compras: e.target.value })}
                placeholder="suprimentos@empresa.com"
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Model Importers */}
          <div className="border-t border-neutral-800/60 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-neutral-400 font-medium">
              Deseja redefinir os dados para testar outros modelos de mercado?
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SCENARIOS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    const confirmReset = window.confirm(`Tem certeza de que deseja carregar os dados de modelo do segmento: ${value.nome_fantasia}? Suas edições atuais serão mescladas.`);
                    if (confirmReset) {
                      setCurrentScenario({
                        ...JSON.parse(JSON.stringify(value)),
                        id_cliente: currentScenario.id_cliente,
                        nome_fantasia: currentScenario.nome_fantasia,
                        segmento: currentScenario.segmento,
                        contato_compras: currentScenario.contato_compras
                      });
                      setSelectedKey("custom");
                    }
                  }}
                  className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-[11px] text-neutral-300 font-mono transition-all hover:text-white cursor-pointer"
                >
                  Importar {value.nome_fantasia.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace and Live Simulator Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12" id="workspace-grid">
          
          {/* Left Column - Live Simulator & Editor (8 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden" id="editor-card">
            <div className="border-b border-neutral-800 p-4 bg-neutral-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Simulador de Inventário & Dados de Entrada</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Origem dos Dados:</span>
                <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  <button
                    onClick={() => { setInputMode("tables"); }}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1",
                      inputMode === "tables" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <Database className="w-3.5 h-3.5" />
                    Tabelas
                  </button>
                  <button
                    onClick={() => { setInputMode("json"); }}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1",
                      inputMode === "json" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    JSON Cru
                  </button>
                  <button
                    onClick={() => { setInputMode("api"); }}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1",
                      inputMode === "api" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <Globe className="w-3.5 h-3.5 animate-pulse" />
                    Conexão API
                  </button>
                  <button
                    onClick={() => { setInputMode("excel"); }}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1",
                      inputMode === "excel" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Planilha Excel
                  </button>
                </div>
              </div>
            </div>

            {/* If Table editing mode is active */}
            {inputMode === "tables" && (
              <div className="flex-1 flex flex-col h-[480px]">
                {/* Simulator sub-tabs */}
                <div className="flex border-b border-neutral-800/60 bg-neutral-900/40 p-2 gap-1 items-center justify-between overflow-x-auto">
                  <div className="flex gap-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("estoque")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === "estoque" ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      📦 Níveis de Estoque ({currentScenario.niveis_estoque.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("vendas")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === "vendas" ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      📈 Histórico de Vendas
                    </button>
                    <button
                      onClick={() => setActiveTab("validade")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === "validade" ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      ⚠️ Validade ({currentScenario.alertas_validade.length})
                    </button>
                    {currentScenario.fichas_tecnicas && currentScenario.fichas_tecnicas.length > 0 && (
                      <button
                        onClick={() => setActiveTab("fichas")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                          activeTab === "fichas" ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-400 hover:text-white"
                        )}
                      >
                        🍽️ Fichas Técnicas ({currentScenario.fichas_tecnicas.length})
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleExportToExcel}
                    className="ml-auto px-3 py-1.5 text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-lg hover:bg-emerald-900 transition-all flex items-center gap-1.5 font-semibold cursor-pointer"
                    title="Exportar tabela ativa para Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar Planilha
                  </button>
                </div>

                {/* Sub-tab Views */}
                <div className="flex-1 p-4 overflow-y-auto min-h-0" id="editor-table-view">
                  
                  {activeTab === "estoque" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Modifique o estoque atual e custos para simular decisões financeiras na análise da IA:</span>
                        <button
                          onClick={addNewItem}
                          className="px-2.5 py-1 text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-lg hover:bg-emerald-900 transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Item
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                              <th className="py-2.5 px-2">ID</th>
                              <th className="py-2.5 px-2">Item</th>
                              <th className="py-2.5 px-2 w-32">Estoque</th>
                              <th className="py-2.5 px-2 w-28">Custo Unitário</th>
                              <th className="py-2.5 px-2 w-36">Data Validade</th>
                              <th className="py-2.5 px-2 text-right"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentScenario.niveis_estoque.map((item) => (
                              <tr key={item.id} className="border-b border-neutral-800/40 hover:bg-neutral-900/20 text-xs">
                                <td className="py-3 px-2 font-mono text-neutral-400 text-[11px]">{item.id}</td>
                                <td className="py-3 px-2">
                                  <input
                                    type="text"
                                    value={item.nome}
                                    onChange={(e) => updateStockItem(item.id, "nome", e.target.value)}
                                    className="bg-transparent border-0 hover:bg-neutral-800 focus:bg-neutral-800 p-1 rounded w-full font-medium text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                  />
                                </td>
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      value={item.estoque_atual}
                                      onChange={(e) => updateStockItem(item.id, "estoque_atual", parseFloat(e.target.value) || 0)}
                                      className="bg-neutral-950 border border-neutral-800 rounded p-1 w-16 text-center text-white focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                                    />
                                    <span className="text-[10px] text-neutral-400">{item.unidade}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-neutral-500">R$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={item.custo_unitario}
                                      onChange={(e) => updateStockItem(item.id, "custo_unitario", parseFloat(e.target.value) || 0)}
                                      className="bg-neutral-950 border border-neutral-800 rounded p-1 w-16 text-center text-white focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <input
                                    type="text"
                                    placeholder="YYYY-MM-DD"
                                    value={item.data_validade || ""}
                                    onChange={(e) => updateStockItem(item.id, "data_validade", e.target.value)}
                                    className="bg-neutral-950 border border-neutral-800 rounded p-1 w-28 text-center text-neutral-200 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                                  />
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <button
                                    onClick={() => deleteStockItem(item.id)}
                                    className="text-neutral-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/20 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === "vendas" && (
                    <div className="space-y-4">
                      <p className="text-xs text-neutral-400">Taxas de giro diário de vendas do cliente. Se você aumentar o ritmo de vendas diário, o BI previrá ruptura em menos dias:</p>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                              <th className="py-2.5 px-2">Item ID</th>
                              <th className="py-2.5 px-2">Produto</th>
                              <th className="py-2.5 px-2 w-36 text-center">Vendas (30 Dias)</th>
                              <th className="py-2.5 px-2 w-32 text-center">Giro Diário Médio</th>
                              <th className="py-2.5 px-2 w-28 text-center">Fator Sazonal FDS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentScenario.historico_vendas.map((item) => (
                              <tr key={item.produto_id} className="border-b border-neutral-800/40 hover:bg-neutral-900/20 text-xs">
                                <td className="py-3 px-2 font-mono text-neutral-400 text-[11px]">{item.produto_id}</td>
                                <td className="py-3 px-2 font-medium text-white">{item.nome}</td>
                                <td className="py-3 px-2 text-center font-mono">
                                  <input
                                    type="number"
                                    value={item.quantidade_vendida_30_dias}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      updateSalesHistory(item.produto_id, "quantidade_vendida_30_dias", val);
                                      updateSalesHistory(item.produto_id, "media_diaria", parseFloat((val / 30).toFixed(2)));
                                    }}
                                    className="bg-neutral-950 border border-neutral-800 rounded p-1 w-20 text-center text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1.5 font-mono text-emerald-400 font-semibold bg-emerald-950/20 px-2 py-1 rounded-lg border border-emerald-900/40 w-24 mx-auto">
                                    {item.media_diaria} <span className="text-[10px] text-neutral-400">/dia</span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center font-mono">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={item.vendas_sazonal_fim_de_semana_fator}
                                    onChange={(e) => updateSalesHistory(item.produto_id, "vendas_sazonal_fim_de_semana_fator", parseFloat(e.target.value) || 1.0)}
                                    className="bg-neutral-950 border border-neutral-800 rounded p-1 w-16 text-center text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === "validade" && (
                    <div className="space-y-4">
                      <p className="text-xs text-neutral-400">Alertas de validade registrados no banco de dados. Itens com quantidade afetada alta e validade próxima geram insights de prevenção de perdas:</p>
                      
                      {currentScenario.alertas_validade.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500 text-xs bg-neutral-950/40 border border-dashed border-neutral-800 rounded-xl">
                          Nenhum alerta de validade registrado para este cliente.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentScenario.alertas_validade.map((alert, idx) => (
                            <div key={idx} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <div className="bg-amber-950 text-amber-400 p-2 rounded-lg border border-amber-900/40">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-semibold text-white">{alert.nome}</div>
                                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                    Lote: <span className="text-neutral-300 font-medium">{alert.lote}</span> | Qtd Afetada: <span className="text-amber-400 font-bold">{alert.quantidade_afetada}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-[10px] text-neutral-400 font-mono">VENCIMENTO</div>
                                  <div className="font-mono text-amber-400 font-semibold">{alert.data_vencimento}</div>
                                </div>
                                <button
                                  onClick={() => {
                                    const updatedAlerts = currentScenario.alertas_validade.filter((_, i) => i !== idx);
                                    setCurrentScenario({ ...currentScenario, alertas_validade: updatedAlerts });
                                  }}
                                  className="text-neutral-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "fichas" && (
                    <div className="space-y-4">
                      <p className="text-xs text-neutral-400">Fichas técnicas de preparo. A IA as utiliza para projetar combos promocionais inteligentes que escoam insumos críticos sem canibalizar lucro:</p>
                      
                      <div className="space-y-4">
                        {currentScenario.fichas_tecnicas?.map((recipe) => (
                          <div key={recipe.id} className="bg-neutral-950/40 border border-neutral-800 p-4 rounded-xl">
                            <h4 className="font-semibold text-white text-xs mb-3 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {recipe.nome_prato}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                              {recipe.ingredientes.map((ing, ingIdx) => {
                                const matchedItem = currentScenario.niveis_estoque.find(i => i.id === ing.produto_id);
                                return (
                                  <div key={ingIdx} className="bg-neutral-950 p-2.5 border border-neutral-800/60 rounded-lg flex items-center justify-between">
                                    <span className="text-neutral-300 font-medium">{matchedItem ? matchedItem.nome : ing.produto_id}</span>
                                    <span className="font-mono text-emerald-400 font-semibold">{ing.quantidade} {ing.unidade}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* If Raw JSON editing mode is active */}
            {inputMode === "json" && (
              <div className="flex-1 flex flex-col h-[480px]">
                <div className="bg-neutral-950 p-2 border-b border-neutral-800 text-[11px] text-neutral-400 font-mono flex justify-between items-center">
                  <span>Edite diretamente o JSON do Tenant. Teste exclusão do `id_cliente` para ver a validação multitenant.</span>
                  <button
                    onClick={() => {
                      try {
                        const formatted = JSON.stringify(JSON.parse(jsonString), null, 2);
                        setJsonString(formatted);
                      } catch (e) {
                        alert("JSON inválido");
                      }
                    }}
                    className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded hover:text-white transition-all text-[10px]"
                  >
                    Auto-Formatar
                  </button>
                </div>
                <textarea
                  value={jsonString}
                  onChange={(e) => handleManualJsonChange(e.target.value)}
                  className="flex-1 w-full bg-neutral-950/70 p-4 font-mono text-xs text-neutral-300 focus:outline-none resize-none overflow-y-auto leading-relaxed border-0"
                  spellCheck="false"
                  placeholder="Insira o payload JSON do cliente..."
                  id="json-textarea"
                />
              </div>
            )}

            {/* If API Sync mode is active */}
            {inputMode === "api" && (
              <div className="flex-1 flex flex-col h-[480px] p-4 overflow-y-auto space-y-4" id="api-integration-view">
                <div className="bg-neutral-950/40 p-3.5 border border-neutral-800 rounded-xl space-y-1">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Plug className="w-4 h-4 text-emerald-400" />
                    Sincronização de Estoque & Vendas via API
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Conecte o STOCK.BI com a API do seu ERP ou PDV (Omie, Totvs, Shopify, etc.).
                    Use nosso simulador integrado para ver como a Inteligência Artificial mapeia esquemas JSON arbitrários de forma autônoma.
                  </p>
                </div>

                {/* API Request Configuration */}
                <div className="space-y-3.5 bg-neutral-950/20 p-4 border border-neutral-800/80 rounded-xl">
                  {/* URL and Method row */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">Método</label>
                      <select
                        value={apiMethod}
                        onChange={(e: any) => setApiMethod(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>
                    <div className="col-span-9">
                      <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">Endpoint da API</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                          placeholder="https://api.seu-erp.com/v1/inventario"
                          className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg p-2 pr-20 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setApiUrl("/api/mock-erp")}
                          className="absolute right-1.5 top-1.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[9px] hover:bg-emerald-900 transition-all"
                        >
                          Simular ERP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Headers Management */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider">Cabeçalhos HTTP (Headers)</label>
                      <button
                        type="button"
                        onClick={addHeaderRow}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Header
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                      {apiHeaders.length === 0 ? (
                        <div className="text-[10px] text-neutral-500 italic py-1">Nenhum cabeçalho configurado.</div>
                      ) : (
                        apiHeaders.map((hdr, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={hdr.key}
                              onChange={(e) => updateHeaderRow(idx, "key", e.target.value)}
                              placeholder="Key (ex: Authorization)"
                              className="flex-1 bg-neutral-950 border border-neutral-800 text-xs rounded p-1.5 font-mono text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <input
                              type="text"
                              value={hdr.value}
                              onChange={(e) => updateHeaderRow(idx, "value", e.target.value)}
                              placeholder="Value (ex: Bearer token...)"
                              className="flex-1 bg-neutral-950 border border-neutral-800 text-xs rounded p-1.5 font-mono text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeHeaderRow(idx)}
                              className="text-neutral-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Optional POST Request Body */}
                  {apiMethod === "POST" && (
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">Corpo da Requisição (JSON Body)</label>
                      <textarea
                        value={apiBody}
                        onChange={(e) => setApiBody(e.target.value)}
                        className="w-full h-16 bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[10px] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                        spellCheck="false"
                      />
                    </div>
                  )}

                  {/* Trigger Fetch button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleApiFetch}
                      disabled={apiIsLoading || !apiUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {apiIsLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Conectando...
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" /> Buscar Dados da API
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* API Logs & Status Messages */}
                {apiError && (
                  <div className="bg-rose-950/20 text-rose-400 border border-rose-900/40 p-3 rounded-lg flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Erro na Integração:</strong>
                      {apiError}
                    </div>
                  </div>
                )}

                {apiSuccessMessage && (
                  <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 p-3 rounded-lg flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>{apiSuccessMessage}</div>
                  </div>
                )}

                {/* API Response Display & AI Mapper Trigger */}
                {apiRawResponse && (
                  <div className="space-y-3 bg-neutral-950/30 p-4 border border-neutral-800 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-neutral-400" />
                        Resposta Raw da API Externa
                      </div>
                      
                      {/* AI SCHEMA MAPPER TRIGGER BUTTON */}
                      <button
                        type="button"
                        onClick={handleApiMapping}
                        disabled={apiIsMapping}
                        className="px-3 py-1.5 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 disabled:opacity-50 border border-emerald-800/60 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {apiIsMapping ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" /> Mapeando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Mapear com Inteligência Artificial
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="h-44 bg-neutral-950 p-3 rounded-lg text-[10px] font-mono text-emerald-400/90 overflow-y-auto border border-neutral-900 leading-relaxed scrollbar-thin scrollbar-thumb-neutral-800">
                      {JSON.stringify(apiRawResponse, null, 2)}
                    </pre>

                    <p className="text-[10px] text-neutral-500 italic">
                      Nota: O mapeador inteligente do STOCK.BI utiliza inteligência artificial avançada para interpretar e traduzir livremente qualquer formato de JSON externo para as tabelas nativas de conformidade.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* If Excel Import mode is active */}
            {inputMode === "excel" && (
              <div className="flex-1 flex flex-col h-[480px] p-4 overflow-y-auto space-y-4" id="excel-integration-view">
                <div className="bg-neutral-950/40 p-3.5 border border-neutral-800 rounded-xl space-y-1">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Atualização de Dados via Planilha Excel (XLSX / CSV)
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Importe planilhas geradas pelo seu sistema de faturamento, ERP ou preenchidas manualmente. 
                    Nossa inteligência de mapeamento flexível detectará os cabeçalhos automaticamente.
                  </p>
                </div>

                {/* Step 1: Select Table to Update */}
                <div className="space-y-3.5 bg-neutral-950/20 p-4 border border-neutral-800/80 rounded-xl">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1.5">
                      1. Escolha a tabela que deseja atualizar
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setExcelSelectedTable("estoque");
                          setExcelRows([]);
                          setExcelFileName(null);
                          setExcelError(null);
                        }}
                        className={cn(
                          "py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                          excelSelectedTable === "estoque"
                            ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        )}
                      >
                        <span>📦 Estoque Atual</span>
                        <span className="text-[9px] text-neutral-500">({currentScenario.niveis_estoque.length} itens)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExcelSelectedTable("vendas");
                          setExcelRows([]);
                          setExcelFileName(null);
                          setExcelError(null);
                        }}
                        className={cn(
                          "py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                          excelSelectedTable === "vendas"
                            ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        )}
                      >
                        <span>📈 Vendas (30d)</span>
                        <span className="text-[9px] text-neutral-500">({currentScenario.historico_vendas.length} itens)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExcelSelectedTable("validade");
                          setExcelRows([]);
                          setExcelFileName(null);
                          setExcelError(null);
                        }}
                        className={cn(
                          "py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                          excelSelectedTable === "validade"
                            ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        )}
                      >
                        <span>⚠️ Validade</span>
                        <span className="text-[9px] text-neutral-500">({currentScenario.alertas_validade.length} alertas)</span>
                      </button>
                    </div>
                  </div>

                  {/* Template download and format guidelines */}
                  <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-semibold text-neutral-300">Formato Esperado & Colunas</div>
                      <div className="text-[10px] text-neutral-400">
                        {excelSelectedTable === "estoque" && "Recomendado: item, quantidade, unidade, custo_unitario, data_validade"}
                        {excelSelectedTable === "vendas" && "Recomendado: item, quantidade_vendida_30_dias, media_diaria"}
                        {excelSelectedTable === "validade" && "Recomendado: item, lote, quantidade_afetada, data_vencimento"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={downloadExcelTemplate}
                      className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Baixar Modelo
                    </button>
                  </div>

                  {/* Step 2: Upload File */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block">
                      2. Selecione ou arraste o arquivo (.xlsx, .xls ou .csv)
                    </label>
                    
                    <div className="relative border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 bg-neutral-950/30 rounded-xl p-6 text-center transition-all">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                        <UploadCloud className="w-8 h-8 text-neutral-400" />
                        {excelFileName ? (
                          <div className="text-xs font-semibold text-emerald-400 font-mono">{excelFileName}</div>
                        ) : (
                          <>
                            <div className="text-xs text-neutral-300 font-medium">Clique para escolher ou arraste a planilha aqui</div>
                            <div className="text-[10px] text-neutral-500 font-mono">Suporta Excel (.xlsx) e Arquivos CSV separados por vírgula</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Choose merge mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block mb-1">
                        3. Método de Integração
                      </label>
                      <div className="flex gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                        <button
                          type="button"
                          onClick={() => setExcelMergeMode("merge")}
                          className={cn(
                            "flex-1 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer",
                            excelMergeMode === "merge" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
                          )}
                        >
                          Mesclar (Atualizar)
                        </button>
                        <button
                          type="button"
                          onClick={() => setExcelMergeMode("replace")}
                          className={cn(
                            "flex-1 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer",
                            excelMergeMode === "replace" ? "bg-rose-950/60 text-rose-400 border border-rose-900/40" : "text-neutral-400 hover:text-white"
                          )}
                        >
                          Substituir Tudo
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={applyExcelImport}
                        disabled={excelRows.length === 0}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Aplicar na Tabela
                      </button>
                    </div>
                  </div>
                </div>

                {/* Errors or Success Notifications */}
                {excelError && (
                  <div className="bg-rose-950/20 text-rose-400 border border-rose-900/40 p-3 rounded-lg flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Erro na Planilha:</strong>
                      {excelError}
                    </div>
                  </div>
                )}

                {excelSuccess && (
                  <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 p-3 rounded-lg flex items-start gap-2 text-xs animate-bounce">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>{excelSuccess}</div>
                  </div>
                )}

                {/* Parsed Rows Preview */}
                {excelRows.length > 0 && (
                  <div className="space-y-2 bg-neutral-950/30 p-4 border border-neutral-800 rounded-xl animate-fade-in">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />
                      Pré-visualização dos Dados Carregados ({excelRows.length} linhas)
                    </div>

                    <div className="overflow-x-auto max-h-[140px] rounded-lg border border-neutral-800">
                      <table className="w-full text-left border-collapse text-[11px] font-mono">
                        <thead>
                          <tr className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                            {Object.keys(excelRows[0]).map((key, idx) => (
                              <th key={idx} className="p-2 font-semibold capitalize">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {excelRows.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-b border-neutral-800/50 text-neutral-300">
                              {Object.values(row).map((val: any, valIdx) => (
                                <td key={valIdx} className="p-2 whitespace-nowrap">
                                  {val instanceof Date ? val.toISOString().split("T")[0] : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {excelRows.length > 5 && (
                      <p className="text-[10px] text-neutral-500 italic text-right">
                        Mostrando as primeiras 5 de {excelRows.length} linhas carregadas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Status Bar & Actions */}
            <div className="border-t border-neutral-800 p-4 bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>O payload contém <strong className="text-neutral-200">{currentScenario.niveis_estoque.length} itens</strong> no estoque.</span>
              </div>
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 disabled:opacity-50"
                id="analyze-btn"
              >
                {loading ? (
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <Play className="w-4.5 h-4.5 fill-current" />
                )}
                {loading ? "Processando..." : "Analisar com Inteligência Artificial"}
              </button>
            </div>
          </div>

          {/* Right Column - Console & Active Loading / Summary Log (5 Cols) */}
          <div className="lg:col-span-5 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden" id="console-card">
            <div className="border-b border-neutral-800 p-4 bg-neutral-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Painel de Processamento & Erros</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                Console Log
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between h-[514px] overflow-y-auto font-mono bg-neutral-950/30 text-xs leading-relaxed" id="processing-console">
              
              {/* If loading is active */}
              {loading && (
                <div className="flex-1 flex flex-col justify-center items-center py-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-950 flex items-center justify-center">
                      <Cpu className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin"></div>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">Motor de BI Executando</h4>
                  <p className="text-neutral-400 text-[11px] mb-4 max-w-xs">Análise isolada (Single-Tenant) do cliente {currentScenario.id_cliente}.</p>
                  
                  {/* Step Logs */}
                  <div className="w-full max-w-xs space-y-1.5 text-left bg-neutral-950 border border-neutral-900 p-3.5 rounded-xl font-mono text-[10px] text-neutral-400">
                    <div className={cn("flex items-center gap-2", loadingStep >= 0 ? "text-emerald-400" : "")}>
                      <span>{loadingStep >= 0 ? "✓" : "○"}</span> Isolando contexto do Tenant...
                    </div>
                    <div className={cn("flex items-center gap-2", loadingStep >= 1 ? "text-emerald-400" : "")}>
                      <span>{loadingStep >= 1 ? "✓" : "○"}</span> Processando dados sob segurança Single-Tenant...
                    </div>
                    <div className={cn("flex items-center gap-2", loadingStep >= 2 ? "text-emerald-400" : "")}>
                      <span>{loadingStep >= 2 ? "✓" : "○"}</span> Calculando ritmos diários...
                    </div>
                    <div className={cn("flex items-center gap-2", loadingStep >= 3 ? "text-emerald-400" : "")}>
                      <span>{loadingStep >= 3 ? "✓" : "○"}</span> Consultando Inteligência Artificial...
                    </div>
                    <div className={cn("flex items-center gap-2", loadingStep >= 5 ? "text-emerald-400" : "")}>
                      <span>{loadingStep >= 5 ? "✓" : "○"}</span> Consolidando insights...
                    </div>
                  </div>
                </div>
              )}

              {/* If Error exists */}
              {!loading && error && (
                <div className="flex-1 flex flex-col justify-center items-center py-8 text-center text-rose-400">
                  <div className="bg-rose-950/40 text-rose-400 border border-rose-900/40 p-3.5 rounded-full mb-4">
                    <AlertOctagon className="w-10 h-10 animate-bounce" />
                  </div>
                  <h4 className="font-bold text-rose-300 text-sm mb-2">ERRO DE CONSISTÊNCIA OU ISOLAMENTO</h4>
                  <p className="text-neutral-400 text-xs max-w-xs mb-4 leading-relaxed bg-neutral-950 border border-neutral-900 p-3 rounded-lg text-left">
                    {error}
                  </p>
                  <div className="text-[10px] text-neutral-500 max-w-xs text-left">
                    Para fins de segurança e conformidade (Multitenancy), o sistema SaaS barra requisições sem ID do cliente ou com formato inconsistente, prevenindo vazamento de dados de outros tenants.
                  </div>
                </div>
              )}

              {/* Default empty state */}
              {!loading && !error && !results && (
                <div className="flex-1 flex flex-col justify-center items-center py-12 text-center text-neutral-500">
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-full mb-4">
                    <Cpu className="w-8 h-8 text-neutral-700" />
                  </div>
                  <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider mb-2">Aguardando Execução</h4>
                  <p className="text-neutral-500 text-[11px] max-w-xs">
                    Configure os dados de entrada na tabela à esquerda e clique em <strong>Analisar com Inteligência Artificial</strong> para disparar as previsões do modelo e renderizar os insights.
                  </p>
                </div>
              )}

              {/* Completed log output */}
              {!loading && !error && results && (
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 p-3.5 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-white text-[11px]">ANÁLISE PREDITIVA CONCLUÍDA!</div>
                        <div className="text-[10px] text-neutral-400">Contexto Tenant {results.id_cliente} isolado com sucesso.</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Resumo do Processamento:</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-neutral-950 p-2.5 rounded border border-neutral-900">
                          <span className="text-neutral-500 block">Itens Analisados</span>
                          <span className="font-bold text-white">{results.metatags?.total_itens_analisados || 0}</span>
                        </div>
                        <div className="bg-neutral-950 p-2.5 rounded border border-neutral-900">
                          <span className="text-neutral-500 block">Risco de Ruptura</span>
                          <span className="font-bold text-rose-400">{results.insights_compras?.length || 0} Itens</span>
                        </div>
                        <div className="bg-neutral-950 p-2.5 rounded border border-neutral-900">
                          <span className="text-neutral-500 block">Giro Lento / Validade</span>
                          <span className="font-bold text-amber-400">{results.insights_promocoes?.length || 0} Itens</span>
                        </div>
                        <div className="bg-neutral-950 p-2.5 rounded border border-neutral-900">
                          <span className="text-neutral-500 block">Capital sob Risco</span>
                          <span className="font-bold text-white">R$ {results.metatags?.capital_risco_estimado?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Comentários do Analista:</div>
                      <div className="space-y-1.5 text-[11px] text-neutral-300">
                        {results.mensagens_analista?.slice(0, 3).map((msg: string, i: number) => (
                          <div key={i} className="bg-neutral-950/50 p-2.5 border border-neutral-900 rounded-lg flex items-start gap-2">
                            <span className="text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 text-[10px] text-neutral-500">
                    O JSON retornado obedece a um esquema estrito de front-end. Veja os cards de BI detalhados abaixo.
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* BI PREDICTIVE DASHBOARD CARDS OUTCOME */}
        <AnimatePresence>
          {results && !loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 mb-16"
              id="analytics-results-section"
            >
              <div className="border-b border-neutral-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Resultados da Análise Preditiva & Ações Sugeridas
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Análise gerada em <span className="text-neutral-300 font-mono">{results.data_analise}</span> para o Tenant <span className="text-emerald-400 font-mono font-semibold">{results.id_cliente}</span>
                  </p>
                </div>
                
                {/* Visual Tabs for results display */}
                <div className="flex flex-wrap items-center gap-3">
                  {activeInsightTab !== "chat" && (
                    <button
                      onClick={handleExportToExcel}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      title="Exportar insights ativos para Excel (.xlsx)"
                    >
                      <Download className="w-4 h-4" /> Exportar Planilha
                    </button>
                  )}
                  <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() => setActiveInsightTab("compras")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                        activeInsightTab === "compras" ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      🛒 Compras & Rupturas
                    </button>
                    <button
                      onClick={() => setActiveInsightTab("promocoes")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                        activeInsightTab === "promocoes" ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <Tag className="w-4 h-4" />
                      📣 Promoções & Giro
                    </button>
                    <button
                      onClick={() => setActiveInsightTab("chat")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                        activeInsightTab === "chat" ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <User className="w-4 h-4" />
                      💬 Consultor de Compras
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial KPI Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* KPI 1 - Cost of reposição */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  <div className="bg-emerald-950 text-emerald-400 p-3 rounded-xl border border-emerald-900/40">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 block font-medium">Investimento Recomendado (Compra)</span>
                    <span className="text-2xl font-black text-white block mt-1 font-mono">
                      R$ {results.resumo_financeiro?.custo_total_reposicao?.toFixed(2) || "0.00"}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Evita falha de fornecimento</span>
                  </div>
                </div>

                {/* KPI 2 - Cap Giro Recuperável */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                  <div className="bg-amber-950/60 text-amber-400 p-3 rounded-xl border border-amber-900/40">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 block font-medium">Giro de Capital Sob Risco</span>
                    <span className="text-2xl font-black text-white block mt-1 font-mono">
                      R$ {results.resumo_financeiro?.recuperacao_capital_giro?.toFixed(2) || "0.00"}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Dinheiro paralisado em estoque crítico</span>
                  </div>
                </div>

                {/* KPI 3 - Projected Return ROI */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400"></div>
                  <div className="bg-emerald-950 text-emerald-400 p-3 rounded-xl border border-emerald-900/40">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 block font-medium">ROI Estimado em Campanhas</span>
                    <span className="text-2xl font-black text-white block mt-1 font-mono">
                      {results.resumo_financeiro?.roi_estimado_campanhas || "1.5"}x
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Retorno de cada real recuperado</span>
                  </div>
                </div>

              </div>

              {/* TAB CONTENT 1: COMPRAS & RUPTURAS */}
              {activeInsightTab === "compras" && (
                <div className="space-y-6">
                  <div className="bg-neutral-900/40 p-4 border border-neutral-900 rounded-xl flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-emerald-400" />
                    <p className="text-xs text-neutral-300">
                      Estes itens estão com escoamento rápido comparado ao estoque atual. O sistema projeta a <strong>data de ruptura</strong> com base nas médias diárias e sugere reabastecimento imediato.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.insights_compras?.map((item: any, idx: number) => {
                      const isCritical = item.urgencia === "CRÍTICA" || item.dias_para_ruptura <= 3;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-neutral-700 relative",
                            isCritical ? "border-rose-950/60" : "border-neutral-800"
                          )}
                        >
                          {/* Top row */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="text-xs font-mono text-neutral-500">{item.produto_id}</span>
                              <span
                                className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                                  item.urgencia === "CRÍTICA"
                                    ? "bg-rose-950 text-rose-400 border-rose-900/40"
                                    : item.urgencia === "ALTA"
                                    ? "bg-amber-950 text-amber-400 border-amber-900/40"
                                    : "bg-emerald-950 text-emerald-400 border-emerald-900/40"
                                )}
                              >
                                Urgência {item.urgencia}
                              </span>
                            </div>

                            <h4 className="font-bold text-white text-base mb-2">{item.nome}</h4>
                            
                            {/* Stock stats */}
                            <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-900 mb-4 text-xs">
                              <div>
                                <span className="text-neutral-500 text-[10px] block uppercase font-mono">Estoque Atual</span>
                                <span className="font-bold text-white mt-0.5 block">{item.estoque_atual}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 text-[10px] block uppercase font-mono">Ritmo Diário</span>
                                <span className="font-bold text-emerald-400 mt-0.5 block">{item.ritmo_vendas_diario}/dia</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 text-[10px] block uppercase font-mono">Dias p/ Ruptura</span>
                                <span className={cn("font-bold mt-0.5 block font-mono", isCritical ? "text-rose-400" : "text-amber-400")}>
                                  {item.dias_para_ruptura} dias
                                </span>
                              </div>
                            </div>

                            {/* Risk description text */}
                            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                              <strong className="text-white">Justificativa:</strong> {item.justificativa}
                            </p>
                          </div>

                          {/* Purchase Recommendation Actions */}
                          <div className="pt-4 border-t border-neutral-800/80 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="text-[10px] text-neutral-500 font-mono">SUGESTÃO DE COMPRA</div>
                              <div className="font-bold text-white text-sm mt-0.5">
                                {item.quantidade_recomendada} un. <span className="text-neutral-400 text-xs font-normal">(Custo Est: R$ {item.custo_estimado?.toFixed(2)})</span>
                              </div>
                            </div>
                            <button
                              onClick={() => openActionModal("purchase_email", item)}
                              className="px-4 py-2 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-xl text-xs font-semibold hover:bg-emerald-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5" /> Enviar p/ Fornecedor
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: PROMOÇÕES & GIRO */}
              {activeInsightTab === "promocoes" && (
                <div className="space-y-6">
                  <div className="bg-neutral-900/40 p-4 border border-neutral-900 rounded-xl flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-emerald-400" />
                    <p className="text-xs text-neutral-300">
                      Estes itens possuem <strong>baixo giro histórico</strong> ou estão <strong>próximos da data de vencimento</strong>. A IA formulou campanhas direcionadas para destravar esse capital antes que o produto se torne perda.
                    </p>
                  </div>

                  {results.insights_promocoes?.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-2xl">
                      Nenhuma promoção ou risco de perda detectado. O estoque está rodando de forma saudável!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.insights_promocoes?.map((item: any, idx: number) => {
                        return (
                          <div
                            key={idx}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="text-xs font-mono text-neutral-500">{item.produto_id}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-900/30 font-mono tracking-wider">
                                  RISCO: {item.motivo_risco?.split(" ")[0]}
                                </span>
                              </div>

                              <h4 className="font-bold text-white text-base mb-1">{item.nome}</h4>
                              <div className="text-xs text-rose-400 font-mono mb-4 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Motivo: {item.motivo_risco}
                              </div>

                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 mb-4 space-y-2.5">
                                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-semibold flex items-center gap-1 text-emerald-400">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Estratégia Recomendada
                                </div>
                                <div className="text-xs text-white font-bold">{item.estrategia_sugerida}</div>
                                <p className="text-xs text-neutral-300 leading-relaxed">
                                  {item.detalhes_campanha}
                                </p>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-neutral-800/80 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="text-[10px] text-neutral-500 font-mono">RETORNO ESTIMADO (RECUPERAÇÃO)</div>
                                <div className="font-bold text-emerald-400 text-sm mt-0.5">
                                  R$ {item.retorno_esperado_estimado?.toFixed(2)} <span className="text-neutral-500 font-mono text-xs">({item.markup_ajustado} markup)</span>
                                </div>
                              </div>
                              <button
                                onClick={() => openActionModal("promo_activation", item)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Ativar no PDV / ERP
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 3: CONSULTOR DE COMPRAS CHATBOT */}
              {activeInsightTab === "chat" && (
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-emerald-400" />
                      Consultor Virtual de Suprimentos
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Tire dúvidas específicas sobre o inventário, elabore roteiros de negociação para fornecedores, ou peça receitas customizadas baseadas nos ingredientes próximos do vencimento.
                    </p>
                  </div>

                  {/* Chat Box */}
                  <div className="bg-neutral-950 rounded-xl border border-neutral-850 p-4 h-[320px] overflow-y-auto space-y-4 flex flex-col" id="chat-messages-box">
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed",
                          msg.sender === "user"
                            ? "bg-emerald-600 text-white self-end rounded-tr-none"
                            : "bg-neutral-900 text-neutral-200 border border-neutral-800 self-start rounded-tl-none"
                        )}
                      >
                        <div className="font-semibold text-[10px] uppercase font-mono mb-1 text-neutral-400">
                          {msg.sender === "user" ? "Você (Gestor)" : "Analista Virtual"}
                        </div>
                        <div className="whitespace-pre-line">{msg.text}</div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="bg-neutral-900 text-neutral-400 border border-neutral-850 p-3 rounded-2xl self-start text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        Digitando...
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ex: Como posso argumentar por desconto no pepperoni devido à validade de 20 dias?"
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-neutral-500 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatMessage.trim()}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar
                    </button>
                  </form>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* QUICK ACTION DRAWER / MODAL */}
      <AnimatePresence>
        {modalOpen && modalType && selectedItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="action-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="border-b border-neutral-800 p-5 bg-neutral-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-white text-base">
                    {modalType === "purchase_email" ? "Rascunho de Ordem de Compra por IA" : "Ativação no PDV & CRM"}
                  </h4>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-white font-mono text-sm px-2 py-1 rounded hover:bg-neutral-800 transition-all"
                >
                  Fechar
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {modalType === "purchase_email" ? (
                  /* PURCHASE EMAIL TEMPLATE */
                  <div className="space-y-4">
                    <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl space-y-2 text-xs">
                      <div>
                        <span className="text-neutral-500 font-mono uppercase block text-[10px]">Destinatário do ERP</span>
                        <span className="text-white font-semibold">Fornecedor Distribuidor Oficial ({currentScenario.contato_compras})</span>
                      </div>
                      <div className="border-t border-neutral-900 pt-2">
                        <span className="text-neutral-500 font-mono uppercase block text-[10px]">Assunto do E-mail</span>
                        <span className="text-white font-semibold">Urgente: Solicitação de Cotação de Reabastecimento - {currentScenario.nome_fantasia}</span>
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-4 rounded-xl font-mono text-[11px] text-neutral-300 border border-neutral-850 whitespace-pre-line leading-relaxed h-[200px] overflow-y-auto">
                      Prezada Distribuidora,

                      Gostaríamos de solicitar cotação urgente para reabastecimento do item abaixo, conforme nosso planejamento logístico preditivo:

                      - Item: {selectedItem.nome} (Ref: {selectedItem.produto_id})
                      - Quantidade Solicitada: {selectedItem.quantidade_recomendada} unidades
                      - Prazo de Entrega Máximo: 48 horas (Risco de Ruptura Eminente)

                      Favor nos enviar o orçamento consolidado de custo e faturamento para o e-mail {currentScenario.contato_compras} com cópia para nossa diretoria de suprimentos.

                      Atenciosamente,
                      Departamento de Compras e Suprimentos
                      {currentScenario.nome_fantasia}
                    </div>
                  </div>
                ) : (
                  /* PROMO ACTIVATION PANEL */
                  <div className="space-y-4">
                    <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
                      <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                      <div>
                        <strong className="text-white block mb-0.5">Campanha: {selectedItem.estrategia_sugerida}</strong>
                        {selectedItem.detalhes_campanha}
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3.5 text-xs">
                      <div className="flex justify-between border-b border-neutral-900 pb-2">
                        <span className="text-neutral-400">ID do Item no Checkout</span>
                        <span className="font-mono text-white">{selectedItem.produto_id}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900 pb-2">
                        <span className="text-neutral-400">Volume de Estoque Liberado</span>
                        <span className="text-white font-bold">{selectedItem.estoque_atual} unidades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Previsão de Caixa Recuperado</span>
                        <span className="text-emerald-400 font-bold font-mono">R$ {selectedItem.retorno_esperado_estimado?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated action completion message */}
                {simulationStatus === "success" && (
                  <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Ação integrada ao ERP e PDV com sucesso! O simulador confirmou a transação.</span>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="border-t border-neutral-800 p-5 bg-neutral-950 flex justify-end gap-3 text-xs">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl font-medium transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={simulateERPAction}
                  disabled={simulationStatus === "success" || simulationStatus === "loading"}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:text-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  {simulationStatus === "loading" ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processando...
                    </>
                  ) : simulationStatus === "success" ? (
                    "Concluído"
                  ) : (
                    "Confirmar Ação de BI"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-500 mt-16" id="dashboard-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p>© 2026 SaaS STOCK.BI Inc. Todos os direitos reservados. Motor de Inteligência Artificial preditiva integrado.</p>
          <div className="flex gap-4">
            <span className="hover:text-neutral-400 transition-all cursor-pointer">Segurança de Dados</span>
            <span>•</span>
            <span className="hover:text-neutral-400 transition-all cursor-pointer">Privacidade (GDPR/LGPD)</span>
            <span>•</span>
            <span className="hover:text-neutral-400 transition-all cursor-pointer">Termos do Serviço</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
