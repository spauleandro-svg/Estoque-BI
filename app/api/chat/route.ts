import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { message, id_cliente, scenario_data, analyzed_insights, chat_history } = await req.json();

    if (!id_cliente) {
      return NextResponse.json({ error: "ID de cliente ausente." }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      text: response.text
    });

  } catch (error: any) {
    console.error("Erro na rota do chatbot:", error);
    return NextResponse.json({ error: error.message || "Erro interno no chat" }, { status: 500 });
  }
}
