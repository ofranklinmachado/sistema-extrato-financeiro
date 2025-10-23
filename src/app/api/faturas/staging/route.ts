import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, FaturaStaging } from '@/lib/database';

/**
 * GET /api/faturas/staging - Lista faturas pendentes de aprovação
 */
export async function GET() {
  try {
    const db = getDatabase();
    const faturas = db.prepare(`
      SELECT * FROM faturas_staging 
      WHERE status = 'pendente'
      ORDER BY created_at DESC
    `).all() as FaturaStaging[];

    return NextResponse.json(faturas);
  } catch (error) {
    console.error('Erro ao buscar faturas em staging:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar faturas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faturas/staging - Aprova faturas em lote
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Inicia transação
    const transaction = db.transaction((faturaIds: number[]) => {
      for (const id of faturaIds) {
        // Busca a fatura em staging
        const fatura = db.prepare(`
          SELECT * FROM faturas_staging WHERE id = ?
        `).get(id) as FaturaStaging;

        if (!fatura) continue;

        // Verifica se o cliente existe, se não cria
        const clienteExiste = db.prepare('SELECT id FROM clientes WHERE id = ?').get(fatura.cliente_id);
        
        if (!clienteExiste) {
          // Cria o cliente
          db.prepare(`
            INSERT INTO clientes (id, nome)
            VALUES (?, ?)
          `).run(fatura.cliente_id, fatura.cliente_nome);
        } else {
          // Atualiza o nome do cliente se necessário
          db.prepare(`
            UPDATE clientes 
            SET nome = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(fatura.cliente_nome, fatura.cliente_id);
        }

        // Calcula prazo de pagamento se o cliente possui prazo
        const cliente = db.prepare('SELECT possui_prazo_pagamento FROM clientes WHERE id = ?').get(fatura.cliente_id) as any;
        let prazoPagamento = null;

        if (cliente?.possui_prazo_pagamento) {
          const dataEmissao = new Date(fatura.data_emissao);
          const dia = dataEmissao.getDate();
          const mes = dataEmissao.getMonth();
          const ano = dataEmissao.getFullYear();

          // Regra: pedidos 01-15 vencem dia 30, pedidos 16-31 vencem dia 15 do mês seguinte
          if (dia <= 15) {
            // Vence dia 30 do mesmo mês
            prazoPagamento = new Date(ano, mes, 30).toISOString().split('T')[0];
          } else {
            // Vence dia 15 do mês seguinte
            prazoPagamento = new Date(ano, mes + 1, 15).toISOString().split('T')[0];
          }
        }

        // Insere a fatura no histórico
        db.prepare(`
          INSERT INTO faturas 
          (cliente_id, numero_fatura, data_emissao, valor_centavos, prazo_pagamento)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          fatura.cliente_id,
          fatura.numero_fatura,
          fatura.data_emissao,
          fatura.valor_centavos,
          prazoPagamento
        );

        // Atualiza saldo do cliente
        db.prepare(`
          UPDATE clientes 
          SET saldo_aberto_centavos = saldo_aberto_centavos + ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(fatura.valor_centavos, fatura.cliente_id);

        // Marca a fatura como aprovada
        db.prepare(`
          UPDATE faturas_staging 
          SET status = 'aprovado'
          WHERE id = ?
        `).run(id);
      }
    });

    transaction(ids);

    return NextResponse.json({
      message: `${ids.length} faturas aprovadas com sucesso`
    });
  } catch (error) {
    console.error('Erro ao aprovar faturas:', error);
    return NextResponse.json(
      { error: 'Erro ao aprovar faturas' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/faturas/staging - Rejeita faturas em lote
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    
    db.prepare(`
      UPDATE faturas_staging 
      SET status = 'rejeitado'
      WHERE id IN (${placeholders})
    `).run(...ids);

    return NextResponse.json({
      message: `${ids.length} faturas rejeitadas`
    });
  } catch (error) {
    console.error('Erro ao rejeitar faturas:', error);
    return NextResponse.json(
      { error: 'Erro ao rejeitar faturas' },
      { status: 500 }
    );
  }
}

