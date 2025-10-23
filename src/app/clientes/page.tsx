'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader2, PlusCircle, Edit, Eye } from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: number
  nome: string
  saldo_aberto_centavos: number
  saldo_disponivel_centavos: number
  limite_centavos: number
  possui_prazo_pagamento: number | boolean
  created_at: string
  updated_at: string
}

function formatarMoeda(centavos: number): string {
  const valor = centavos / 100
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/clientes')
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes')
      }
      const data: Cliente[] = await response.json()
      setClientes(data)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <Link href="/clientes/novo">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="ml-2 text-gray-600">Carregando clientes...</p>
                </div>
              ) : error ? (
                <p className="text-red-600">Erro: {error}</p>
              ) : clientes.length === 0 ? (
                <p className="text-gray-600">Nenhum cliente cadastrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Saldo em Aberto</TableHead>
                        <TableHead>Saldo Disponível</TableHead>
                        <TableHead>Limite de Crédito</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">{cliente.id}</TableCell>
                          <TableCell>{cliente.nome}</TableCell>
                          <TableCell>{formatarMoeda(cliente.saldo_aberto_centavos)}</TableCell>
                          <TableCell>{formatarMoeda(cliente.saldo_disponivel_centavos)}</TableCell>
                          <TableCell>{formatarMoeda(cliente.limite_centavos)}</TableCell>
                          <TableCell>
                            {cliente.possui_prazo_pagamento ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Com Prazo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                À Vista
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/extrato/${cliente.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/clientes/editar/${cliente.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

