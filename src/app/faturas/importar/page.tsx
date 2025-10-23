'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface FaturaPreview {
  cliente_id: number
  cliente_nome: string
  numero_fatura: string
  data_emissao: string
  valor_centavos: number
}

interface FaturaImportada {
  id: number
  cliente_id: number
  cliente_nome: string
  numero_fatura: string
  data_emissao: string
  valor_centavos: number
  status: string
}

interface ResultadoImportacao {
  message: string
  faturas: FaturaImportada[]
  total: number
  sucessos: number
  erros: number
}

function formatarMoeda(centavos: number): string {
  const valor = centavos / 100
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export default function ImportarFaturasPage() {
  const [file, setFile] = useState<File | null>(null)
  const [faturasPreview, setFaturasPreview] = useState<FaturaPreview[]>([])
  const [importacaoResultado, setImportacaoResultado] = useState<ResultadoImportacao | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
    setImportacaoResultado(null)
    setError(null)
    
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json: any[] = XLSX.utils.sheet_to_json(worksheet)

        console.log('Dados lidos do Excel:', json.length, 'linhas')

        // Mapear para o formato de preview
        const mappedFaturas: FaturaPreview[] = []
        
        for (const row of json) {
          const dataEmissao = row['Data Emissão']
          const idPessoa = row['ID Pessoa']
          const clienteNome = row['Cliente/Fornecedor']
          const valorParcela = row['Vlr. Parcela']
          const numeroDuplicata = String(row['Nº Duplicata'] || '')

          // Validações básicas
          if (!dataEmissao || !idPessoa || !clienteNome || valorParcela === undefined || !numeroDuplicata) {
            continue
          }

          // Converte data para string
          let dataFormatada: string
          if (dataEmissao instanceof Date) {
            const ano = dataEmissao.getFullYear()
            const mes = String(dataEmissao.getMonth() + 1).padStart(2, '0')
            const dia = String(dataEmissao.getDate()).padStart(2, '0')
            dataFormatada = `${dia}/${mes}/${ano}`
          } else {
            dataFormatada = String(dataEmissao)
          }

          mappedFaturas.push({
            cliente_id: idPessoa,
            cliente_nome: clienteNome,
            numero_fatura: numeroDuplicata,
            data_emissao: dataFormatada,
            valor_centavos: Math.round(valorParcela)
          })
        }

        console.log('Faturas mapeadas:', mappedFaturas.length)
        setFaturasPreview(mappedFaturas)
      } catch (err) {
        console.error('Erro ao processar arquivo:', err)
        setError('Erro ao processar arquivo. Verifique se o formato está correto.')
      }
    }
    
    reader.readAsArrayBuffer(uploadedFile)
  }

  const handleImportarFaturas = async () => {
    if (!file) {
      setError('Nenhum arquivo selecionado')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Envia o arquivo via FormData
      const formData = new FormData()
      formData.append('file', file)

      console.log('Enviando arquivo para API...')
      
      const response = await fetch('/api/faturas/importar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao importar faturas')
      }

      const data: ResultadoImportacao = await response.json()
      console.log('Resultado da importação:', data)
      setImportacaoResultado(data)
    } catch (err) {
      console.error('Erro ao importar faturas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao importar faturas')
    } finally {
      setLoading(false)
    }
  }

  // Calcular totais para o preview
  const totalRegistros = faturasPreview.length
  const totalValor = faturasPreview.reduce((acc, fatura) => acc + fatura.valor_centavos, 0)

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
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
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
                  {faturasPreview.slice(0, 10).map((fatura, index) => (
                    <TableRow key={index}>
                      <TableCell>{fatura.cliente_nome}</TableCell>
                      <TableCell>{fatura.cliente_id}</TableCell>
                      <TableCell>{formatarMoeda(fatura.valor_centavos)}</TableCell>
                      <TableCell>{fatura.numero_fatura}</TableCell>
                      <TableCell>{fatura.data_emissao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {faturasPreview.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  Mostrando 10 de {faturasPreview.length} registros
                </p>
              )}
            </div>
            <Button
              onClick={handleImportarFaturas}
              className="mt-4 w-full"
              disabled={loading || faturasPreview.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Importando...' : 'Importar Faturas para Staging'}
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
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-lg font-medium">
                {importacaoResultado.message}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Total: {importacaoResultado.total} | 
                Sucessos: <span className="text-green-600 font-semibold">{importacaoResultado.sucessos}</span> | 
                Erros: <span className="text-red-600 font-semibold">{importacaoResultado.erros}</span>
              </p>
            </div>
            
            {importacaoResultado.faturas.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Nº Fatura</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importacaoResultado.faturas.slice(0, 20).map((fatura, index) => (
                      <TableRow key={index} className="bg-green-50">
                        <TableCell>
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" /> Sucesso
                          </span>
                        </TableCell>
                        <TableCell>{fatura.cliente_nome}</TableCell>
                        <TableCell>{fatura.cliente_id}</TableCell>
                        <TableCell>{fatura.numero_fatura}</TableCell>
                        <TableCell>{formatarMoeda(fatura.valor_centavos)}</TableCell>
                        <TableCell>{fatura.data_emissao}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {importacaoResultado.faturas.length > 20 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Mostrando 20 de {importacaoResultado.faturas.length} faturas importadas
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

