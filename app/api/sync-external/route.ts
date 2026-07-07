import { NextRequest, NextResponse } from "next/server";
import { getSecurityHeaders, verifyToken, checkRateLimit, sanitizePII, validateInputAndTenant } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { allowed, headers: secHeaders } = getSecurityHeaders(req);
  if (!allowed) {
    return NextResponse.json({ sucesso: false, erro: "Origem não autorizada (CORS)." }, { status: 403, headers: secHeaders });
  }

  try {
    // 1. JWT Authentication
    const authHeader = req.headers.get("Authorization");
    const tokenData = verifyToken(authHeader || "");
    if (!tokenData) {
      return NextResponse.json({ sucesso: false, erro: "Acesso negado: Token inválido, expirado ou revogado pós-logout." }, { status: 401, headers: secHeaders });
    }

    // 2. Rate Limiting (IP + Conta)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(ip, tokenData.email);
    if (!rateLimit.allowed) {
      return NextResponse.json({ sucesso: false, erro: "Limite de requisições excedido (Rate Limit por IP + Conta)." }, { status: 429, headers: secHeaders });
    }

    const { url, method = "GET", headers = {}, body = null } = await req.json();

    if (!url) {
      return NextResponse.json({ sucesso: false, erro: "A URL do endpoint da API é obrigatória." }, { status: 400, headers: secHeaders });
    }

    // Validate that it looks like a URL & SQLi Check
    try {
      new URL(url);
    } catch (_) {
      return NextResponse.json({ sucesso: false, erro: "A URL fornecida é inválida." }, { status: 400, headers: secHeaders });
    }

    const validation = validateInputAndTenant(url, tokenData.id_cliente);
    if (!validation.valid) {
      return NextResponse.json({ sucesso: false, erro: validation.error }, { status: 403, headers: secHeaders });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    if (method !== "GET" && body) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return NextResponse.json({
        sucesso: false,
        erro: `A API externa retornou o status ${response.status}: ${response.statusText}`
      }, { status: response.status, headers: secHeaders });
    }

    const data = await response.json();
    
    // 3. PII Sanitization (retorna só o necessário)
    const sanitizedData = sanitizePII(data);

    return NextResponse.json({
      sucesso: true,
      raw_data: sanitizedData
    }, { headers: secHeaders });

  } catch (error: any) {
    console.error("Erro no proxy de sincronização:", error);
    return NextResponse.json({
      sucesso: false,
      erro: error.message || "Falha ao se conectar com a API externa."
    }, { status: 500, headers: secHeaders });
  }
}
