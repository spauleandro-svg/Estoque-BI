import { NextResponse } from "next/server";

export async function GET() {
  // Simulates a real-world external ERP database payload (e.g., Shopify, Totvs, or Omie) with slightly different field names
  // to prove that our AI Auto-Mapper works!
  const externalERPData = {
    empresa: "Bella Pizza & Pasta Ltda",
    cnpj_identificacao: "45.922.102/0001-90",
    contato_gerente: "pizzaria_bella@erp-external.com",
    setor_atuacao: "Alimentos e Bebidas",
    items_inventario: [
      {
        cod_ref: "SKU-MZ-992",
        titulo_produto: "Queijo Mozarela Fatiado",
        quantidade_disponivel: 45.5,
        medida: "kg",
        preco_custo_unitario: 34.50,
        vencimento: "2026-07-12"
      },
      {
        cod_ref: "SKU-TM-112",
        titulo_produto: "Polpa de Tomate Italiana",
        quantidade_disponivel: 5,
        medida: "latas",
        preco_custo_unitario: 15.00,
        vencimento: "2026-11-20"
      },
      {
        cod_ref: "SKU-FT-881",
        titulo_produto: "Farinha Especial Tipo 00",
        quantidade_disponivel: 3,
        medida: "kg",
        preco_custo_unitario: 9.20,
        vencimento: "2026-09-15"
      },
      {
        cod_ref: "SKU-PP-441",
        titulo_produto: "Pepperoni Premium Defumado",
        quantidade_disponivel: 42.0,
        medida: "kg",
        preco_custo_unitario: 72.00,
        vencimento: "2026-07-18"
      },
      {
        cod_ref: "SKU-MJ-002",
        titulo_produto: "Manjericão Orgânico Fresco",
        quantidade_disponivel: 0.2,
        medida: "kg",
        preco_custo_unitario: 25.00,
        vencimento: "2026-07-02"
      }
    ],
    vendas_mensais: [
      { sku: "SKU-MZ-992", total_vendido_30_dias: 180, media_diaria_calculada: 6.0 },
      { sku: "SKU-TM-112", total_vendido_30_dias: 150, media_diaria_calculada: 5.0 },
      { sku: "SKU-FT-881", total_vendido_30_dias: 270, media_diaria_calculada: 9.0 },
      { sku: "SKU-PP-441", total_vendido_30_dias: 12, media_diaria_calculada: 0.4 },
      { sku: "SKU-MJ-002", total_vendido_30_dias: 45, media_diaria_calculada: 1.5 }
    ],
    alertas_qualidade: [
      {
        sku_afetado: "SKU-MZ-992",
        lote_interno: "LT-MZ-A1",
        quantidade: 35,
        vencimento_lote: "2026-07-12"
      }
    ],
    receitas_producao: [
      {
        nome_prato: "Pizza Suprema",
        ingredientes_usados: [
          { sku: "SKU-MZ-992", qtd: 0.35, unit: "kg" },
          { sku: "SKU-TM-112", qtd: 0.25, unit: "latas" },
          { sku: "SKU-FT-881", qtd: 0.30, unit: "kg" }
        ]
      }
    ]
  };

  return NextResponse.json(externalERPData);
}
