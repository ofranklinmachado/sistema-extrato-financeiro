# Sistema de Extrato Financeiro

Sistema completo para gerenciamento de extratos financeiros de clientes, incluindo importação de faturas, lançamento de pagamentos e aplicação de regras de negócio específicas.

## 🚀 Funcionalidades

### ✅ Gestão de Clientes
- Cadastro de clientes com limite de crédito
- Configuração de prazo de pagamento por cliente
- Listagem e edição de clientes

### ✅ Importação de Faturas
- Upload de planilhas Excel/CSV
- Pré-visualização antes da importação
- Área de staging para faturas importadas
- Processamento em lote para o extrato

### ✅ Lançamento de Pagamentos
- Registro de pagamentos recebidos
- Associação automática com clientes
- Múltiplas contas de destino

### ✅ Extrato do Cliente
- Visualização completa do extrato por cliente
- Cálculo automático de saldos
- Aplicação de regras de prazo de pagamento
- Agrupamento por períodos de vencimento

### ✅ Regras de Negócio
- **Clientes com prazo:** Pedidos 01-15 vencem dia 30, pedidos 16-31 vencem dia 15 do mês seguinte
- **Clientes sem prazo:** Pagamento à vista
- Cálculo automático de saldo em aberto e disponível

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Banco de Dados:** Supabase (PostgreSQL)
- **UI Components:** Shadcn/ui
- **Ícones:** Lucide React

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- npm ou yarn

## 🚀 Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd sistema-extrato-financeiro
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o Supabase:**
   - Siga as instruções em `supabase-setup.md`
   - Configure as variáveis de ambiente no `.env.local`

4. **Execute o projeto:**
```bash
npm run dev
```

5. **Acesse o sistema:**
   - Abra http://localhost:3000 no navegador

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas e API routes
│   ├── api/               # Endpoints da API
│   ├── clientes/          # Páginas de gestão de clientes
│   ├── faturas/           # Páginas de faturas
│   ├── pagamentos/        # Páginas de pagamentos
│   └── extrato/           # Páginas de extrato
├── components/            # Componentes React
│   ├── ui/               # Componentes de interface
│   └── layout/           # Componentes de layout
├── lib/                  # Utilitários e configurações
│   ├── supabase.ts       # Cliente Supabase
│   └── business-rules.ts # Regras de negócio
└── types/                # Definições de tipos TypeScript
```

## 🔄 Fluxo de Trabalho

1. **Cadastrar Clientes:** Defina se possuem prazo de pagamento
2. **Importar Faturas:** Upload de planilha → Staging → Processamento
3. **Lançar Pagamentos:** Registre pagamentos recebidos
4. **Consultar Extrato:** Visualize saldo e histórico por cliente

## 🎯 Próximas Funcionalidades

- [ ] Relatórios e dashboards
- [ ] Exportação de extratos em PDF
- [ ] Notificações de vencimento
- [ ] Integração com APIs bancárias
- [ ] Controle de usuários e permissões

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato através do sistema de issues do repositório.

---

**Desenvolvido com ❤️ para otimizar o controle financeiro de pequenas e médias empresas.**
