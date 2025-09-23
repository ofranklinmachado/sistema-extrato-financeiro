import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calcularDataPagamento } from '@/lib/business-rules'

export async function POST(request: NextRequest) {
  try {
    const body: { faturaIds: string[] } = await request.json()
    const { faturaIds } = body

    const resultados = {
      processadas: 0,
      erros: 0,
      detalhes: [] as any[]
    }

    for (const faturaId of faturaIds) {
      try {
        // Buscar a fatura importada com dados do cliente
        const { data: faturaData, error: faturaError } = await supabase
          .from('faturas_importadas')
          .select(`
            *,
            clientes (
              id,
              nome,
              possui_prazo_pagamento
            )
          `)
          .eq('id', faturaId)
          .eq('status', 'pendente')
          .single()

        if (faturaError || !faturaData) {
          resultados.erros++
          resultados.detalhes.push({
            faturaId,
            erro: 'Fatura não encontrada ou já processada'
          })
          continue
        }

        const fatura = faturaData
        const cliente = fatura.clientes

        if (!cliente) {
          resultados.erros++
          resultados.detalhes.push({
            faturaId,
            erro: 'Cliente não encontrado'
          })
          continue
        }

        // Calcular data de pagamento
        const dataEmissao = new Date(fatura.data_emissao)
        const dataPagamento = calcularDataPagamento(
          dataEmissao,
          cliente.possui_prazo_pagamento
        )

        // Criar lançamento
        const { error: lancamentoError } = await supabase
          .from('lancamentos')
          .insert({
            cliente_id: fatura.cliente_id,
            data: fatura.data_emissao,
            valor_centavos: fatura.valor_centavos,
            descricao: fatura.numero_fatura,
            prazo_pagamento: dataPagamento?.toISOString().split('T')[0] || null,
            tipo: 'fatura'
          })

        if (lancamentoError) {
          resultados.erros++
          resultados.detalhes.push({
            faturaId,
            erro: `Erro ao criar lançamento: ${lancamentoError.message}`
          })
          continue
        }

        // Marcar fatura como processada
        const { error: updateError } = await supabase
          .from('faturas_importadas')
          .update({ status: 'processado' })
          .eq('id', faturaId)

        if (updateError) {
          resultados.erros++
          resultados.detalhes.push({
            faturaId,
            erro: `Erro ao atualizar status: ${updateError.message}`
          })
          continue
        }

        resultados.processadas++
        resultados.detalhes.push({
          faturaId,
          sucesso: true,
          cliente: cliente.nome,
          valor: fatura.valor_centavos,
          dataPagamento: dataPagamento?.toISOString().split('T')[0] || 'À vista'
        })

      } catch (error) {
        resultados.erros++
        resultados.detalhes.push({
          faturaId,
          erro: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        })
      }
    }

    return NextResponse.json(resultados)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

