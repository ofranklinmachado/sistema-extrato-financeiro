
'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FaturaImportada } from '@/types'
import { formatarMoeda, formatarDataBR } from '@/lib/business-rules'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function FaturasImportadasPage() {
  const [faturas, setFaturas] = useState<FaturaImportada[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedFaturas, setSelectedFaturas] = useState<string[]>([])
  const [processResult, setProcessResult] = useState<{ processadas: number; erros: number; detalhes: any[] } | null>(null)

  useEffect(() => {
    fetchFaturas()
  }, [])

  const fetchFaturas = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/faturas/importadas?status=pendente')
      const data: FaturaImportada[] = await response.json()
      setFaturas(data)
    } catch (error) {
      console.error('Erro ao buscar faturas importadas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFatura = (faturaId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFaturas((prev) => [...prev, faturaId])
    } else {
      setSelectedFaturas((prev) => prev.filter((id) => id !== faturaId))
    }
  }

  const handleSelectAllFaturas = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedFaturas(faturas.map((f) => f.id))
    } else {
      setSelectedFaturas([])
    }
  }

  const handleProcessarFaturas = async () => {
    setProcessing(true)
    setProcessResult(null)
    try {
      const response = await fetch('/api/faturas/processar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faturaIds: selectedFaturas }),
      })
      const data = await response.json()
      setProcessResult(data)
      setSelectedFaturas([]) // Limpa seleção após processamento
      fetchFaturas() // Atualiza a lista de faturas pendentes
    } catch (error) {
      console.error('Erro ao processar faturas:', error)
      setProcessResult({
        processadas: 0,
        erros: selectedFaturas.length,
        detalhes: [{ erro: 'Erro de conexão ou servidor' }],
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Faturas Importadas (Staging)</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Faturas Pendentes de Processamento</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="ml-2 text-gray-600">Carregando faturas...</p>
                </div>
              ) : faturas.length === 0 ? (
                <p className="text-gray-600">Nenhuma fatura pendente de processamento.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedFaturas.length === faturas.length && faturas.length > 0}
                            onCheckedChange={handleSelectAllFaturas}
                            aria-label="Selecionar todas as faturas"
                          />
                        </TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>No. Fatura</TableHead>
                        <TableHead>Data Emissão</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faturas.map((fatura) => (
                        <TableRow key={fatura.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedFaturas.includes(fatura.id)}
                              onCheckedChange={(checked) => handleSelectFatura(fatura.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>{fatura.clientes?.nome || 'N/A'}</TableCell>
                          <TableCell>{fatura.numero_fatura}</TableCell>
                          <TableCell>{formatarDataBR(fatura.data_emissao)}</TableCell>
                          <TableCell>{formatarMoeda(fatura.valor_centavos)}</TableCell>
                          <TableCell>{fatura.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {faturas.length > 0 && (
                <Button
                  onClick={handleProcessarFaturas}
                  className="mt-4"
                  disabled={selectedFaturas.length === 0 || processing}
                >
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Processar Faturas Selecionadas
                </Button>
              )}
            </CardContent>
          </Card>

          {processResult && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado do Processamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium mb-2">
                  Processadas: <span className="text-green-600">{processResult.processadas}</span>,
                  Erros: <span className="text-red-600">{processResult.erros}</span>
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Fatura</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processResult.detalhes.map((detalhe, index) => (
                      <TableRow key={index} className={detalhe.erro ? 'bg-red-50' : 'bg-green-50'}>
                        <TableCell>{detalhe.faturaId}</TableCell>
                        <TableCell>
                          {detalhe.erro ? (
                            <span className="flex items-center text-red-600">
                              <XCircle className="h-4 w-4 mr-1" /> Erro
                            </span>
                          ) : (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" /> Sucesso
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {detalhe.erro || 
                           `Fatura do cliente ${detalhe.cliente} (R$ ${formatarMoeda(detalhe.valor)}) com prazo ${detalhe.dataPagamento}.`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}


