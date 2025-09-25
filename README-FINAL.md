# Sistema de Extrato Financeiro

## Descrição
Sistema completo para gestão de faturas e extratos financeiros com funcionalidades de importação, processamento e visualização de dados financeiros.

## Funcionalidades Implementadas

### ✅ Dashboard
- Visão geral com estatísticas do sistema
- Cards informativos (Total de Clientes, Faturas Pendentes, Saldo em Aberto, Pagamentos Hoje)
- Ações rápidas para principais funcionalidades
- Últimas atividades do sistema

### ✅ Importação de Faturas
- Upload de arquivos Excel/CSV
- Preview com formatação monetária brasileira (R$ x.xxx,xx)
- Totais de registros e valor total
- Validação de dados antes da importação
- Área de staging para faturas importadas

### ✅ Gestão de Clientes
- Cadastro de novos clientes
- Configuração de limite de crédito
- Opção de prazo de pagamento personalizado
- Listagem de clientes cadastrados

### ✅ Interface e Design
- Layout responsivo com Tailwind CSS
- Navegação intuitiva com navbar global
- Componentes UI consistentes (shadcn/ui)
- Formatação monetária no padrão brasileiro

## Tecnologias Utilizadas

- **Frontend**: Next.js 15.5.3 com TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **File Processing**: xlsx para leitura de planilhas
- **Icons**: Lucide React

## Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas da aplicação
│   ├── api/               # API Routes
│   ├── clientes/          # Páginas de gestão de clientes
│   ├── faturas/           # Páginas de gestão de faturas
│   └── page.tsx           # Dashboard principal
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface
│   └── layout/           # Componentes de layout
├── lib/                  # Utilitários e configurações
└── types/                # Definições de tipos TypeScript
```

## Regras de Negócio Implementadas

### Formatação Monetária
- Valores exibidos no padrão brasileiro: R$ x.xxx,xx
- Armazenamento em centavos no banco de dados
- Conversão automática entre formatos

### Importação de Faturas
- Validação de campos obrigatórios
- Verificação de existência de clientes
- Suporte a múltiplos formatos de data
- Sistema de staging antes do processamento final

### Prazos de Pagamento
- Faturas de 1-15: vencimento no dia 30 do mesmo mês
- Faturas de 16-31: vencimento no dia 15 do mês seguinte
- Configuração por cliente de prazo personalizado

## Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie `.env.local.example` para `.env.local`
   - Configure as credenciais do Supabase

3. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acessar a aplicação:**
   - Abra http://localhost:3000 no navegador

## Configuração do Banco de Dados

O sistema utiliza Supabase com as seguintes tabelas:

- `clientes`: Dados dos clientes
- `faturas_importadas`: Faturas em staging
- `faturas`: Faturas processadas
- `lancamentos`: Movimentações financeiras

Consulte `database/schema.sql` para o schema completo.

## Status do Desenvolvimento

### ✅ Concluído
- Interface completa e responsiva
- Sistema de importação funcional
- Formatação monetária brasileira
- Navegação entre páginas
- Componentes UI padronizados

### 🔧 Pendente de Ajustes
- Correção de erro na API de clientes
- Implementação completa do processamento de faturas
- Testes de integração com Supabase
- Visualização de extratos por cliente

## Próximos Passos

1. Corrigir erro de parsing JSON na API de clientes
2. Implementar conexão completa com Supabase
3. Adicionar testes automatizados
4. Implementar autenticação de usuários
5. Adicionar relatórios e dashboards avançados

## Arquivos de Teste

- `teste-faturas.csv`: Arquivo de exemplo para testar importação

## Observações Técnicas

- Sistema desenvolvido sem Turbopack devido a incompatibilidades
- Utiliza PostCSS com plugin @tailwindcss/postcss
- Configuração otimizada para desenvolvimento local
- Preparado para deploy em produção

