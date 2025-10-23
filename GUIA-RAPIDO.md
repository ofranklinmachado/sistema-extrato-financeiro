# Guia Rápido - Sistema Extrato Financeiro

## 🚀 Início Rápido

### 1. Instalação
```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## 📋 Uso Básico

### Importar Faturas

**Passo 1**: Prepare sua planilha Excel com as colunas:
```
Data Emissão | ID Pessoa | Cliente/Fornecedor | Vlr. Parcela | Nº Duplicata
15/10/2025   | 199       | Bettio Comercio    | R$ 1.500,00  | FAT-001
```

**Passo 2**: No sistema:
1. Clique em **Faturas** > **Importar**
2. Selecione o arquivo Excel
3. Clique em **Importar**
4. Revise as faturas importadas
5. Selecione as que deseja aprovar
6. Clique em **Aprovar Selecionadas**

**Resultado**: 
- Faturas salvas no histórico
- Clientes criados/atualizados automaticamente
- Saldos atualizados

---

### Lançar Pagamentos

**Passo 1**: Copie os dados da planilha (com TABs):
```
17/10/2025	R$ 1.000,00	Pagamentos Bettio/Gprime [199]	G1
17/10/2025	R$ 5.000,00	Pagamentos Cfimports / Gprime [52]	G1
```

**Passo 2**: No sistema:
1. Clique em **Pagamentos** > **Novo**
2. Cole os dados no campo de texto
3. Clique em **Processar**
4. Revise os pagamentos processados
5. Selecione os que deseja aprovar
6. Clique em **Aprovar Selecionados**

**Resultado**:
- Pagamentos salvos no histórico
- Saldos dos clientes atualizados (reduzidos)

---

## 🎯 Formato dos Dados

### Faturas (Excel/CSV)
| Campo | Formato | Exemplo |
|-------|---------|---------|
| Data Emissão | DD/MM/YYYY | 15/10/2025 |
| ID Pessoa | Número | 199 |
| Cliente/Fornecedor | Texto | Bettio Comercio |
| Vlr. Parcela | R$ 1.000,00 | R$ 1.500,00 |
| Nº Duplicata | Texto | FAT-001 |

### Pagamentos (Texto com TABs)
```
[Data]	[Valor]	[Descrição com [ID]]	[Conta]
17/10/2025	R$ 1.000,00	Pagamentos Bettio [199]	G1
```

**Importante**: 
- Use TAB entre os campos (não espaços)
- O ID do cliente deve estar entre colchetes: `[199]`
- O formato do valor deve ser: `R$ 1.000,00`

---

## 🔍 Consultar Informações

### Ver Clientes
1. Clique em **Clientes**
2. Visualize todos os clientes cadastrados
3. Veja saldos, limites e tipo (com prazo ou à vista)

### Ver Extrato de um Cliente
1. Acesse **Clientes**
2. Clique em **Ver Extrato** no cliente desejado
3. Visualize histórico completo de faturas e pagamentos

---

## ⚙️ Regras de Negócio

### Clientes com Prazo de Pagamento
- **Pedidos de 01 a 15**: Vencem dia 30 do mesmo mês
- **Pedidos de 16 a 31**: Vencem dia 15 do mês seguinte

### Clientes sem Prazo (À Vista)
- Pagamento imediato, sem prazo de vencimento

### Cálculo de Saldos
- **Saldo em Aberto** = Total de faturas - Total de pagamentos
- **Saldo Disponível** = Limite de crédito - Saldo em aberto

---

## 🐛 Problemas Comuns

### Faturas não importam
✅ **Solução**: Verifique se todas as colunas estão presentes e com os nomes corretos

### Pagamentos não processam
✅ **Solução**: Certifique-se de que está usando TAB entre os campos, não espaços

### Cliente não aparece
✅ **Solução**: Importe uma fatura ou pagamento com o ID do cliente para criá-lo automaticamente

---

## 📞 Comandos Úteis

```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Ver banco de dados
sqlite3 database/sistema.db "SELECT * FROM clientes;"

# Recriar banco de dados
rm database/sistema.db
sqlite3 database/sistema.db < database/schema-sqlite.sql
```

---

## 📊 Exemplo Completo

### 1. Criar arquivo de faturas (faturas.csv)
```csv
Data Emissão,ID Pessoa,Cliente/Fornecedor,Vlr. Parcela,Nº Duplicata
15/10/2025,199,Bettio Comercio,R$ 1.500,00,FAT-001
20/10/2025,52,Cfimports Ltda,R$ 3.200,50,FAT-002
```

### 2. Importar no sistema
- Faturas > Importar > Selecionar arquivo > Importar > Aprovar

### 3. Copiar pagamentos da planilha
```
17/10/2025	R$ 1.000,00	Pagamentos Bettio [199]	G1
17/10/2025	R$ 2.000,00	Pagamentos Cfimports [52]	G1
```

### 4. Lançar no sistema
- Pagamentos > Novo > Colar > Processar > Aprovar

### 5. Ver resultado
- Clientes > Ver lista atualizada com saldos

---

**Pronto! Seu sistema está funcionando! 🎉**

