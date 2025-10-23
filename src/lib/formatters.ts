/**
 * Formata valor em centavos para moeda brasileira (R$)
 */
export function formatarMoeda(centavos: number): string {
  const valor = centavos / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata data para padrão brasileiro (DD/MM/YYYY)
 */
export function formatarData(data: string | Date): string {
  const date = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Converte valor em reais para centavos
 */
export function reaisParaCentavos(valor: number): number {
  return Math.round(valor * 100);
}

/**
 * Converte centavos para reais
 */
export function centavosParaReais(centavos: number): number {
  return centavos / 100;
}

/**
 * Parse de valor monetário brasileiro para número
 */
export function parseMoeda(valor: string): number {
  // Remove R$, espaços e pontos de milhar, substitui vírgula por ponto
  const valorLimpo = valor
    .replace(/R\$\s*/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(valorLimpo) || 0;
}

/**
 * Formata data ISO para input date (YYYY-MM-DD)
 */
export function formatarDataISO(data: string | Date): string {
  const date = typeof data === 'string' ? new Date(data) : data;
  return date.toISOString().split('T')[0];
}

/**
 * Converte data brasileira (DD/MM/YYYY) para ISO (YYYY-MM-DD)
 */
export function dataBrParaISO(dataBr: string): string {
  const [dia, mes, ano] = dataBr.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

