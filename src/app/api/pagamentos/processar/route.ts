import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

/**
 * POST /api/pagamentos/processar - Processa texto colado de pagamentos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texto } = body;

    if (!texto || typeof texto !== 'string') {
      return NextResponse.json(
        { error: 'Texto não fornecido' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const pagamentos = [];
    const linhas = texto.trim().split('\n');

    for (const linha of linhas) {
      try {
        // Formato esperado:
        // 17/10/2025	R$ 1.000,00	Pagamentos Bettio/Gprime [199]	G1
        // Data \t Valor \t Descrição [ID] \t Conta
        
        const partes = linha.split('\t').map(p => p.trim());
        
        if (partes.length < 4) {
          console.warn('Linha com formato inválido:', linha);
          continue;
        }

        // Extrai data
        const dataStr = partes[0];
        const [dia, mes, ano] = dataStr.split('/');
        const dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

        // Extrai valor (remove R$, pontos e substitui vírgula por ponto)
        const valorStr = partes[1].replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(valorStr);
        const valorCentavos = Math.round(valor * 100);

        // Extrai ID do cliente (número entre colchetes)
        const descricao = partes[2];
        const matchId = descricao.match(/\[(\d+)\]/);
        
        if (!matchId) {
          console.warn('ID do cliente não encontrado na linha:', linha);
          continue;
        }
        
        const clienteId = parseInt(matchId[1]);

        // Extrai nome do cliente (texto antes dos colchetes)
        const nomeMatch = descricao.match(/^(.+?)\s*\[/);
        let clienteNome = nomeMatch ? nomeMatch[1].trim() : 'Cliente Desconhecido';
        
        // Remove prefixos comuns
        clienteNome = clienteNome
          .replace(/^Pagamentos?\s+/i, '')
          .replace(/\/\s*Gprime$/i, '')
          .replace(/\/\s*G\s*prime$/i, '')
          .trim();

        // Extrai conta
        const contaSigla = partes[3];

        // Verifica se o cliente existe
        const cliente = db.prepare('SELECT id, nome FROM clientes WHERE id = ?').get(clienteId) as any;
        
        if (cliente) {
          // Usa o nome do cadastro se existir
          clienteNome = cliente.nome;
        }

        // Insere na tabela de staging
        const result = db.prepare(`
          INSERT INTO pagamentos_staging 
          (cliente_id, cliente_nome, data_pagamento, valor_centavos, conta_sigla, status)
          VALUES (?, ?, ?, ?, ?, 'pendente')
        `).run(clienteId, clienteNome, dataFormatada, valorCentavos, contaSigla);

        pagamentos.push({
          id: result.lastInsertRowid,
          cliente_id: clienteId,
          cliente_nome: clienteNome,
          data_pagamento: dataFormatada,
          valor_centavos: valorCentavos,
          conta_sigla: contaSigla,
          status: 'pendente'
        });
      } catch (error) {
        console.error('Erro ao processar linha:', linha, error);
      }
    }

    if (pagamentos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum pagamento válido encontrado' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `${pagamentos.length} pagamentos processados com sucesso`,
      pagamentos
    });
  } catch (error) {
    console.error('Erro ao processar pagamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamentos' },
      { status: 500 }
    );
  }
}

