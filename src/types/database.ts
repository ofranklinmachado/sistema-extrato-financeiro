export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string
          nome: string
          documento: string | null
          limite_credito_centavos: number
          possui_prazo_pagamento: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          documento?: string | null
          limite_credito_centavos?: number
          possui_prazo_pagamento?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          documento?: string | null
          limite_credito_centavos?: number
          possui_prazo_pagamento?: boolean
          updated_at?: string
        }
      }
      faturas_importadas: {
        Row: {
          id: string
          cliente_id: string
          numero_fatura: string
          data_emissao: string
          valor_centavos: number
          status: 'pendente' | 'processado' | 'erro'
          erro_mensagem: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          numero_fatura: string
          data_emissao: string
          valor_centavos: number
          status?: 'pendente' | 'processado' | 'erro'
          erro_mensagem?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          numero_fatura?: string
          data_emissao?: string
          valor_centavos?: number
          status?: 'pendente' | 'processado' | 'erro'
          erro_mensagem?: string | null
        }
      }
      lancamentos: {
        Row: {
          id: string
          cliente_id: string
          data: string
          valor_centavos: number
          descricao: string
          prazo_pagamento: string | null
          tipo: 'fatura' | 'pagamento'
          conta: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          data: string
          valor_centavos: number
          descricao: string
          prazo_pagamento?: string | null
          tipo: 'fatura' | 'pagamento'
          conta?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          data?: string
          valor_centavos?: number
          descricao?: string
          prazo_pagamento?: string | null
          tipo?: 'fatura' | 'pagamento'
          conta?: string | null
        }
      }
      contas: {
        Row: {
          id: string
          nome: string
          tipo: string
          ativa: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          tipo: string
          ativa?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          tipo?: string
          ativa?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

