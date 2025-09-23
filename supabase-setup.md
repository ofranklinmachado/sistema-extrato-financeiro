# Configuração do Supabase para o Sistema de Extrato Financeiro

## Passos para configurar o Supabase:

### 1. Criar projeto no Supabase
- Acesse https://supabase.com
- Crie uma nova conta ou faça login
- Clique em "New Project"
- Escolha um nome para o projeto (ex: "sistema-extrato-financeiro")
- Defina uma senha para o banco de dados
- Selecione uma região próxima (ex: South America)

### 2. Obter as credenciais
Após criar o projeto, vá em Settings > API e copie:
- **Project URL** (algo como: https://xxxxx.supabase.co)
- **anon/public key** (chave pública para uso no frontend)

### 3. Configurar as variáveis de ambiente
No arquivo `.env.local`, adicione:
```
NEXT_PUBLIC_SUPABASE_URL=sua_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Executar o script SQL
No Supabase Dashboard, vá em SQL Editor e execute o conteúdo do arquivo `database/schema.sql`

### 5. Configurar RLS (Row Level Security)
Por enquanto, para desenvolvimento, você pode desabilitar o RLS nas tabelas:
- Vá em Authentication > Policies
- Para cada tabela, desabilite temporariamente o RLS

## Estrutura das tabelas criadas:
- `clientes` - Dados dos clientes e configurações de prazo
- `faturas_importadas` - Área de staging para faturas importadas
- `lancamentos` - Registro de faturas e pagamentos no extrato
- `contas` - Contas bancárias para recebimento

## Próximos passos:
1. Configure as credenciais do Supabase
2. Execute o script SQL
3. Teste a conexão acessando a página de clientes
4. Cadastre alguns clientes de teste
5. Importe faturas e teste o fluxo completo

