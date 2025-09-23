import { format, addMonths, setDate } from 'date-fns'

/**
 * Calcula a data de pagamento baseada nas regras de negócio:
 * - Pedidos de 01 a 15: vencimento no dia 30 do mesmo mês
 * - Pedidos de 16 a 31: vencimento no dia 15 do mês seguinte
 * - Se o cliente não possui prazo: retorna null (pagamento à vista)
 */
export function calcularDataPagamento(
  dataEmissao: Date,
  clientePossuiPrazo: boolean
): Date | null {
  if (!clientePossuiPrazo) {
    return null // Cliente sem prazo = pagamento à vista
  }

  const dia = dataEmissao.getDate()
  
  if (dia >= 1 && dia <= 15) {
    // Pedidos de 01 a 15: vencimento no dia 30 do mesmo mês
    return setDate(dataEmissao, 30)
  } else {
    // Pedidos de 16 a 31: vencimento no dia 15 do mês seguinte
    const proximoMes = addMonths(dataEmissao, 1)
    return setDate(proximoMes, 15)
  }
}

/**
 * Agrupa lançamentos por período de pagamento
 */
export function agruparLancamentosPorPeriodo(lancamentos: any[]) {
  const grupos: { [key: string]: any[] } = {}
  
  lancamentos.forEach(lancamento => {
    const chave = lancamento.prazo_pagamento || 'a_vista'
    if (!grupos[chave]) {
      grupos[chave] = []
    }
    grupos[chave].push(lancamento)
  })
  
  return grupos
}

/**
 * Calcula o saldo em aberto de um cliente
 */
export function calcularSaldoEmAberto(lancamentos: any[]): number {
  return lancamentos.reduce((total, lancamento) => {
    if (lancamento.tipo === 'fatura') {
      return total + lancamento.valor_centavos
    } else {
      return total - lancamento.valor_centavos
    }
  }, 0)
}

/**
 * Calcula o saldo disponível (limite - saldo em aberto)
 */
export function calcularSaldoDisponivel(
  limiteCreditoCentavos: number,
  saldoEmAbertoCentavos: number
): number {
  return limiteCreditoCentavos - saldoEmAbertoCentavos
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatarDataBR(data: Date | string): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data
  return format(dataObj, 'dd/MM/yyyy')
}

/**
 * Valida se uma linha de importação está correta
 */
export function validarLinhaImportacao(linha: any): { valida: boolean; erro?: string } {
  if (!linha.cliente || linha.cliente.trim() === '') {
    return { valida: false, erro: 'Nome do cliente é obrigatório' }
  }
  
  if (!linha.id || linha.id.toString().trim() === '') {
    return { valida: false, erro: 'ID do cliente é obrigatório' }
  }
  
  if (!linha.valor || isNaN(parseFloat(linha.valor.toString().replace(',', '.')))) {
    return { valida: false, erro: 'Valor inválido' }
  }
  
  if (!linha.pedido || linha.pedido.toString().trim() === '') {
    return { valida: false, erro: 'Número do pedido é obrigatório' }
  }
  
  if (!linha.data) {
    return { valida: false, erro: 'Data é obrigatória' }
  }
  
  // Tentar parsear a data
  const data = new Date(linha.data)
  if (isNaN(data.getTime())) {
    return { valida: false, erro: 'Data inválida' }
  }
  
  return { valida: true }
}

/**
 * Converte valor em string para centavos
 */
export function converterValorParaCentavos(valor: string): number {
  // Remove R$, espaços e converte vírgula para ponto
  const valorLimpo = valor
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '') // Remove pontos (separadores de milhar)
    .replace(',', '.') // Converte vírgula para ponto decimal
    .trim()
  
  const valorNumerico = parseFloat(valorLimpo)
  return Math.round(valorNumerico * 100)
}

export const formatarMoeda = (centavos: number): string => {
  const reais = centavos / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais)
}

export const reaisParaCentavos = (reais: number): number => Math.round(reais * 100)

export const centavosParaReais = (centavos: number): number => centavos / 100


