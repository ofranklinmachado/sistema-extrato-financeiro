
'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Cliente, ClienteUpdate } from '@/types'
import { reaisParaCentavos, centavosParaReais } from '@/lib/business-rules'
import { Loader2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id as string

  const [nome, setNome] = useState('')
  const [limiteCredito, setLimiteCredito] = useState('')
  const [possuiPrazoPagamento, setPossuiPrazoPagamento] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (clienteId) {
      fetchCliente()
    }
  }, [clienteId])

  const fetchCliente = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/clientes/${clienteId}`)
      if (!response.ok) {
        throw new Error('Cliente não encontrado.')
      }
      const data: Cliente = await response.json()
      setNome(data.nome)
      setLimiteCredito(centavosParaReais(data.limite_credito_centavos).toFixed(2).replace('.', ','))
      setPossuiPrazoPagamento(data.possui_prazo_pagamento)
    } catch (err) {
      console.error('Erro ao buscar cliente:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar cliente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!nome || !limiteCredito) {
      setError('Nome e Limite de Crédito são obrigatórios.')
      setLoading(false)
      return
    }

    const clienteAtualizado: ClienteUpdate = {
      nome,
      limite_credito_centavos: reaisParaCentavos(parseFloat(limiteCredito.replace(',', '.'))),
      possui_prazo_pagamento: possuiPrazoPagamento,
    }

    try {
      const response = await fetch(`/api/clientes/${clienteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteAtualizado),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar cliente.')
      }

      setSuccess('Cliente atualizado com sucesso!')
      router.push('/clientes') // Redireciona para a lista de clientes
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao atualizar cliente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Carregando dados do cliente...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Erro</h1>
            <p className="text-red-600">{error}</p>
            <Button onClick={() => router.push('/clientes')} className="mt-4">Voltar para Clientes</Button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Cliente</h1>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo ou Razão Social"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="limiteCredito" className="block text-sm font-medium text-gray-700">Limite de Crédito (R$)</label>
                  <Input
                    id="limiteCredito"
                    type="text"
                    value={limiteCredito}
                    onChange={(e) => setLimiteCredito(e.target.value)}
                    placeholder="Ex: 10.000,00"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="possuiPrazoPagamento"
                    checked={possuiPrazoPagamento}
                    onCheckedChange={(checked) => setPossuiPrazoPagamento(checked as boolean)}
                    disabled={loading}
                  />
                  <label
                    htmlFor="possuiPrazoPagamento"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cliente possui prazo de pagamento (faturas vencem em datas específicas)
                  </label>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Atualizar Cliente
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


