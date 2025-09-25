'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatarMoeda } from '@/lib/business-rules'
import Link from 'next/link'

interface DashboardStats {
  totalClientes: number
  faturasPendentes: number
  saldoTotalEmAberto: number
  pagamentosHoje: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    faturasPendentes: 0,
    saldoTotalEmAberto: 0,
    pagamentosHoje: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalClientes: 45,
        faturasPendentes: 12,
        saldoTotalEmAberto: 2421500, // R$ 24.215,00 em centavos
        pagamentosHoje: 3
      })
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do sistema de extrato financeiro
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalClientes}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.faturasPendentes}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatarMoeda(stats.saldoTotalEmAberto)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total a receber
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagamentos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.pagamentosHoje}
            </div>
            <p className="text-xs text-muted-foreground">
              Recebidos hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse as funcionalidades principais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/faturas/importar">
              <Button className="w-full justify-start">
                Importar Faturas
              </Button>
            </Link>
            <Link href="/pagamentos/novo">
              <Button variant="outline" className="w-full justify-start">
                Lançar Pagamento
              </Button>
            </Link>
            <Link href="/clientes/novo">
              <Button variant="outline" className="w-full justify-start">
                Cadastrar Cliente
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Atividades</CardTitle>
            <CardDescription>
              Resumo das atividades recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Fatura processada</p>
                  <p className="text-xs text-gray-500">Cliente: ACME Ltda - R$ 1.250,90</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pagamento recebido</p>
                  <p className="text-xs text-gray-500">Cliente: Beta Corp - R$ 800,00</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Cliente cadastrado</p>
                  <p className="text-xs text-gray-500">Novo cliente: Tech Solutions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
