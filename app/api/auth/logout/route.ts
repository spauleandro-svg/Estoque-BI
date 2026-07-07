import { NextRequest, NextResponse } from "next/server";
import { revokeToken, getSecurityHeaders } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { allowed, headers } = getSecurityHeaders(req);
  if (!allowed) {
    return NextResponse.json({ sucesso: false, erro: "Origem não autorizada (CORS)." }, { status: 403, headers });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      revokeToken(authHeader);
    }

    return NextResponse.json({
      sucesso: true,
      msg: "Token revogado e sessão encerrada com sucesso."
    }, { headers });

  } catch (err: any) {
    return NextResponse.json({
      sucesso: false,
      erro: err.message || "Erro ao efetuar logout."
    }, { status: 500, headers });
  }
}
