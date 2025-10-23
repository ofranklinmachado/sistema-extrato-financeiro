'use client';

import Link from 'next/link';
import { Users, FileText, CreditCard, BarChart3, Upload, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Sistema Extrato Financeiro</h1>
        <p className="mt-2 text-lg text-gray-600">
          Gestão completa de clientes, faturas e pagamentos
        </p>
      </div>

      {/* Cards de navegação principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Clientes */}
        <Link href="/clientes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Clientes</CardTitle>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardDescription>
                Gerencie cadastros e limites
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Card Faturas */}
        <Link href="/faturas">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Faturas</CardTitle>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <CardDescription>
                Importe e aprove faturas
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Card Pagamentos */}
        <Link href="/pagamentos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-purple-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Pagamentos</CardTitle>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <CardDescription>
                Registre pagamentos recebidos
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Card Extrato */}
        <Link href="/extrato">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-orange-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Extrato</CardTitle>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <CardDescription>
                Visualize saldos e histórico
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse as funcionalidades principais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/faturas/importar">
              <Button className="w-full justify-start" size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Importar Faturas (Excel)
              </Button>
            </Link>
            <Link href="/pagamentos/novo">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <ClipboardList className="mr-2 h-5 w-5" />
                Lançar Pagamentos (Colar)
              </Button>
            </Link>
            <Link href="/clientes/novo">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Cadastrar Cliente
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como usar o sistema</CardTitle>
            <CardDescription>
              Fluxo de trabalho recomendado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">
                  1
                </div>
                <div>
                  <strong>Faturas:</strong> Importe planilhas Excel com faturas. Clientes serão criados automaticamente.
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">
                  2
                </div>
                <div>
                  <strong>Validação:</strong> Revise as faturas importadas e aprove em lote.
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">
                  3
                </div>
                <div>
                  <strong>Pagamentos:</strong> Cole dados de pagamentos copiados de planilhas e aprove.
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">
                  4
                </div>
                <div>
                  <strong>Extrato:</strong> Acompanhe saldos e histórico completo de cada cliente.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

