import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Cliente } from '@/lib/database';

/**
 * GET /api/clientes/[id] - Busca um cliente por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) as Cliente | undefined;

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clientes/[id] - Atualiza um cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nome, limite_centavos, possui_prazo_pagamento } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verifica se o cliente existe
    const clienteExistente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(id);
    
    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Atualiza o cliente
    db.prepare(`
      UPDATE clientes 
      SET nome = ?, 
          limite_centavos = ?, 
          possui_prazo_pagamento = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nome, limite_centavos || 0, possui_prazo_pagamento ? 1 : 0, id);

    // Busca o cliente atualizado
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) as Cliente;

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clientes/[id] - Deleta um cliente
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verifica se o cliente existe
    const clienteExistente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(id);
    
    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Deleta o cliente
    db.prepare('DELETE FROM clientes WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}

