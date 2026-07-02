export interface StockItem {
  id: string;
  nome: string;
  estoque_atual: number;
  unidade: string;
  custo_unitario: number;
  data_validade?: string; // YYYY-MM-DD
}

export interface SalesHistory {
  produto_id: string;
  nome: string;
  quantidade_vendida_30_dias: number;
  media_diaria: number;
  vendas_sazonal_fim_de_semana_fator: number; // e.g. 1.5x aos fins de semana
}

export interface RecipeIngredient {
  produto_id: string;
  quantidade: number;
  unidade: string;
}

export interface Recipe {
  id: string;
  nome_prato: string;
  ingredientes: RecipeIngredient[];
}

export interface ExpirationAlert {
  produto_id: string;
  nome: string;
  lote: string;
  quantidade_afetada: number;
  data_vencimento: string; // YYYY-MM-DD
}

export interface ClientScenario {
  id_cliente: string;
  nome_fantasia: string;
  segmento: string;
  contato_compras: string;
  niveis_estoque: StockItem[];
  historico_vendas: SalesHistory[];
  fichas_tecnicas?: Recipe[];
  alertas_validade: ExpirationAlert[];
}

export const SCENARIOS: Record<string, ClientScenario> = {
  pizzaria: {
    id_cliente: "CLIENT-BELLA-ITALIA-92",
    nome_fantasia: "Pizzaria Bella Italia",
    segmento: "Food Service / Restaurante",
    contato_compras: "compras@bellaitalia.com.br",
    niveis_estoque: [
      { id: "PROD-01", nome: "Queijo Mozarela", estoque_atual: 80, unidade: "kg", custo_unitario: 32.00, data_validade: "2026-07-05" }, // Short shelf life & high quantity relative to sales
      { id: "PROD-02", nome: "Molho de Tomate Especial", estoque_atual: 12, unidade: "latas", custo_unitario: 14.50, data_validade: "2026-12-15" }, // High sales rate, stockout imminent
      { id: "PROD-03", nome: "Farinha de Trigo 00", estoque_atual: 8, unidade: "kg", custo_unitario: 8.90, data_validade: "2026-10-30" }, // Runs out tomorrow!
      { id: "PROD-04", nome: "Pepperoni Fatiado Premium", estoque_atual: 25, unidade: "kg", custo_unitario: 68.00, data_validade: "2026-07-20" }, // Low sales rate, high capital locked up
      { id: "PROD-05", nome: "Manjericão Fresco", estoque_atual: 0.5, unidade: "kg", custo_unitario: 22.00, data_validade: "2026-07-02" } // Ruptured or close to it
    ],
    historico_vendas: [
      { produto_id: "PROD-01", nome: "Queijo Mozarela", quantidade_vendida_30_dias: 150, media_diaria: 5.0, vendas_sazonal_fim_de_semana_fator: 1.8 },
      { produto_id: "PROD-02", nome: "Molho de Tomate Especial", quantidade_vendida_30_dias: 120, media_diaria: 4.0, vendas_sazonal_fim_de_semana_fator: 1.4 },
      { produto_id: "PROD-03", nome: "Farinha de Trigo 00", quantidade_vendida_30_dias: 240, media_diaria: 8.0, vendas_sazonal_fim_de_semana_fator: 1.7 },
      { produto_id: "PROD-04", nome: "Pepperoni Fatiado Premium", quantidade_vendida_30_dias: 9, media_diaria: 0.3, vendas_sazonal_fim_de_semana_fator: 1.3 },
      { produto_id: "PROD-05", nome: "Manjericão Fresco", quantidade_vendida_30_dias: 30, media_diaria: 1.0, vendas_sazonal_fim_de_semana_fator: 2.0 }
    ],
    fichas_tecnicas: [
      {
        id: "REC-01",
        nome_prato: "Pizza Mozarela Tradicional Grande",
        ingredientes: [
          { produto_id: "PROD-01", quantidade: 0.35, unidade: "kg" },
          { produto_id: "PROD-02", quantidade: 0.25, unidade: "latas" },
          { produto_id: "PROD-03", quantidade: 0.30, unidade: "kg" },
          { produto_id: "PROD-05", quantidade: 0.02, unidade: "kg" }
        ]
      },
      {
        id: "REC-02",
        nome_prato: "Pizza Pepperoni Suprema Grande",
        ingredientes: [
          { produto_id: "PROD-01", quantidade: 0.30, unidade: "kg" },
          { produto_id: "PROD-02", quantidade: 0.25, unidade: "latas" },
          { produto_id: "PROD-03", quantidade: 0.30, unidade: "kg" },
          { produto_id: "PROD-04", quantidade: 0.15, unidade: "kg" }
        ]
      }
    ],
    alertas_validade: [
      { produto_id: "PROD-01", nome: "Queijo Mozarela", lote: "L-MZ204", quantidade_afetada: 50, data_vencimento: "2026-07-05" }, // In 6 days (current date is 2026-06-29)
      { produto_id: "PROD-04", nome: "Pepperoni Fatiado Premium", lote: "L-PP889", quantidade_afetada: 18, data_vencimento: "2026-07-20" } // In 21 days but super low sales!
    ]
  },
  supermercado: {
    id_cliente: "CLIENT-PRECOBOM-SUPER",
    nome_fantasia: "Supermercado Preço Bom",
    segmento: "Varejo Alimentar",
    contato_compras: "compras@precobom.com.br",
    niveis_estoque: [
      { id: "PROD-101", nome: "Leite Integral UHT 1L", estoque_atual: 120, unidade: "unidades", custo_unitario: 4.20, data_validade: "2026-09-10" }, // Rupture in 3 days (sales 40/day)
      { id: "PROD-102", nome: "Iogurte de Morango Grego", estoque_atual: 80, unidade: "unidades", custo_unitario: 3.50, data_validade: "2026-07-03" }, // Expiration in 4 days! Low sales
      { id: "PROD-103", nome: "Detergente Líquido de Coco", estoque_atual: 350, unidade: "unidades", custo_unitario: 2.10, data_validade: "2027-05-30" }, // Extreme slow turn
      { id: "PROD-104", nome: "Café Torrado a Vácuo 500g", estoque_atual: 15, unidade: "unidades", custo_unitario: 18.50, data_validade: "2026-11-15" }, // High sales rate, imminent stockout
      { id: "PROD-105", nome: "Açúcar Refinado 1kg", estoque_atual: 240, unidade: "unidades", custo_unitario: 4.80, data_validade: "2027-02-10" } // Safe stock
    ],
    historico_vendas: [
      { produto_id: "PROD-101", nome: "Leite Integral UHT 1L", quantidade_vendida_30_dias: 1200, media_diaria: 40.0, vendas_sazonal_fim_de_semana_fator: 1.2 },
      { produto_id: "PROD-102", nome: "Iogurte de Morango Grego", quantidade_vendida_30_dias: 120, media_diaria: 4.0, vendas_sazonal_fim_de_semana_fator: 1.1 },
      { produto_id: "PROD-103", nome: "Detergente Líquido de Coco", quantidade_vendida_30_dias: 45, media_diaria: 1.5, vendas_sazonal_fim_de_semana_fator: 1.0 },
      { produto_id: "PROD-104", nome: "Café Torrado a Vácuo 500g", quantidade_vendida_30_dias: 180, media_diaria: 6.0, vendas_sazonal_fim_de_semana_fator: 1.3 },
      { produto_id: "PROD-105", nome: "Açúcar Refinado 1kg", quantidade_vendida_30_dias: 300, media_diaria: 10.0, vendas_sazonal_fim_de_semana_fator: 1.1 }
    ],
    fichas_tecnicas: [], // Retail has no recipes
    alertas_validade: [
      { produto_id: "PROD-102", nome: "Iogurte de Morango Grego", lote: "LT-YG44", quantidade_afetada: 70, data_vencimento: "2026-07-03" } // Massive loss risk in 4 days!
    ]
  },
  cafeteria: {
    id_cliente: "CLIENT-GRAO-GOURMET-11",
    nome_fantasia: "Café Grão Gourmet",
    segmento: "Food Service / Cafeteria",
    contato_compras: "suprimentos@graogourmet.cafe",
    niveis_estoque: [
      { id: "PROD-201", nome: "Café Especial em Grãos Bourbon", estoque_atual: 3.0, unidade: "kg", custo_unitario: 95.00, data_validade: "2026-09-30" }, // Sales: 1kg/day, runs out in 3 days
      { id: "PROD-202", nome: "Leite de Aveia Barista 1L", estoque_atual: 24, unidade: "litros", custo_unitario: 16.00, data_validade: "2026-11-20" }, // Sales: 8L/day, runs out in 3 days
      { id: "PROD-203", nome: "Croissant de Amêndoas Congelado", estoque_atual: 60, unidade: "unidades", custo_unitario: 5.50, data_validade: "2026-07-06" }, // Low sales (2/day), expiring in 7 days!
      { id: "PROD-204", nome: "Chantilly Spray 250g", estoque_atual: 12, unidade: "latas", custo_unitario: 21.00, data_validade: "2026-07-10" }, // Expiring in 11 days, low sales
      { id: "PROD-205", nome: "Xarope de Baunilha Premium", estoque_atual: 5.0, unidade: "garrafas", custo_unitario: 45.00, data_validade: "2027-01-15" } // Healthy
    ],
    historico_vendas: [
      { produto_id: "PROD-201", nome: "Café Especial em Grãos Bourbon", quantidade_vendida_30_dias: 30, media_diaria: 1.0, vendas_sazonal_fim_de_semana_fator: 1.5 },
      { produto_id: "PROD-202", nome: "Leite de Aveia Barista 1L", quantidade_vendida_30_dias: 240, media_diaria: 8.0, vendas_sazonal_fim_de_semana_fator: 1.6 },
      { produto_id: "PROD-203", nome: "Croissant de Amêndoas Congelado", quantidade_vendida_30_dias: 60, media_diaria: 2.0, vendas_sazonal_fim_de_semana_fator: 1.4 },
      { produto_id: "PROD-204", nome: "Chantilly Spray 250g", quantidade_vendida_30_dias: 15, media_diaria: 0.5, vendas_sazonal_fim_de_semana_fator: 1.5 },
      { produto_id: "PROD-205", nome: "Xarope de Baunilha Premium", quantidade_vendida_30_dias: 6, media_diaria: 0.2, vendas_sazonal_fim_de_semana_fator: 1.1 }
    ],
    fichas_tecnicas: [
      {
        id: "REC-201",
        nome_prato: "Cappuccino de Aveia Cremoso",
        ingredientes: [
          { produto_id: "PROD-201", quantidade: 0.03, unidade: "kg" },
          { produto_id: "PROD-202", quantidade: 0.20, unidade: "litros" }
        ]
      },
      {
        id: "REC-202",
        nome_prato: "Combo Café da Manhã Vip",
        ingredientes: [
          { produto_id: "PROD-201", quantidade: 0.03, unidade: "kg" },
          { produto_id: "PROD-202", quantidade: 0.20, unidade: "litros" },
          { produto_id: "PROD-203", quantidade: 1.00, unidade: "unidades" },
          { produto_id: "PROD-204", quantidade: 0.05, unidade: "latas" }
        ]
      }
    ],
    alertas_validade: [
      { produto_id: "PROD-203", nome: "Croissant de Amêndoas Congelado", lote: "L-CR112", quantidade_afetada: 45, data_vencimento: "2026-07-06" }, // in 7 days
      { produto_id: "PROD-204", nome: "Chantilly Spray 250g", lote: "L-CH75", quantidade_afetada: 8, data_vencimento: "2026-07-10" } // in 11 days
    ]
  }
};
