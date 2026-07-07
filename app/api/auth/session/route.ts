import { NextRequest, NextResponse } from "next/server";
import { generateToken, getSecurityHeaders } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { allowed, headers } = getSecurityHeaders(req);
  if (!allowed) {
    return NextResponse.json({ sucesso: false, erro: "Origem não autorizada (CORS)." }, { status: 403, headers });
  }

  try {
    const { email, name, id_cliente } = await req.json();
    
    if (!email || !name) {
      return NextResponse.json({ sucesso: false, erro: "E-mail e nome são obrigatórios." }, { status: 400, headers });
    }

    const token = generateToken({ email, name, id_cliente });

    return NextResponse.json({
      sucesso: true,
      token,
      msg: "Sessão autenticada com sucesso."
    }, { headers });

  } catch (err: any) {
    return NextResponse.json({
      sucesso: false,
      erro: err.message || "Erro interno de autenticação."
    }, { status: 500, headers });
  }
}
