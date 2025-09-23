import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calcularDataPagamento, converterValorParaCentavos } from '@/lib/business-rules'
import { LancamentoInsert } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('cliente_id')
    const tipo = searchParams.get('tipo')

    let query = supabase
      .from('lancamentos')
      .select(`
        *,
        clientes (
          id,
          nome
        )
      `)
      .order('data', { ascending: false })

    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data: lancamentos, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(lancamentos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cliente_id, data, valor, descricao, tipo, conta } = body

    // Buscar dados do cliente para calcular prazo de pagamento
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('possui_prazo_pagamento')
      .eq('id', cliente_id)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Converter valor para centavos
    const valorCentavos = typeof valor === 'string' 
      ? converterValorParaCentavos(valor)
      : valor

    // Para pagamentos, o valor deve ser negativo
    const valorFinal = tipo === 'pagamento' ? Math.abs(valorCentavos) : valorCentavos

    // Calcular data de pagamento (apenas para faturas)
    let dataPagamento = null
    if (tipo === 'fatura') {
      const dataEmissao = new Date(data)
      dataPagamento = calcularDataPagamento(dataEmissao, cliente.possui_prazo_pagamento)
    }

    const lancamento: LancamentoInsert = {
      cliente_id,
      data,
      valor_centavos: valorFinal,
      descricao,
      tipo,
      conta: conta || null,
      prazo_pagamento: dataPagamento?.toISOString().split('T')[0] || null
    }

    const { data: novoLancamento, error } = await supabase
      .from('lancamentos')
      .insert(lancamento)
      .select(`
        *,
        clientes (
          id,
          nome
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(novoLancamento, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

