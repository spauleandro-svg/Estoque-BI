import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getSecurityHeaders, verifyToken, checkRateLimit, validateInputAndTenant, sanitizePII } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { allowed, headers } = getSecurityHeaders(req);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Origem não autorizada (CORS)." }, { status: 403, headers });
  }

  try {
    // 1. JWT Authentication
    const authHeader = req.headers.get("Authorization");
    const tokenData = verifyToken(authHeader || "");
    if (!tokenData) {
      return NextResponse.json({ success: false, error: "Acesso negado: Token inválido, expirado ou revogado pós-logout." }, { status: 401, headers });
    }

    // 2. Rate Limiting (IP + Conta)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(ip, tokenData.email);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Limite de requisições excedido (Rate Limit por IP + Conta)." }, { status: 429, headers });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Configuração ausente: A variável de ambiente GEMINI_API_KEY não foi configurada. Configure a sua chave de API nas configurações do Vercel ou do AI Studio para ativar o chat de consultoria com IA."
      }, { status: 500, headers });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const { message, id_cliente, scenario_data, analyzed_insights, chat_history } = await req.json();

    // 3. IDOR and SQLi prevention
    const inputValidation = validateInputAndTenant(id_cliente, tokenData.id_cliente);
    if (!inputValidation.valid) {
      return NextResponse.json({ success: false, error: inputValidation.error }, { status: 403, headers });
    }

    if (!id_cliente) {
      return NextResponse.json({ error: "ID de cliente ausente." }, { status: 400, headers });
    }

    const systemInstruction = `
      Você é o Analista de Suprimentos e Compras Virtual do sistema SaaS de gestão de estoque e BI preditivo.
      Você está conversando com o gestor de compras do cliente com ID: ${id_cliente}.

      SEU PERFIL:
      - Altamente profissional, experiente em logística, gestão de suprimentos, negociação com fornecedores e técnicas de prevenção de perdas no varejo e food service.
      - Focado em decisões de alto retorno financeiro (ROI), otimização do capital de giro e mitigação de rupturas de estoque.
      - Respostas diretas, práticas, em português (Brasil), sem rodeios burocráticos.

      ISOLAMENTO E PRIVACIDADE (MULTITENANCY):
      - Você tem acesso aos dados atuais do inventário do cliente e aos insights preditivos que acabaram de ser gerados.
      - Responda de forma extremamente contextualizada para esta empresa especificamente. Nunca faça referências a marcas, fornecedores ou dados que não pertencem ao contexto deste cliente.

      DADOS DO CLIENTE E INSIGHTS ATUAIS:
      Dados atuais: ${JSON.stringify(scenario_data)}
      Insights gerados: ${JSON.stringify(analyzed_insights)}
    `;

    // Formulate previous messages for chat history
    const contents = [];
    if (chat_history && chat_history.length > 0) {
      for (const msg of chat_history) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const sanitizedText = sanitizePII(response.text);

    return NextResponse.json({
      success: true,
      text: sanitizedText
    }, { headers });

  } catch (error: any) {
    console.error("Erro na rota do chatbot:", error);
    
    // Parse the error to provide a friendly message to the end user
    const errorStr = String(error?.message || error || "");
    const status = error?.status || error?.code || error?.error?.code || "";
    let friendlyError = error?.message || "Erro interno no chat";
    
    if (status === 503 || errorStr.includes("503") || errorStr.toLowerCase().includes("unavailable") || errorStr.toLowerCase().includes("high demand") || errorStr.toLowerCase().includes("overloaded")) {
      friendlyError = "O servidor do Chat de Inteligência Artificial (Google Gemini) está temporariamente sob alta demanda (Erro 503). Por favor, aguarde alguns segundos e tente enviar sua mensagem novamente.";
    } else if (status === 429 || errorStr.includes("429") || errorStr.toLowerCase().includes("quota") || errorStr.toLowerCase().includes("limit exceeded") || errorStr.toLowerCase().includes("rate limit")) {
      friendlyError = "Limite de cota de requisições de Chat de IA excedido temporariamente (Erro 429). Por favor, aguarde um minuto e tente novamente.";
    } else if (status === 400 || errorStr.includes("400") || errorStr.toLowerCase().includes("bad request") || errorStr.toLowerCase().includes("api key")) {
      friendlyError = "Erro de configuração ou parâmetros inválidos no Chat (Erro 400). Por favor, verifique se a chave GEMINI_API_KEY está configurada corretamente.";
    }

    return NextResponse.json({ error: friendlyError }, { status: 500, headers });
  }
}
