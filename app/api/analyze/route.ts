import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        sucesso: false,
        erro: "Configuração ausente: A variável de ambiente GEMINI_API_KEY não foi configurada. Configure a sua chave de API nas configurações do Vercel ou do AI Studio para ativar as análises com inteligência artificial."
      }, { status: 500 });
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

    // 1. Validation for Tenant ID and Data consistency
    if (!id_cliente || id_cliente.trim() === "") {
      return NextResponse.json({
        sucesso: false,
        erro: "ID de cliente ausente. Para segurança e privacidade (Multitenancy), o ID do cliente deve ser informado para isolar o contexto.",
      }, { status: 400 });
    }

    if (!historico_vendas || !niveis_estoque) {
      return NextResponse.json({
        sucesso: false,
        erro: "Dados de inventário e vendas inconsistentes ou ausentes. Verifique o formato do JSON de entrada.",
      }, { status: 400 });
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

    return NextResponse.json({
      sucesso: true,
      data: parsedResponse
    });

  } catch (error: any) {
    console.error("Erro na rota de análise:", error);
    return NextResponse.json({
      sucesso: false,
      erro: error.message || "Erro interno ao processar a análise preditiva."
    }, { status: 500 });
  }
}
