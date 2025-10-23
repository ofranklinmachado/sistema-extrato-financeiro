import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, PagamentoStaging } from '@/lib/database';

/**
 * GET /api/pagamentos/staging - Lista pagamentos pendentes de aprovação
 */
export async function GET() {
  try {
    const db = getDatabase();
    const pagamentos = db.prepare(`
      SELECT * FROM pagamentos_staging 
      WHERE status = 'pendente'
      ORDER BY created_at DESC
    `).all() as PagamentoStaging[];

    return NextResponse.json(pagamentos);
  } catch (error) {
    console.error('Erro ao buscar pagamentos em staging:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pagamentos/staging - Aprova pagamentos em lote
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
    const transaction = db.transaction((pagamentoIds: number[]) => {
      for (const id of pagamentoIds) {
        // Busca o pagamento em staging
        const pagamento = db.prepare(`
          SELECT * FROM pagamentos_staging WHERE id = ?
        `).get(id) as PagamentoStaging;

        if (!pagamento) continue;

        // Verifica se o cliente existe, se não cria
        const clienteExiste = db.prepare('SELECT id FROM clientes WHERE id = ?').get(pagamento.cliente_id);
        
        if (!clienteExiste) {
          // Cria o cliente (pagamento antecipado)
          db.prepare(`
            INSERT INTO clientes (id, nome)
            VALUES (?, ?)
          `).run(pagamento.cliente_id, pagamento.cliente_nome);
        }

        // Insere o pagamento no histórico
        db.prepare(`
          INSERT INTO pagamentos 
          (cliente_id, data_pagamento, valor_centavos, conta_sigla)
          VALUES (?, ?, ?, ?)
        `).run(
          pagamento.cliente_id,
          pagamento.data_pagamento,
          pagamento.valor_centavos,
          pagamento.conta_sigla
        );

        // Atualiza saldo do cliente (reduz saldo em aberto)
        db.prepare(`
          UPDATE clientes 
          SET saldo_aberto_centavos = saldo_aberto_centavos - ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(pagamento.valor_centavos, pagamento.cliente_id);

        // Marca o pagamento como aprovado
        db.prepare(`
          UPDATE pagamentos_staging 
          SET status = 'aprovado'
          WHERE id = ?
        `).run(id);
      }
    });

    transaction(ids);

    return NextResponse.json({
      message: `${ids.length} pagamentos aprovados com sucesso`
    });
  } catch (error) {
    console.error('Erro ao aprovar pagamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao aprovar pagamentos' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pagamentos/staging - Rejeita pagamentos em lote
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
      UPDATE pagamentos_staging 
      SET status = 'rejeitado'
      WHERE id IN (${placeholders})
    `).run(...ids);

    return NextResponse.json({
      message: `${ids.length} pagamentos rejeitados`
    });
  } catch (error) {
    console.error('Erro ao rejeitar pagamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao rejeitar pagamentos' },
      { status: 500 }
    );
  }
}

