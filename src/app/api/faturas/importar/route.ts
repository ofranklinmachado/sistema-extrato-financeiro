import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validarLinhaImportacao, converterValorParaCentavos } from '@/lib/business-rules'
import { ImportacaoFatura, ResultadoImportacao } from '@/types'

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
        // Verificar se o cliente existe
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes')
          .select('id')
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

        // Inserir fatura importada
        const { data: faturaImportada, error: insertError } = await supabase
          .from('faturas_importadas')
          .insert({
            cliente_id: fatura.id,
            numero_fatura: fatura.pedido,
            data_emissao: fatura.data,
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

