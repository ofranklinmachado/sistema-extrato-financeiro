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
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou formato inválido' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const faturas = [];

    // Processa cada linha do Excel
    for (const row of data as any[]) {
      try {
        // Extrai os campos conforme especificação:
        // Data Emissão, ID Pessoa, Cliente/Fornecedor, Vlr. Parcela, Nº Duplicata
        const dataEmissao = row['Data Emissão'] || row['Data Emissao'] || row['data_emissao'];
        const idPessoa = parseInt(row['ID Pessoa'] || row['ID Pessoa'] || row['id_pessoa']);
        const clienteNome = row['Cliente/Fornecedor'] || row['Cliente'] || row['cliente'];
        const valorParcela = parseFloat(String(row['Vlr. Parcela'] || row['Valor'] || row['valor']).replace(/[^\d,.-]/g, '').replace(',', '.'));
        const numeroDuplicata = String(row['Nº Duplicata'] || row['Numero'] || row['numero']);

        if (!dataEmissao || isNaN(idPessoa) || !clienteNome || isNaN(valorParcela) || !numeroDuplicata) {
          console.warn('Linha inválida ignorada:', row);
          continue;
        }

        // Converte data para formato ISO (YYYY-MM-DD)
        let dataFormatada: string;
        if (typeof dataEmissao === 'number') {
          // Data do Excel (número de dias desde 1900-01-01)
          const date = XLSX.SSF.parse_date_code(dataEmissao);
          dataFormatada = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        } else {
          // Data em formato string (DD/MM/YYYY)
          const [dia, mes, ano] = String(dataEmissao).split('/');
          dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }

        // Converte valor para centavos
        const valorCentavos = Math.round(valorParcela * 100);

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
      }
    }

    return NextResponse.json({
      message: `${faturas.length} faturas importadas com sucesso`,
      faturas
    });
  } catch (error) {
    console.error('Erro ao importar faturas:', error);
    return NextResponse.json(
      { error: 'Erro ao importar faturas' },
      { status: 500 }
    );
  }
}

