
'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Cliente, Conta, LancamentoInsert } from '@/types'
import { formatarMoeda, reaisParaCentavos } from '@/lib/business-rules'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LancarPagamentoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [contas, setContas] = useState<Conta[]>([])
  const [selectedClienteId, setSelectedClienteId] = useState<string>('')
  const [valor, setValor] = useState<string>('')
  const [dataPagamento, setDataPagamento] = useState<string>(new Date().toISOString().split('T')[0])
  const [descricao, setDescricao] = useState<string>('')
  const [selectedContaId, setSelectedContaId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchClientesAndContas()
  }, [])

  const fetchClientesAndContas = async () => {
    setLoading(true)
    try {
      const [clientesRes, contasRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/contas'),
      ])

      const clientesData: Cliente[] = await clientesRes.json()
      const contasData: Conta[] = await contasRes.json()

      setClientes(clientesData)
      setContas(contasData)
      if (contasData.length > 0) {
        setSelectedContaId(contasData[0].id) // Seleciona a primeira conta por padrão
      }
    } catch (err) {
      console.error('Erro ao buscar clientes e contas:', err)
      setError('Erro ao carregar dados iniciais.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!selectedClienteId || !valor || !dataPagamento || !descricao || !selectedContaId) {
      setError('Todos os campos obrigatórios devem ser preenchidos.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/lancamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: selectedClienteId,
          data: dataPagamento,
          valor: valor, // A API converterá para centavos
          descricao,
          tipo: 'pagamento',
          conta: contas.find(c => c.id === selectedContaId)?.nome || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao lançar pagamento.')
      }

      const result = await response.json()
      setSuccess(`Pagamento de ${formatarMoeda(result.valor_centavos)} lançado com sucesso para ${result.clientes.nome}!`)
      // Limpar formulário
      setSelectedClienteId('')
      setValor('')
      setDataPagamento(new Date().toISOString().split('T')[0])
      setDescricao('')
      if (contas.length > 0) {
        setSelectedContaId(contas[0].id)
      }
    } catch (err) {
      console.error('Erro ao lançar pagamento:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao lançar pagamento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Lançar Novo Pagamento</h1>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select
                    id="cliente"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} [ID: {cliente.id.substring(0, 8)}...]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="valor" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                  <Input
                    id="valor"
                    type="text"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ex: 1.234,56"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data do Pagamento</label>
                  <Input
                    id="data"
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                  <Input
                    id="descricao"
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Pagamento Gprime / Tiago"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="conta" className="block text-sm font-medium text-gray-700">Conta de Destino</label>
                  <select
                    id="conta"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedContaId}
                    onChange={(e) => setSelectedContaId(e.target.value)}
                    disabled={loading}
                  >
                    {contas.map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nome} ({conta.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lançar Pagamento
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


