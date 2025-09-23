
'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Cliente } from '@/types'
import { formatarMoeda } from '@/lib/business-rules'
import { Loader2, PlusCircle, Edit, Eye } from 'lucide-react'
import Link from 'next/link'

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
      <Navbar />
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
                        <TableHead>Nome</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Limite de Crédito</TableHead>
                        <TableHead>Possui Prazo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">{cliente.nome}</TableCell>
                          <TableCell>{cliente.id.substring(0, 8)}...</TableCell>
                          <TableCell>{formatarMoeda(cliente.limite_credito_centavos)}</TableCell>
                          <TableCell>{cliente.possui_prazo_pagamento ? 'Sim' : 'Não'}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/extrato/${cliente.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mr-2">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link href={`/clientes/editar/${cliente.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                              <Edit className="h-4 w-4" />
                            </Link>
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


