import Database from 'better-sqlite3';
import path from 'path';

// Caminho do banco de dados
const dbPath = path.join(process.cwd(), 'database', 'sistema.db');

// Instância do banco de dados
let db: Database.Database | null = null;

/**
 * Obtém a conexão com o banco de dados SQLite
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath, { 
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined 
    });
    
    // Habilitar foreign keys
    db.pragma('foreign_keys = ON');
  }
  
  return db;
}

/**
 * Fecha a conexão com o banco de dados
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Executa uma query e retorna os resultados
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  return stmt.all(...params) as T[];
}

/**
 * Executa uma query e retorna o primeiro resultado
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  return stmt.get(...params) as T | undefined;
}

/**
 * Executa uma query de inserção/atualização/deleção
 */
export function execute(sql: string, params: any[] = []): Database.RunResult {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  return stmt.run(...params);
}

/**
 * Executa múltiplas queries em uma transação
 */
export function transaction<T>(callback: () => T): T {
  const database = getDatabase();
  const txn = database.transaction(callback);
  return txn();
}

// Tipos auxiliares
export interface Cliente {
  id: number;
  nome: string;
  saldo_aberto_centavos: number;
  saldo_disponivel_centavos: number;
  limite_centavos: number;
  possui_prazo_pagamento: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conta {
  id: number;
  sigla: string;
  nome: string;
  ativa: boolean;
  created_at: string;
}

export interface Fatura {
  id: number;
  cliente_id: number;
  numero_fatura: string;
  data_emissao: string;
  valor_centavos: number;
  prazo_pagamento: string | null;
  created_at: string;
}

export interface FaturaStaging {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  numero_fatura: string;
  data_emissao: string;
  valor_centavos: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
}

export interface Pagamento {
  id: number;
  cliente_id: number;
  data_pagamento: string;
  valor_centavos: number;
  conta_sigla: string;
  created_at: string;
}

export interface PagamentoStaging {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  data_pagamento: string;
  valor_centavos: number;
  conta_sigla: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Configuracao {
  chave: string;
  valor: string;
  descricao: string | null;
  updated_at: string;
}

