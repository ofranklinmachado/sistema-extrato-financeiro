import { Database } from './database'

// Tipos das tabelas
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type ClienteInsert = Database['public']['Tables']['clientes']['Insert']
export type ClienteUpdate = Database['public']['Tables']['clientes']['Update']

export type FaturaImportada = Database['public']['Tables']['faturas_importadas']['Row']
export type FaturaImportadaInsert = Database['public']['Tables']['faturas_importadas']['Insert']

export type Lancamento = Database['public']['Tables']['lancamentos']['Row']
export type LancamentoInsert = Database['public']['Tables']['lancamentos']['Insert']

export type Conta = Database['public']['Tables']['contas']['Row']
export type ContaInsert = Database['public']['Tables']['contas']['Insert']

// Tipos específicos da aplicação
export interface ExtratoCliente {
  cliente: Cliente
  saldoEmAberto: number
  saldoDisponivel: number
  periodosPagamento: PeriodoPagamento[]
}

export interface PeriodoPagamento {
  dataPagamento: string
  lancamentos: Lancamento[]
  subtotal: number
}

export interface ImportacaoFatura {
  cliente: string
  id: string
  valor: string
  pedido: string
  data: string
}

export interface ResultadoImportacao {
  sucessos: number
  erros: number
  detalhes: {
    linha: number
    erro?: string
    fatura?: FaturaImportada
  }[]
}

// Utilitários para conversão de valores


