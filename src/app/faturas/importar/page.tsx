
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import { ImportacaoFatura, ResultadoImportacao } from '@/types'
import { formatarMoeda } from '@/lib/business-rules'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ImportarFaturasPage() {
  const [file, setFile] = useState<File | null>(null)
  const [faturasPreview, setFaturasPreview] = useState<ImportacaoFatura[]>([])
  const [importacaoResultado, setImportacaoResultado] = useState<ResultadoImportacao | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
    setImportacaoResultado(null) // Limpa resultados anteriores
    const reader = new FileReader()

    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json: any[] = XLSX.utils.sheet_to_json(worksheet)

      // Mapear para o formato esperado
      const mappedFaturas: ImportacaoFatura[] = json.map((row, index) => ({
        cliente: row.Cliente || '',
        id: row.ID ? String(row.ID) : '',
        valor: row.Valor ? String(row.Valor) : '',
        pedido: row.Pedido ? String(row.Pedido) : '',
        data: row.Data ? String(row.Data) : '',
      }))
      setFaturasPreview(mappedFaturas)
    }
    reader.readAsArrayBuffer(uploadedFile)
  }

  const handleImportarFaturas = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/faturas/importar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faturas: faturasPreview }),
      })
      const data: ResultadoImportacao = await response.json()
      setImportacaoResultado(data)
    } catch (error) {
      console.error('Erro ao importar faturas:', error)
      setImportacaoResultado({
        sucessos: 0,
        erros: faturasPreview.length,
        detalhes: faturasPreview.map((_, index) => ({
          linha: index + 1,
          erro: 'Erro de conexão ou servidor',
        })),
      })
    } finally {
      setLoading(false)
    }
  }

  // Calcular totais para o preview
  const totalRegistros = faturasPreview.length
  const totalValor = faturasPreview.reduce((acc, fatura) => {
    const valor = parseFloat(fatura.valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0
    return acc + valor * 100 // Converter para centavos
  }, 0)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Importar Faturas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload onFileUpload={handleFileUpload} />
          {file && <p className="mt-2 text-sm text-gray-600">Arquivo selecionado: {file.name}</p>}
        </CardContent>
      </Card>

      {faturasPreview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização das Faturas</CardTitle>
            <div className="text-sm text-gray-600">
              <p>Total de registros: <strong>{totalRegistros}</strong></p>
              <p>Valor total: <strong>{formatarMoeda(totalValor)}</strong></p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturasPreview.map((fatura, index) => (
                    <TableRow key={index}>
                      <TableCell>{fatura.cliente}</TableCell>
                      <TableCell>{fatura.id}</TableCell>
                      <TableCell>
                        {formatarMoeda(parseFloat(fatura.valor.replace(/[^\d,]/g, '').replace(',', '.')) * 100 || 0)}
                      </TableCell>
                      <TableCell>{fatura.pedido}</TableCell>
                      <TableCell>{fatura.data}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              onClick={handleImportarFaturas}
              className="mt-4 w-full"
              disabled={loading || faturasPreview.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importar Faturas para Staging
            </Button>
          </CardContent>
        </Card>
      )}

      {importacaoResultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Importação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-2">
              Sucessos: <span className="text-green-600">{importacaoResultado.sucessos}</span>,
              Erros: <span className="text-red-600">{importacaoResultado.erros}</span>
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importacaoResultado.detalhes.map((detalhe, index) => (
                  <TableRow key={index} className={detalhe.erro ? 'bg-red-50' : 'bg-green-50'}>
                    <TableCell>{detalhe.linha}</TableCell>
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
                       `Fatura ${detalhe.fatura?.numero_fatura} do cliente ${detalhe.fatura?.cliente_id} (${formatarMoeda(detalhe.fatura?.valor_centavos || 0)}) importada.`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


