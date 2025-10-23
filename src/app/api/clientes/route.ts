import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Cliente } from '@/lib/database';

/**
 * GET /api/clientes - Lista todos os clientes
 */
export async function GET() {
  try {
    const db = getDatabase();
    const clientes = db.prepare(`
      SELECT * FROM clientes 
      ORDER BY nome ASC
    `).all() as Cliente[];

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clientes - Cria ou atualiza um cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nome, limite_centavos, possui_prazo_pagamento } = body;

    if (!id || !nome) {
      return NextResponse.json(
        { error: 'ID e nome são obrigatórios' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verifica se o cliente já existe
    const clienteExistente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(id);

    if (clienteExistente) {
      // Atualiza cliente existente
      db.prepare(`
        UPDATE clientes 
        SET nome = ?, 
            limite_centavos = ?, 
            possui_prazo_pagamento = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(nome, limite_centavos || 0, possui_prazo_pagamento ? 1 : 0, id);
    } else {
      // Cria novo cliente
      db.prepare(`
        INSERT INTO clientes (id, nome, limite_centavos, possui_prazo_pagamento)
        VALUES (?, ?, ?, ?)
      `).run(id, nome, limite_centavos || 0, possui_prazo_pagamento ? 1 : 0);
    }

    // Busca o cliente atualizado
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) as Cliente;

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao criar/atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar/atualizar cliente' },
      { status: 500 }
    );
  }
}

