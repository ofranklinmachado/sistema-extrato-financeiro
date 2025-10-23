# Documentação das APIs - Sistema Extrato Financeiro

## 📡 Endpoints Disponíveis

Base URL: `http://localhost:3000/api`

---

## 👥 Clientes

### GET /api/clientes
Lista todos os clientes ordenados por nome.

**Response 200:**
```json
[
  {
    "id": 199,
    "nome": "Bettio Comercio",
    "saldo_aberto_centavos": 150000,
    "saldo_disponivel_centavos": 850000,
    "limite_centavos": 1000000,
    "possui_prazo_pagamento": 1,
    "created_at": "2025-10-23 19:20:09",
    "updated_at": "2025-10-23 19:20:09"
  }
]
```

---

### GET /api/clientes/[id]
Busca um cliente específico por ID.

**Parâmetros:**
- `id` (path): ID numérico do cliente

**Response 200:**
```json
{
  "id": 199,
  "nome": "Bettio Comercio",
  "saldo_aberto_centavos": 150000,
  "saldo_disponivel_centavos": 850000,
  "limite_centavos": 1000000,
  "possui_prazo_pagamento": 1,
  "created_at": "2025-10-23 19:20:09",
  "updated_at": "2025-10-23 19:20:09"
}
```

**Response 404:**
```json
{
  "error": "Cliente não encontrado"
}
```

---

### POST /api/clientes
Cria ou atualiza um cliente.

**Request Body:**
```json
{
  "id": 199,
  "nome": "Bettio Comercio",
  "limite_centavos": 1000000,
  "possui_prazo_pagamento": true
}
```

**Response 200:**
```json
{
  "id": 199,
  "nome": "Bettio Comercio",
  "saldo_aberto_centavos": 0,
  "saldo_disponivel_centavos": 0,
  "limite_centavos": 1000000,
  "possui_prazo_pagamento": 1,
  "created_at": "2025-10-23 19:20:09",
  "updated_at": "2025-10-23 19:20:09"
}
```

---

### PUT /api/clientes/[id]
Atualiza um cliente existente.

**Parâmetros:**
- `id` (path): ID numérico do cliente

**Request Body:**
```json
{
  "nome": "Bettio Comercio Ltda",
  "limite_centavos": 1500000,
  "possui_prazo_pagamento": true
}
```

**Response 200:**
```json
{
  "id": 199,
  "nome": "Bettio Comercio Ltda",
  "saldo_aberto_centavos": 150000,
  "saldo_disponivel_centavos": 1350000,
  "limite_centavos": 1500000,
  "possui_prazo_pagamento": 1,
  "created_at": "2025-10-23 19:20:09",
  "updated_at": "2025-10-23 19:25:30"
}
```

---

### DELETE /api/clientes/[id]
Deleta um cliente.

**Parâmetros:**
- `id` (path): ID numérico do cliente

**Response 200:**
```json
{
  "message": "Cliente deletado com sucesso"
}
```

---

## 📄 Faturas

### POST /api/faturas/importar
Importa faturas de um arquivo Excel.

**Request:**
- Content-Type: `multipart/form-data`
- Campo: `file` (arquivo Excel/CSV)

**Formato do Excel:**
| Data Emissão | ID Pessoa | Cliente/Fornecedor | Vlr. Parcela | Nº Duplicata |
|--------------|-----------|-------------------|--------------|--------------|
| 15/10/2025   | 199       | Bettio Comercio   | R$ 1.500,00  | FAT-001      |

**Response 200:**
```json
{
  "message": "5 faturas importadas com sucesso",
  "faturas": [
    {
      "id": 1,
      "cliente_id": 199,
      "cliente_nome": "Bettio Comercio",
      "numero_fatura": "FAT-001",
      "data_emissao": "2025-10-15",
      "valor_centavos": 150000,
      "status": "pendente"
    }
  ]
}
```

---

### GET /api/faturas/staging
Lista faturas pendentes de aprovação.

**Response 200:**
```json
[
  {
    "id": 1,
    "cliente_id": 199,
    "cliente_nome": "Bettio Comercio",
    "numero_fatura": "FAT-001",
    "data_emissao": "2025-10-15",
    "valor_centavos": 150000,
    "status": "pendente",
    "created_at": "2025-10-23 19:30:00"
  }
]
```

---

### POST /api/faturas/staging
Aprova faturas em lote.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response 200:**
```json
{
  "message": "3 faturas aprovadas com sucesso"
}
```

**Ações realizadas:**
1. Verifica/cria cliente se não existir
2. Calcula prazo de pagamento se aplicável
3. Insere fatura no histórico
4. Atualiza saldo do cliente
5. Marca fatura como aprovada

---

### DELETE /api/faturas/staging
Rejeita faturas em lote.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response 200:**
```json
{
  "message": "3 faturas rejeitadas"
}
```

---

## 💰 Pagamentos

### POST /api/pagamentos/processar
Processa texto colado de pagamentos.

**Request Body:**
```json
{
  "texto": "17/10/2025\tR$ 1.000,00\tPagamentos Bettio [199]\tG1\n17/10/2025\tR$ 5.000,00\tPagamentos Cfimports [52]\tG1"
}
```

**Formato do texto:**
```
[Data][TAB][Valor][TAB][Descrição [ID]][TAB][Conta]
```

**Response 200:**
```json
{
  "message": "2 pagamentos processados com sucesso",
  "pagamentos": [
    {
      "id": 1,
      "cliente_id": 199,
      "cliente_nome": "Bettio Comercio",
      "data_pagamento": "2025-10-17",
      "valor_centavos": 100000,
      "conta_sigla": "G1",
      "status": "pendente"
    }
  ]
}
```

---

### GET /api/pagamentos/staging
Lista pagamentos pendentes de aprovação.

**Response 200:**
```json
[
  {
    "id": 1,
    "cliente_id": 199,
    "cliente_nome": "Bettio Comercio",
    "data_pagamento": "2025-10-17",
    "valor_centavos": 100000,
    "conta_sigla": "G1",
    "status": "pendente",
    "created_at": "2025-10-23 19:35:00"
  }
]
```

---

### POST /api/pagamentos/staging
Aprova pagamentos em lote.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response 200:**
```json
{
  "message": "3 pagamentos aprovados com sucesso"
}
```

**Ações realizadas:**
1. Verifica/cria cliente se não existir (pagamento antecipado)
2. Insere pagamento no histórico
3. Atualiza saldo do cliente (reduz saldo em aberto)
4. Marca pagamento como aprovado

---

### DELETE /api/pagamentos/staging
Rejeita pagamentos em lote.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response 200:**
```json
{
  "message": "3 pagamentos rejeitados"
}
```

---

## 🔧 Tipos de Dados

### Cliente
```typescript
interface Cliente {
  id: number;                      // ID numérico único
  nome: string;                    // Nome do cliente
  saldo_aberto_centavos: number;   // Saldo devedor em centavos
  saldo_disponivel_centavos: number; // Saldo disponível calculado
  limite_centavos: number;         // Limite de crédito em centavos
  possui_prazo_pagamento: boolean; // Se possui prazo ou é à vista
  created_at: string;              // Data de criação (ISO)
  updated_at: string;              // Data de atualização (ISO)
}
```

### Fatura
```typescript
interface Fatura {
  id: number;
  cliente_id: number;
  numero_fatura: string;
  data_emissao: string;           // Formato: YYYY-MM-DD
  valor_centavos: number;
  prazo_pagamento: string | null; // Formato: YYYY-MM-DD
  created_at: string;
}
```

### Pagamento
```typescript
interface Pagamento {
  id: number;
  cliente_id: number;
  data_pagamento: string;         // Formato: YYYY-MM-DD
  valor_centavos: number;
  conta_sigla: string;            // Ex: G1, RKU, WHE
  created_at: string;
}
```

---

## 📝 Exemplos de Uso

### Exemplo 1: Criar cliente e importar fatura

```javascript
// 1. Criar cliente
const cliente = await fetch('/api/clientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 199,
    nome: 'Bettio Comercio',
    limite_centavos: 1000000,
    possui_prazo_pagamento: true
  })
});

// 2. Importar faturas
const formData = new FormData();
formData.append('file', arquivoExcel);

const faturas = await fetch('/api/faturas/importar', {
  method: 'POST',
  body: formData
});

// 3. Aprovar faturas
await fetch('/api/faturas/staging', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ids: [1, 2, 3] })
});
```

### Exemplo 2: Processar e aprovar pagamentos

```javascript
// 1. Processar texto colado
const texto = "17/10/2025\tR$ 1.000,00\tPagamentos Bettio [199]\tG1";

const pagamentos = await fetch('/api/pagamentos/processar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ texto })
});

// 2. Aprovar pagamentos
await fetch('/api/pagamentos/staging', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ids: [1, 2] })
});
```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida (dados faltando ou formato incorreto) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## 🔐 Observações de Segurança

- Atualmente o sistema não possui autenticação
- Todas as APIs estão abertas
- Recomendado implementar autenticação JWT ou similar antes de produção
- Validar sempre os dados de entrada no backend

---

**Versão da API**: 2.0.0  
**Última atualização**: Outubro 2025

