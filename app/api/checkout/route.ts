import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, returnUrl } = body;

    if (!email) {
      return NextResponse.json(
        { sucesso: false, erro: "O e-mail do usuário é obrigatório." },
        { status: 400 }
      );
    }

    // Lazy load keys with fallback to provided credentials
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-4454124343684869-063015-daab736f937a55c31aa473aa6dd93f44-48423481";
    const fallbackLink = process.env.NEXT_PUBLIC_MERCADO_PAGO_LINK || "https://mpago.la/1r2Bdr8";
    
    // Fallback URL if returnUrl is not provided
    const baseRedirectUrl = returnUrl || "https://stockbi.app";

    try {
      // call Mercado Pago API to create payment preference
      const response = await fetch("https://api.mercadopago.com/v1/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: [
            {
              id: "stock_bi_unlimited",
              title: "STOCK.BI - Assinatura Mensal Ilimitada",
              quantity: 1,
              unit_price: 99.00,
              currency_id: "BRL"
            }
          ],
          payer: {
            email: email
          },
          back_urls: {
            success: `${baseRedirectUrl}?payment_status=success&session_id=mp_${Date.now()}`,
            failure: `${baseRedirectUrl}?payment_status=failure`,
            pending: `${baseRedirectUrl}?payment_status=pending`
          },
          auto_return: "approved"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na API do Mercado Pago:", errorText);
        // Fallback to static link
        return NextResponse.json({
          sucesso: true,
          checkoutUrl: fallbackLink
        });
      }

      const data = await response.json();
      const checkoutUrl = data.init_point || data.sandbox_init_point || fallbackLink;

      return NextResponse.json({
        sucesso: true,
        checkoutUrl: checkoutUrl
      });
    } catch (mpError) {
      console.error("Erro ao chamar API de preferência, usando link estático:", mpError);
      return NextResponse.json({
        sucesso: true,
        checkoutUrl: fallbackLink
      });
    }
  } catch (error: any) {
    console.error("Erro na rota de checkout do Mercado Pago:", error);
    return NextResponse.json(
      { sucesso: false, erro: error.message || "Erro interno ao processar checkout." },
      { status: 500 }
    );
  }
}

