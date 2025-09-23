
'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { formatarMoeda, formatarDataBR, ExtratoCliente, Lancamento } from '@/types'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ExtratoClientePage() {
  const params = useParams()
  const clienteId = params.clienteId as string
  const [extrato, setExtrato] = useState<ExtratoCliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clienteId) {
      fetchExtratoCliente()
    }
  }, [clienteId])

  const fetchExtratoCliente = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/extrato/${clienteId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar extrato do cliente')
      }
      const data: ExtratoCliente = await response.json()
      setExtrato(data)
    } catch (err) {
      console.error('Erro ao buscar extrato:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar extrato.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Carregando extrato...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Erro ao Carregar Extrato</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  if (!extrato) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Extrato do Cliente</h1>
            <p className="text-gray-600">Nenhum extrato encontrado para este cliente.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Extrato do Cliente</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cliente: {extrato.cliente.nome} (ID: {extrato.cliente.id.substring(0, 8)}...)</CardTitle>
              <CardDescription>
                Limite: {formatarMoeda(extrato.cliente.limite_credito_centavos)} | 
                Saldo em Aberto: {formatarMoeda(extrato.saldoEmAberto)} | 
                Saldo Disponível: {formatarMoeda(extrato.saldoDisponivel)}
              </CardDescription>
              {extrato.cliente.possui_prazo_pagamento && (
                <CardDescription className="text-blue-600">
                  Condição: Pedidos 01-15 {'->'} Pagto dia 30 | Pedidos 16-31 {'->'} Pagto dia 15 do mês seguinte
                </CardDescription>
              )}
              {!extrato.cliente.possui_prazo_pagamento && (
                <CardDescription className="text-green-600">
                  Condição: Pagamento à vista (sem prazo definido)
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {extrato.periodosPagamento.length === 0 ? (
                <p className="text-gray-600">Nenhum lançamento para este cliente.</p>
              ) : (
                extrato.periodosPagamento.map((periodo, pIndex) => (
                  <div key={pIndex} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold mb-2 border-b pb-1">
                      Período de Pagamento: {periodo.dataPagamento}
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor R$</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead>Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {periodo.lancamentos.map((lancamento: Lancamento, lIndex) => (
                          <TableRow key={lIndex} className={lancamento.tipo === 'pagamento' ? 'bg-green-50' : ''}>
                            <TableCell>{formatarDataBR(lancamento.data)}</TableCell>
                            <TableCell className={lancamento.valor_centavos < 0 ? 'text-red-600' : 'text-green-600'}>
                              {formatarMoeda(Math.abs(lancamento.valor_centavos))}
                            </TableCell>
                            <TableCell>{lancamento.descricao}</TableCell>
                            <TableCell>{lancamento.prazo_pagamento ? formatarDataBR(lancamento.prazo_pagamento) : 'À vista'}</TableCell>
                            <TableCell>{lancamento.tipo === 'fatura' ? 'Fatura' : 'Pagamento'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">Subtotal:</TableCell>
                          <TableCell colSpan={2} className={periodo.subtotal < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                            {formatarMoeda(periodo.subtotal)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


