import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import * as XLSX from 'xlsx';

/**
 * POST /api/faturas/importar - Importa faturas de um arquivo Excel
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Lê o arquivo Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log('Total de linhas no Excel:', data.length);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou formato inválido' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const faturas = [];
    let erros = 0;

    // Processa cada linha do Excel
    for (const row of data as any[]) {
      try {
        // Campos do Excel conforme análise:
        // - Data Emissão: datetime
        // - ID Pessoa: number
        // - Cliente/Fornecedor: string
        // - Vlr. Parcela: number (já em centavos)
        // - Nº Duplicata: string
        
        const dataEmissao = row['Data Emissão'];
        const idPessoa = row['ID Pessoa'];
        const clienteNome = row['Cliente/Fornecedor'];
        const valorParcela = row['Vlr. Parcela'];
        const numeroDuplicata = String(row['Nº Duplicata'] || '');

        // Validações
        if (!dataEmissao) {
          console.warn('Data de emissão ausente:', row);
          erros++;
          continue;
        }

        if (!idPessoa || typeof idPessoa !== 'number') {
          console.warn('ID Pessoa inválido:', row);
          erros++;
          continue;
        }

        if (!clienteNome) {
          console.warn('Nome do cliente ausente:', row);
          erros++;
          continue;
        }

        if (valorParcela === undefined || valorParcela === null || typeof valorParcela !== 'number') {
          console.warn('Valor da parcela inválido:', row);
          erros++;
          continue;
        }

        if (!numeroDuplicata) {
          console.warn('Número da duplicata ausente:', row);
          erros++;
          continue;
        }

        // Converte data para formato ISO (YYYY-MM-DD)
        let dataFormatada: string;
        if (dataEmissao instanceof Date) {
          // Data já é um objeto Date
          const ano = dataEmissao.getFullYear();
          const mes = String(dataEmissao.getMonth() + 1).padStart(2, '0');
          const dia = String(dataEmissao.getDate()).padStart(2, '0');
          dataFormatada = `${ano}-${mes}-${dia}`;
        } else if (typeof dataEmissao === 'number') {
          // Data do Excel (número de dias desde 1900-01-01)
          const date = XLSX.SSF.parse_date_code(dataEmissao);
          dataFormatada = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        } else if (typeof dataEmissao === 'string') {
          // Data em formato string (DD/MM/YYYY ou YYYY-MM-DD)
          if (dataEmissao.includes('/')) {
            const [dia, mes, ano] = dataEmissao.split('/');
            dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          } else {
            dataFormatada = dataEmissao;
          }
        } else {
          console.warn('Formato de data não reconhecido:', dataEmissao);
          erros++;
          continue;
        }

        // Valor vem em reais do Excel, precisa converter para centavos
        // Exemplo: 6675 (reais) → 667500 (centavos)
        const valorCentavos = Math.round(valorParcela * 100);

        console.log(`Processando: Cliente ${idPessoa} - ${clienteNome}, Valor: ${valorCentavos} centavos, Data: ${dataFormatada}`);

        // Insere na tabela de staging
        const result = db.prepare(`
          INSERT INTO faturas_staging 
          (cliente_id, cliente_nome, numero_fatura, data_emissao, valor_centavos, status)
          VALUES (?, ?, ?, ?, ?, 'pendente')
        `).run(idPessoa, clienteNome, numeroDuplicata, dataFormatada, valorCentavos);

        faturas.push({
          id: result.lastInsertRowid,
          cliente_id: idPessoa,
          cliente_nome: clienteNome,
          numero_fatura: numeroDuplicata,
          data_emissao: dataFormatada,
          valor_centavos: valorCentavos,
          status: 'pendente'
        });
      } catch (error) {
        console.error('Erro ao processar linha:', row, error);
        erros++;
      }
    }

    console.log(`Importação concluída: ${faturas.length} sucessos, ${erros} erros`);

    return NextResponse.json({
      message: `${faturas.length} faturas importadas com sucesso${erros > 0 ? ` (${erros} erros)` : ''}`,
      faturas,
      total: data.length,
      sucessos: faturas.length,
      erros
    });
  } catch (error) {
    console.error('Erro ao importar faturas:', error);
    return NextResponse.json(
      { error: 'Erro ao importar faturas: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
}

