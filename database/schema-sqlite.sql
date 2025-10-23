-- Schema SQLite para Sistema Extrato Financeiro
-- Criado em: 2025-10-23

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY,  -- ID numérico único do cliente
    nome VARCHAR(255) NOT NULL,
    saldo_aberto_centavos INTEGER DEFAULT 0,
    saldo_disponivel_centavos INTEGER DEFAULT 0,
    limite_centavos INTEGER DEFAULT 0,
    possui_prazo_pagamento BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contas
CREATE TABLE IF NOT EXISTS contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sigla VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    ativa BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Faturas (histórico)
CREATE TABLE IF NOT EXISTS faturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    numero_fatura VARCHAR(100) NOT NULL,
    data_emissao DATE NOT NULL,
    valor_centavos INTEGER NOT NULL,
    prazo_pagamento DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabela de Faturas Importadas (staging para aprovação)
CREATE TABLE IF NOT EXISTS faturas_staging (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    numero_fatura VARCHAR(100) NOT NULL,
    data_emissao DATE NOT NULL,
    valor_centavos INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pagamentos (histórico)
CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    data_pagamento DATE NOT NULL,
    valor_centavos INTEGER NOT NULL,
    conta_sigla VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabela de Pagamentos Staging (para aprovação)
CREATE TABLE IF NOT EXISTS pagamentos_staging (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    data_pagamento DATE NOT NULL,
    valor_centavos INTEGER NOT NULL,
    conta_sigla VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    chave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_faturas_cliente_id ON faturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_faturas_data_emissao ON faturas(data_emissao);
CREATE INDEX IF NOT EXISTS idx_faturas_staging_status ON faturas_staging(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_cliente_id ON pagamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_staging_status ON pagamentos_staging(status);

-- Inserir contas padrão
INSERT OR IGNORE INTO contas (sigla, nome) VALUES 
    ('G1', 'Conta G1'),
    ('RKU', 'Conta RKU'),
    ('WHE', 'Conta WHE'),
    ('CASH', 'Dinheiro');

-- Inserir configurações padrão
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao) VALUES 
    ('sistema_nome', 'Sistema Extrato Financeiro', 'Nome do sistema'),
    ('prazo_dia_corte_1', '15', 'Dia de corte para primeiro período'),
    ('prazo_vencimento_1', '30', 'Dia de vencimento para pedidos até dia 15'),
    ('prazo_vencimento_2', '15', 'Dia de vencimento para pedidos após dia 15');

-- Inserir usuário admin padrão (senha: admin123)
-- Hash bcrypt de 'admin123'
INSERT OR IGNORE INTO usuarios (nome, email, senha_hash) VALUES 
    ('Administrador', 'admin@sistema.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

