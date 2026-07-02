import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, method = "GET", headers = {}, body = null } = await req.json();

    if (!url) {
      return NextResponse.json({ sucesso: false, erro: "A URL do endpoint da API é obrigatória." }, { status: 400 });
    }

    // Validate that it looks like a URL
    try {
      new URL(url);
    } catch (_) {
      return NextResponse.json({ sucesso: false, erro: "A URL fornecida é inválida." }, { status: 400 });
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
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      sucesso: true,
      raw_data: data
    });

  } catch (error: any) {
    console.error("Erro no proxy de sincronização:", error);
    return NextResponse.json({
      sucesso: false,
      erro: error.message || "Falha ao se conectar com a API externa."
    }, { status: 500 });
  }
}
