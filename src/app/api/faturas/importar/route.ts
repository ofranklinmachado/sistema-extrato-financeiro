import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { converterValorParaCentavos } from '@/lib/business-rules'
import { ImportacaoFatura, ResultadoImportacao } from '@/types'
import { parse, format } from 'date-fns'

// Função de validação para usar os campos corretos da interface
const validarLinhaImportacao = (fatura: ImportacaoFatura) => {
  if (!fatura.id) return { valida: false, erro: 'ID é obrigatório' }
  if (!fatura.cliente) return { valida: false, erro: 'Nome do cliente é obrigatório' }
  if (!fatura.valor) return { valida: false, erro: 'Valor é obrigatório' }
  if (!fatura.pedido) return { valida: false, erro: 'Número do pedido é obrigatório' }
  if (!fatura.data) return { valida: false, erro: 'Data é obrigatória' }
  return { valida: true }
}

export async function POST(request: NextRequest) {
  try {
    const body: { faturas: ImportacaoFatura[] } = await request.json()
    const { faturas } = body

    const resultado: ResultadoImportacao = {
      sucessos: 0,
      erros: 0,
      detalhes: []
    }

    // Processar cada fatura
    for (let i = 0; i < faturas.length; i++) {
      const fatura = faturas[i]
      const linha = i + 1

      // Validar linha
      const validacao = validarLinhaImportacao(fatura)
      if (!validacao.valida) {
        resultado.erros++
        resultado.detalhes.push({
          linha,
          erro: validacao.erro
        })
        continue
      }

      try {
        // Verificar se o cliente existe pelo ID
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes')
          .select('id, nome')
          .eq('id', fatura.id)
          .single()

        if (clienteError || !cliente) {
          resultado.erros++
          resultado.detalhes.push({
            linha,
            erro: `Cliente com ID ${fatura.id} não encontrado`
          })
          continue
        }

        // Converter valor para centavos
        const valorCentavos = converterValorParaCentavos(fatura.valor)

        // Converter data para formato YYYY-MM-DD
        let dataEmissaoFormatada: string
        try {
          // Tentar diferentes formatos de data
          let parsedDate: Date
          if (fatura.data.includes('/')) {
            // Formato DD/MM/YYYY ou MM/DD/YYYY
            if (fatura.data.split('/')[0].length === 2 && parseInt(fatura.data.split('/')[0]) <= 12) {
              parsedDate = parse(fatura.data, 'MM/dd/yyyy', new Date())
            } else {
              parsedDate = parse(fatura.data, 'dd/MM/yyyy', new Date())
            }
          } else if (fatura.data.includes('-')) {
            // Formato YYYY-MM-DD
            parsedDate = parse(fatura.data, 'yyyy-MM-dd', new Date())
          } else {
            throw new Error('Formato de data não reconhecido')
          }
          dataEmissaoFormatada = format(parsedDate, 'yyyy-MM-dd')
        } catch (dateError) {
          resultado.erros++
          resultado.detalhes.push({
            linha,
            erro: `Formato de data inválido: ${fatura.data}`
          })
          continue
        }

        // Inserir fatura importada
        const { data: faturaImportada, error: insertError } = await supabase
          .from('faturas_importadas')
          .insert({
            cliente_id: fatura.id,
            numero_fatura: fatura.pedido,
            data_emissao: dataEmissaoFormatada,
            valor_centavos: valorCentavos,
            status: 'pendente'
          })
          .select()
          .single()

        if (insertError) {
          resultado.erros++
          resultado.detalhes.push({
            linha,
            erro: `Erro ao inserir fatura: ${insertError.message}`
          })
          continue
        }

        resultado.sucessos++
        resultado.detalhes.push({
          linha,
          fatura: faturaImportada
        })

      } catch (error) {
        resultado.erros++
        resultado.detalhes.push({
          linha,
          erro: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        })
      }
    }

    return NextResponse.json(resultado)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


