import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getSecurityHeaders, verifyToken, checkRateLimit, validateInputAndTenant, sanitizePII } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { allowed, headers } = getSecurityHeaders(req);
  if (!allowed) {
    return NextResponse.json({ sucesso: false, erro: "Origem não autorizada (CORS)." }, { status: 403, headers });
  }

  try {
    // 1. JWT Authentication
    const authHeader = req.headers.get("Authorization");
    const tokenData = verifyToken(authHeader || "");
    if (!tokenData) {
      return NextResponse.json({ sucesso: false, erro: "Acesso negado: Token inválido, expirado ou revogado pós-logout." }, { status: 401, headers });
    }

    // 2. Rate Limiting (IP + Conta)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(ip, tokenData.email);
    if (!rateLimit.allowed) {
      return NextResponse.json({ sucesso: false, erro: "Limite de requisições excedido (Rate Limit por IP + Conta)." }, { status: 429, headers });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        sucesso: false,
        erro: "Configuração ausente: A variável de ambiente GEMINI_API_KEY não foi configurada. Configure a sua chave de API nas configurações do Vercel ou do AI Studio para ativar as análises com inteligência artificial."
      }, { status: 500, headers });
    }

    // Initialize the GoogleGenAI client on the server side
    // Set the User-Agent header to 'aistudio-build' in httpOptions for telemetry
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const body = await req.json();
    const { id_cliente, historico_vendas, niveis_estoque, fichas_tecnicas, alertas_validade } = body;

    // 3. IDOR and SQLi prevention
    const inputValidation = validateInputAndTenant(id_cliente, tokenData.id_cliente);
    if (!inputValidation.valid) {
      return NextResponse.json({ sucesso: false, erro: inputValidation.error }, { status: 403, headers });
    }

    // Validation for Tenant ID and Data consistency
    if (!id_cliente || id_cliente.trim() === "") {
      return NextResponse.json({
        sucesso: false,
        erro: "ID de cliente ausente. Para segurança e privacidade (Multitenancy), o ID do cliente deve ser informado para isolar o contexto.",
      }, { status: 400, headers });
    }

    if (!historico_vendas || !niveis_estoque) {
      return NextResponse.json({
        sucesso: false,
        erro: "Dados de inventário e vendas inconsistentes ou ausentes. Verifique o formato do JSON de entrada.",
      }, { status: 400, headers });
    }

    // Prepare system instructions for strictly structured, isolated, single-tenant context
    const systemInstruction = `
      Você é o motor de inteligência artificial de uma plataforma SaaS avançada de gestão de estoque e BI preditivo.
      Sua função é atuar como um Analista de Suprimentos e Compras Virtual altamente experiente para empresas do varejo e food service.

      DIRETRIZES CRÍTICAS DE SEGURANÇA E PRIVACIDADE (MULTITENANCY):
      1. Você processará apenas os dados contidos explicitamente no JSON de entrada.
      2. Nunca misture informações ou assuma dados de outros clientes. Cada requisição é estritamente isolada e privativa (Single-Tenant Context).
      3. O ID do cliente fornecido na requisição é: ${id_cliente}. Certifique-se de que todas as respostas façam referência apenas a este cliente e seus dados específicos.

      OBJETIVO DA ANÁLISE:
      Gere insights acionáveis e de alto valor financeiro (sem relatórios prolixos):
      1. INSIGHTS DE COMPRAS (Previsão de Demanda e Ruptura): Identifique quais produtos vão acabar com base no ritmo de vendas atual e sazonalidade. Sugira a quantidade ideal de compra, custo estimado e nível de urgência.
      2. INSIGHTS DE PROMOÇÕES (Prevenção de Desperdício e Giro de Estoque): Identifique produtos parados no estoque (baixo giro) ou próximos do vencimento. Sugira estratégias promocionais agressivas, combos inteligentes para aproveitar insumos, ou descontos para recuperar capital de giro.

      FORMATO DE RETORNO:
      Você deve responder ESTREITAMENTE em formato JSON que obedece ao esquema fornecido. Não inclua nenhuma introdução, explicação textual ou comentários fora do JSON.
    `;

    // Define response schema for high fidelity rendering
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        id_cliente: { type: Type.STRING },
        data_analise: { type: Type.STRING },
        metatags: {
          type: Type.OBJECT,
          properties: {
            total_itens_analisados: { type: Type.INTEGER },
            itens_compras_recomendadas: { type: Type.INTEGER },
            itens_promocoes_recomendadas: { type: Type.INTEGER },
            capital_risco_estimado: { type: Type.NUMBER },
          },
          required: ["total_itens_analisados", "itens_compras_recomendadas", "itens_promocoes_recomendadas", "capital_risco_estimado"]
        },
        insights_compras: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              produto_id: { type: Type.STRING },
              nome: { type: Type.STRING },
              estoque_atual: { type: Type.NUMBER },
              ritmo_vendas_diario: { type: Type.NUMBER },
              dias_para_ruptura: { type: Type.NUMBER },
              urgencia: { type: Type.STRING, description: "CRÍTICA, ALTA, MÉDIA ou BAIXA" },
              quantidade_recomendada: { type: Type.NUMBER },
              custo_estimado: { type: Type.NUMBER },
              justificativa: { type: Type.STRING },
              plano_acao: { type: Type.STRING },
            },
            required: ["produto_id", "nome", "estoque_atual", "ritmo_vendas_diario", "dias_para_ruptura", "urgencia", "quantidade_recomendada", "custo_estimado", "justificativa", "plano_acao"]
          }
        },
        insights_promocoes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              produto_id: { type: Type.STRING },
              nome: { type: Type.STRING },
              estoque_atual: { type: Type.NUMBER },
              motivo_risco: { type: Type.STRING },
              estrategia_sugerida: { type: Type.STRING },
              detalhes_campanha: { type: Type.STRING },
              retorno_esperado_estimado: { type: Type.NUMBER },
              markup_ajustado: { type: Type.STRING },
            },
            required: ["produto_id", "nome", "estoque_atual", "motivo_risco", "estrategia_sugerida", "detalhes_campanha", "retorno_esperado_estimado", "markup_ajustado"]
          }
        },
        resumo_financeiro: {
          type: Type.OBJECT,
          properties: {
            custo_total_reposicao: { type: Type.NUMBER },
            recuperacao_capital_giro: { type: Type.NUMBER },
            roi_estimado_campanhas: { type: Type.NUMBER },
          },
          required: ["custo_total_reposicao", "recuperacao_capital_giro", "roi_estimado_campanhas"]
        },
        mensagens_analista: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["id_cliente", "data_analise", "metatags", "insights_compras", "insights_promocoes", "resumo_financeiro", "mensagens_analista"]
    };

    const prompt = `
      Aqui estão os dados estruturados do cliente ${id_cliente}:
      ${JSON.stringify({ historico_vendas, niveis_estoque, fichas_tecnicas, alertas_validade }, null, 2)}

      Por favor, processe estes dados. Lembre-se: analise o ritmo de vendas diário para prever quando o estoque vai zerar (dias_para_ruptura). Recomende quantidades para cobrir a demanda (por exemplo, suprir 15 a 30 dias de operação).
      Para produtos que estão parados no estoque (baixo giro) ou que possuem alertas de validade próximos do vencimento, sugira estratégias promocionais focadas em recuperar o capital de giro investido.
      Mantenha rigor absoluto no isolamento multi-tenant.
    `;

    // Generate content using gemini-3.5-flash as the standard model for structured JSON tasks
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2, // Lower temperature to ensure structured data is precise and stable
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("O modelo não retornou nenhum texto de análise.");
    }

    const parsedResponse = JSON.parse(text);
    const sanitizedResponse = sanitizePII(parsedResponse);

    return NextResponse.json({
      sucesso: true,
      data: sanitizedResponse
    }, { headers });

  } catch (error: any) {
    console.error("Erro na rota de análise:", error);
    
    // Parse the error to provide a friendly message to the end user
    const errorStr = String(error?.message || error || "");
    const status = error?.status || error?.code || error?.error?.code || "";
    let friendlyError = error?.message || "Erro interno ao processar a análise preditiva.";
    
    if (status === 503 || errorStr.includes("503") || errorStr.toLowerCase().includes("unavailable") || errorStr.toLowerCase().includes("high demand") || errorStr.toLowerCase().includes("overloaded")) {
      friendlyError = "O servidor da Inteligência Artificial (Google Gemini) está temporariamente sob alta demanda (Erro 503). Por favor, aguarde alguns segundos e clique em 'Gerar Nova Análise Preditiva' novamente.";
    } else if (status === 429 || errorStr.includes("429") || errorStr.toLowerCase().includes("quota") || errorStr.toLowerCase().includes("limit exceeded") || errorStr.toLowerCase().includes("rate limit")) {
      friendlyError = "Limite de cota de requisições de IA excedido temporariamente (Erro 429). Por favor, aguarde um minuto e tente novamente.";
    } else if (status === 400 || errorStr.includes("400") || errorStr.toLowerCase().includes("bad request") || errorStr.toLowerCase().includes("api key")) {
      friendlyError = "Erro de configuração ou parâmetros inválidos na requisição de IA (Erro 400). Por favor, verifique se a sua chave GEMINI_API_KEY está configurada corretamente nas configurações.";
    }

    return NextResponse.json({
      sucesso: false,
      erro: friendlyError
    }, { status: 500, headers });
  }
}
