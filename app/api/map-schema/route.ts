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
        erro: "Configuração ausente: A variável de ambiente GEMINI_API_KEY não foi configurada. Configure a sua chave de API nas configurações do Vercel ou do AI Studio para ativar o mapeamento de planilhas com inteligência artificial."
      }, { status: 500, headers });
    }

    // Initialize Gemini SDK with custom User-Agent and proper credentials
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const { raw_data } = await req.json();

    if (!raw_data) {
      return NextResponse.json({ sucesso: false, erro: "Os dados brutos (raw_data) são necessários para o mapeamento." }, { status: 400, headers });
    }

    // 3. SQLi & Input Validation
    const rawDataStr = typeof raw_data === "string" ? raw_data : JSON.stringify(raw_data);
    const inputValidation = validateInputAndTenant(rawDataStr, tokenData.id_cliente);
    // Note: raw data could contain references to other tenant IDs, but we will force the mapped scenario to carry the token's authorized id_cliente
    if (!inputValidation.valid) {
      return NextResponse.json({ sucesso: false, erro: inputValidation.error }, { status: 403, headers });
    }

    const prompt = `
Você é o motor de inteligência artificial de mapeamento de esquemas do SaaS STOCK.BI.
O cliente forneceu dados de um ERP externo em formato JSON livre (raw_data).
Seu trabalho é converter e estruturar este JSON exatamente sob o esquema "ClientScenario" abaixo, mapeando inteligentemente nomes de atributos aproximados (ex: cod_ref -> id, preco_custo_unitario -> custo_unitario, etc.).

Caso o JSON de entrada não possua certos campos, tente estimar ou criar valores fictícios realistas e consistentes (ex: id_cliente se não houver pode ser "CLIENT-AUTO-123", nome_fantasia pode ser o nome da empresa, segmento "Varejo", etc.).

Garanta consistência relacional:
1. "niveis_estoque": lista de itens em estoque. Cada um deve ter:
   - "id": string identificadora única.
   - "nome": string legível do produto.
   - "estoque_atual": number representando a quantidade atual.
   - "unidade": string como "kg", "latas", "unidades", "pacotes", etc.
   - "custo_unitario": number representando o preço de custo unitário.
   - "data_validade": string opcional em formato "YYYY-MM-DD" se aplicável.
2. "historico_vendas": lista contendo a performance de vendas dos mesmos itens de "niveis_estoque":
   - "produto_id": string id do item (deve bater exatamente com o "id" em niveis_estoque!).
   - "nome": string idêntica ao nome em niveis_estoque.
   - "quantidade_vendida_30_dias": number com as vendas acumuladas.
   - "media_diaria": number igual a (quantidade_vendida_30_dias / 30) aproximado.
   - "vendas_sazonal_fim_de_semana_fator": number (ex: 1.0 a 2.5). Se não houver, assuma 1.0.
3. "alertas_validade": itens com data_validade próxima ou com problemas relatados:
   - "produto_id": string id do produto (bater com id).
   - "nome": string nome do produto.
   - "lote": string contendo o lote do produto (se não houver, crie um como "L-AUTO-XYZ").
   - "quantidade_afetada": number (fração ou valor total do estoque_atual).
   - "data_vencimento": string em formato "YYYY-MM-DD" (deve coincidir com data_validade).
4. "fichas_tecnicas": receitas (opcional, só se houver correspondência no JSON original):
   - "id": string id da receita (ex: "REC-01").
   - "nome_prato": string nome do prato principal.
   - "ingredientes": lista de ingrediente com { "produto_id", "quantidade", "unidade" }.

Aqui estão os dados brutos recebidos da API externa do cliente:
\`\`\`json
${JSON.stringify(raw_data, null, 2)}
\`\`\`

Retorne o resultado estritamente seguindo o formato JSON do "ClientScenario", sem formatação markdown extra, apenas o JSON válido.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id_cliente: { type: Type.STRING, description: "ID único do cliente" },
            nome_fantasia: { type: Type.STRING, description: "Nome comercial/fantasia" },
            segmento: { type: Type.STRING, description: "Segmento de mercado" },
            contato_compras: { type: Type.STRING, description: "Email de contato de compras" },
            niveis_estoque: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  nome: { type: Type.STRING },
                  estoque_atual: { type: Type.NUMBER },
                  unidade: { type: Type.STRING },
                  custo_unitario: { type: Type.NUMBER },
                  data_validade: { type: Type.STRING }
                },
                required: ["id", "nome", "estoque_atual", "unidade", "custo_unitario"]
              }
            },
            historico_vendas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  produto_id: { type: Type.STRING },
                  nome: { type: Type.STRING },
                  quantidade_vendida_30_dias: { type: Type.NUMBER },
                  media_diaria: { type: Type.NUMBER },
                  vendas_sazonal_fim_de_semana_fator: { type: Type.NUMBER }
                },
                required: ["produto_id", "nome", "quantidade_vendida_30_dias", "media_diaria", "vendas_sazonal_fim_de_semana_fator"]
              }
            },
            alertas_validade: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  produto_id: { type: Type.STRING },
                  nome: { type: Type.STRING },
                  lote: { type: Type.STRING },
                  quantidade_afetada: { type: Type.NUMBER },
                  data_vencimento: { type: Type.STRING }
                },
                required: ["produto_id", "nome", "lote", "quantidade_afetada", "data_vencimento"]
              }
            },
            fichas_tecnicas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  nome_prato: { type: Type.STRING },
                  ingredientes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        produto_id: { type: Type.STRING },
                        quantidade: { type: Type.NUMBER },
                        unidade: { type: Type.STRING }
                      },
                      required: ["produto_id", "quantidade", "unidade"]
                    }
                  }
                },
                required: ["id", "nome_prato", "ingredientes"]
              }
            }
          },
          required: ["id_cliente", "nome_fantasia", "segmento", "contato_compras", "niveis_estoque", "historico_vendas", "alertas_validade"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Não foi possível obter resposta do motor inteligente.");
    }

    const mappedScenario = JSON.parse(resultText);
    
    // Ensure the mapped id_cliente conforms to user's token tenant ID to prevent IDOR spoofing
    if (tokenData.id_cliente) {
      mappedScenario.id_cliente = tokenData.id_cliente;
    }

    const sanitizedScenario = sanitizePII(mappedScenario);

    return NextResponse.json({
      sucesso: true,
      mapped_scenario: sanitizedScenario
    }, { headers });

  } catch (error: any) {
    console.error("Erro no mapeamento com IA:", error);
    return NextResponse.json({
      sucesso: false,
      erro: error.message || "Erro desconhecido ao mapear com IA."
    }, { status: 500, headers });
  }
}
