import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  agruparLancamentosPorPeriodo, 
  calcularSaldoEmAberto, 
  calcularSaldoDisponivel 
} from '@/lib/business-rules'
import { ExtratoCliente, PeriodoPagamento } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', params.clienteId)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Buscar todos os lançamentos do cliente
    const { data: lancamentos, error: lancamentosError } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('cliente_id', params.clienteId)
      .order('data', { ascending: true })

    if (lancamentosError) {
      return NextResponse.json(
        { error: lancamentosError.message },
        { status: 500 }
      )
    }

    // Calcular saldos
    const saldoEmAbertoCentavos = calcularSaldoEmAberto(lancamentos || [])
    const saldoDisponivelCentavos = calcularSaldoDisponivel(
      cliente.limite_credito_centavos,
      saldoEmAbertoCentavos
    )

    // Agrupar lançamentos por período de pagamento
    const grupos = agruparLancamentosPorPeriodo(lancamentos || [])
    
    // Converter grupos em períodos de pagamento
    const periodosPagamento: PeriodoPagamento[] = Object.entries(grupos)
      .map(([dataPagamento, lancamentosGrupo]) => {
        const subtotal = lancamentosGrupo.reduce((total, lancamento) => {
          if (lancamento.tipo === 'fatura') {
            return total + lancamento.valor_centavos
          } else {
            return total - lancamento.valor_centavos
          }
        }, 0)

        return {
          dataPagamento: dataPagamento === 'a_vista' ? 'À vista' : dataPagamento,
          lancamentos: lancamentosGrupo,
          subtotal
        }
      })
      .sort((a, b) => {
        // Ordenar por data de pagamento
        if (a.dataPagamento === 'À vista') return -1
        if (b.dataPagamento === 'À vista') return 1
        return new Date(a.dataPagamento).getTime() - new Date(b.dataPagamento).getTime()
      })

    const extrato: ExtratoCliente = {
      cliente,
      saldoEmAberto: saldoEmAbertoCentavos,
      saldoDisponivel: saldoDisponivelCentavos,
      periodosPagamento
    }

    return NextResponse.json(extrato)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

