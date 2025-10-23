# Sistema Extrato Financeiro

Sistema completo para gerenciamento de extratos financeiros de clientes, incluindo importação de faturas via Excel, lançamento de pagamentos por texto colado e aplicação de regras de negócio específicas.

## 🚀 Funcionalidades Implementadas

### ✅ Gestão de Clientes
- Cadastro de clientes com ID numérico único
- Configuração de limite de crédito por cliente
- Configuração de prazo de pagamento (com prazo ou à vista)
- Cálculo automático de saldo em aberto e saldo disponível
- Criação automática de clientes na importação de faturas

### ✅ Importação de Faturas
- Upload de planilhas Excel/CSV com faturas
- Campos importados:
  - **Data Emissão**: Data de emissão da fatura (formato DD/MM/YYYY)
  - **ID Pessoa**: ID numérico do cliente
  - **Cliente/Fornecedor**: Nome do cliente
  - **Vlr. Parcela**: Valor da fatura (formato R$ 1.000,00)
  - **Nº Duplicata**: Número da fatura
- Área de staging para validação antes da aprovação
- Processamento em lote com aprovação seletiva
- Atualização automática de saldos dos clientes

### ✅ Lançamento de Pagamentos
- Processamento de texto colado de planilhas
- Formato esperado: `Data [TAB] Valor [TAB] Descrição [ID] [TAB] Conta`
- Exemplo:
  ```
  17/10/2025	R$ 1.000,00	Pagamentos Bettio/Gprime [199]	G1
  17/10/2025	R$ 5.000,00	Pagamentos Cfimports / Gprime [52]	G1
  ```
- Extração automática do ID do cliente (número entre colchetes)
- Identificação automática da conta de destino
- Validação e aprovação em lote
- Atualização automática de saldos

### ✅ Regras de Negócio
- **Clientes com prazo**: 
  - Pedidos de 01-15 vencem dia 30 do mesmo mês
  - Pedidos de 16-31 vencem dia 15 do mês seguinte
- **Clientes sem prazo**: Pagamento à vista
- Cálculo automático de saldo disponível: `Limite - Saldo em Aberto`

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 3
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite (arquivo local)
- **Processamento Excel**: XLSX library
- **UI Components**: Shadcn/ui
- **Ícones**: Lucide React

## 📋 Estrutura do Banco de Dados

### Tabela: clientes
```sql
- id (INTEGER PRIMARY KEY) - ID numérico único do cliente
- nome (VARCHAR) - Nome do cliente
- saldo_aberto_centavos (INTEGER) - Saldo devedor em centavos
- saldo_disponivel_centavos (INTEGER) - Saldo disponível calculado
- limite_centavos (INTEGER) - Limite de crédito em centavos
- possui_prazo_pagamento (BOOLEAN) - Se possui prazo ou é à vista
```

### Tabela: faturas
```sql
- id (INTEGER AUTOINCREMENT)
- cliente_id (INTEGER) - FK para clientes
- numero_fatura (VARCHAR) - Número da fatura
- data_emissao (DATE) - Data de emissão
- valor_centavos (INTEGER) - Valor em centavos
- prazo_pagamento (DATE) - Data de vencimento calculada
```

### Tabela: pagamentos
```sql
- id (INTEGER AUTOINCREMENT)
- cliente_id (INTEGER) - FK para clientes
- data_pagamento (DATE) - Data do pagamento
- valor_centavos (INTEGER) - Valor em centavos
- conta_sigla (VARCHAR) - Sigla da conta (G1, RKU, WHE, etc)
```

### Tabelas de Staging
- **faturas_staging**: Área temporária para validação de faturas importadas
- **pagamentos_staging**: Área temporária para validação de pagamentos processados

## 🚀 Instalação e Execução

### 1. Pré-requisitos
- Node.js 18+
- npm ou yarn

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/ofranklinmachado/sistema-extrato-financeiro.git
cd sistema-extrato-financeiro

# Instale as dependências
npm install
```

### 3. Banco de Dados
O banco de dados SQLite já está configurado e pronto para uso:
```bash
# O arquivo está em: database/sistema.db
# Para recriar o banco (opcional):
sqlite3 database/sistema.db < database/schema-sqlite.sql
```

### 4. Executar o Sistema
```bash
# Modo desenvolvimento
npm run dev

# O sistema estará disponível em:
# http://localhost:3000
```

### 5. Build para Produção
```bash
# Build
npm run build

# Executar produção
npm start
```

## 📁 Estrutura do Projeto

```
sistema-extrato-financeiro/
├── database/
│   ├── sistema.db              # Banco de dados SQLite
│   ├── schema-sqlite.sql       # Schema do banco
│   └── schema.sql              # Schema antigo (Supabase)
├── src/
│   ├── app/
│   │   ├── api/                # API Routes
│   │   │   ├── clientes/       # CRUD de clientes
│   │   │   ├── faturas/        # Importação e staging
│   │   │   └── pagamentos/     # Processamento e staging
│   │   ├── clientes/           # Páginas de clientes
│   │   ├── faturas/            # Páginas de faturas
│   │   ├── pagamentos/         # Páginas de pagamentos
│   │   ├── extrato/            # Páginas de extrato
│   │   ├── globals.css         # Estilos globais
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página inicial
│   ├── components/
│   │   ├── ui/                 # Componentes de UI
│   │   └── layout/             # Componentes de layout
│   ├── lib/
│   │   ├── database.ts         # Conexão e queries SQLite
│   │   ├── formatters.ts       # Funções de formatação
│   │   └── utils.ts            # Utilitários gerais
│   └── types/                  # Definições de tipos
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔄 Fluxo de Trabalho

### 1. Importar Faturas
1. Acesse **Faturas** > **Importar**
2. Faça upload de uma planilha Excel com as colunas:
   - Data Emissão
   - ID Pessoa
   - Cliente/Fornecedor
   - Vlr. Parcela
   - Nº Duplicata
3. Visualize as faturas importadas
4. Selecione as faturas para aprovar
5. Clique em **Aprovar Selecionadas**
6. Os clientes serão criados/atualizados automaticamente

### 2. Lançar Pagamentos
1. Acesse **Pagamentos** > **Novo**
2. Cole os dados de pagamentos copiados da planilha
3. Formato: `Data [TAB] Valor [TAB] Descrição [ID] [TAB] Conta`
4. Clique em **Processar**
5. Visualize os pagamentos processados
6. Selecione os pagamentos para aprovar
7. Clique em **Aprovar Selecionados**

### 3. Consultar Extrato
1. Acesse **Clientes**
2. Clique em **Ver Extrato** no cliente desejado
3. Visualize histórico completo de faturas e pagamentos
4. Acompanhe saldos e limites

## 📊 APIs Disponíveis

### Clientes
- `GET /api/clientes` - Lista todos os clientes
- `GET /api/clientes/[id]` - Busca cliente por ID
- `POST /api/clientes` - Cria ou atualiza cliente
- `PUT /api/clientes/[id]` - Atualiza cliente
- `DELETE /api/clientes/[id]` - Deleta cliente

### Faturas
- `POST /api/faturas/importar` - Importa faturas de Excel
- `GET /api/faturas/staging` - Lista faturas pendentes
- `POST /api/faturas/staging` - Aprova faturas
- `DELETE /api/faturas/staging` - Rejeita faturas

### Pagamentos
- `POST /api/pagamentos/processar` - Processa texto colado
- `GET /api/pagamentos/staging` - Lista pagamentos pendentes
- `POST /api/pagamentos/staging` - Aprova pagamentos
- `DELETE /api/pagamentos/staging` - Rejeita pagamentos

## 🎯 Próximas Funcionalidades

- [ ] Módulo de Extrato do Cliente completo
- [ ] Módulo de Usuários com autenticação
- [ ] Módulo de Configurações do sistema
- [ ] Relatórios e dashboards
- [ ] Exportação de extratos em PDF
- [ ] Notificações de vencimento
- [ ] Gráficos e análises financeiras

## 🐛 Solução de Problemas

### Erro ao importar faturas
- Verifique se o arquivo Excel possui todas as colunas necessárias
- Certifique-se de que os valores estão no formato correto
- Verifique se as datas estão no formato DD/MM/YYYY

### Erro ao processar pagamentos
- Verifique se o texto está separado por TABs
- Certifique-se de que o ID do cliente está entre colchetes [ID]
- Verifique se os valores estão no formato R$ 1.000,00

### Banco de dados corrompido
```bash
# Recriar o banco de dados
rm database/sistema.db
sqlite3 database/sistema.db < database/schema-sqlite.sql
```

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato através do repositório GitHub.

---

**Desenvolvido para otimizar o controle financeiro de pequenas e médias empresas.**

**Versão**: 2.0.0 (SQLite)  
**Data**: Outubro 2025

