
'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ClienteInsert } from '@/types'
import { reaisParaCentavos } from '@/lib/business-rules'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NovoClientePage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [limiteCredito, setLimiteCredito] = useState('')
  const [possuiPrazoPagamento, setPossuiPrazoPagamento] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

    const novoCliente: ClienteInsert = {
      nome,
      limite_credito_centavos: reaisParaCentavos(parseFloat(limiteCredito.replace(',', '.'))),
      possui_prazo_pagamento: possuiPrazoPagamento,
    }

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoCliente),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao cadastrar cliente.')
      }

      setSuccess('Cliente cadastrado com sucesso!')
      setNome('')
      setLimiteCredito('')
      setPossuiPrazoPagamento(false)
      router.push('/clientes') // Redireciona para a lista de clientes
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao cadastrar cliente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Novo Cliente</h1>

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
                  Cadastrar Cliente
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


