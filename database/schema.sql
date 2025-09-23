-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(20),
    limite_credito_centavos INTEGER DEFAULT 0,
    possui_prazo_pagamento BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas
CREATE TABLE IF NOT EXISTS contas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de faturas importadas (staging)
CREATE TABLE IF NOT EXISTS faturas_importadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    numero_fatura VARCHAR(100) NOT NULL,
    data_emissao DATE NOT NULL,
    valor_centavos INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processado', 'erro')),
    erro_mensagem TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de lançamentos (faturas e pagamentos processados)
CREATE TABLE IF NOT EXISTS lancamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    data DATE NOT NULL,
    valor_centavos INTEGER NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    prazo_pagamento DATE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('fatura', 'pagamento')),
    conta VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_faturas_importadas_cliente_id ON faturas_importadas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_faturas_importadas_status ON faturas_importadas(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente_id ON lancamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos(tipo);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas contas padrão
INSERT INTO contas (nome, tipo) VALUES 
    ('Cash', 'dinheiro'),
    ('G1', 'banco'),
    ('WHE', 'banco'),
    ('RKU', 'banco')
ON CONFLICT DO NOTHING;

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas_importadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo por enquanto - ajustar conforme necessário)
CREATE POLICY "Permitir tudo para clientes" ON clientes FOR ALL USING (true);
CREATE POLICY "Permitir tudo para contas" ON contas FOR ALL USING (true);
CREATE POLICY "Permitir tudo para faturas_importadas" ON faturas_importadas FOR ALL USING (true);
CREATE POLICY "Permitir tudo para lancamentos" ON lancamentos FOR ALL USING (true);

