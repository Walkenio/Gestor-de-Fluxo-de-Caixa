# 📊 Sistema de Fluxo de Caixa Mensal
**Stack alvo:** Nuxt 4 + PostgreSQL + Drizzle ORM  
**Origem do modelo:** Planilha Excel de fluxo de caixa mensal (entradas, saídas e saldo)

---

## 1. OBJETIVO DO PROJETO

Desenvolver um sistema web de **controle de fluxo de caixa mensal**, inspirado diretamente em uma planilha Excel existente, permitindo:

- Registrar **entradas (receitas)** e **saídas (despesas)**
- Controlar fluxo **mês a mês**
- Calcular automaticamente:
  - Total de entradas
  - Total de saídas
  - Saldo final (caixa)
- Armazenar todos os dados em **banco de dados PostgreSQL**
- Utilizar **Drizzle ORM**
- Backend integrado via **Nuxt 4 Server Routes**

O sistema substitui a planilha, mantendo sua lógica contábil.

---

## 2. REFERÊNCIA VISUAL (PLANILHA)

A planilha original contém:

### Bloco superior
- Saldo inicial
- Total entrou
- Total saiu
- Caixa (saldo final)

### Tabela de ENTRADAS
- Data
- Demanda / descrição
- Valor cobrado
- Valor recebido

### Tabela de SAÍDAS
- Data
- Despesa / descrição
- Valor da saída
- Valor pago

Cada aba representa **um mês** (Janeiro, Fevereiro, etc.).

---

## 3. REQUISITOS FUNCIONAIS

### 3.1 Fluxo Mensal
- O sistema deve permitir criar um **fluxo de caixa por mês e ano**
- Exemplo: Fevereiro / 2026

### 3.2 Entradas
Cada entrada deve conter:
- Data
- Descrição
- Valor previsto
- Valor recebido
- Relacionamento com um mês específico

### 3.3 Saídas
Cada saída deve conter:
- Data
- Descrição
- Valor da saída
- Relacionamento com um mês específico

### 3.4 Cálculos
- Total de entradas = soma dos valores recebidos
- Total de saídas = soma dos valores pagos
- Saldo final = saldo inicial + entradas − saídas
- Saldo **não deve ser salvo**, apenas calculado

---

## 4. REQUISITOS NÃO FUNCIONAIS

- Código limpo e organizado
- Separação clara entre:
  - Banco de dados
  - API
  - Frontend
- Uso de **TypeScript**
- Uso de **Drizzle ORM**
- Persistência em PostgreSQL
- Arquitetura compatível com produção

---

## 5. STACK TECNOLÓGICA

### Frontend
- Nuxt 4
- Composition API
- Tailwind CSS (opcional, mas recomendado)

### Backend
- Nuxt 4 Server Routes
- TypeScript

### Banco de Dados
- PostgreSQL
- Drizzle ORM

---

## 6. MODELAGEM DE DADOS (LÓGICA)

### Entidades principais:

#### CashFlow (Fluxo Mensal)
Representa um mês específico.

Campos:
- id
- month (1–12)
- year
- initial_balance
- created_at

---

#### Entry (Entrada)
Representa um valor que entrou ou entrará.

Campos:
- id
- cash_flow_id
- date
- description
- amount_expected
- amount_received

---

#### Expense (Saída)
Representa um gasto.

Campos:
- id
- cash_flow_id
- date
- description
- amount

---

## 7. RELACIONAMENTOS

- Um **CashFlow** possui muitas **Entries**
- Um **CashFlow** possui muitas **Expenses**
- Entries e Expenses pertencem obrigatoriamente a um CashFlow

---

## 8. API (CONCEITO)

### Fluxo mensal
- Criar mês
- Buscar mês por ID
- Buscar mês por ano/mês

### Entradas
- Criar entrada
- Listar entradas por mês
- Atualizar entrada
- Remover entrada

### Saídas
- Criar saída
- Listar saídas por mês
- Atualizar saída
- Remover saída

### Relatório
- Retornar:
  - Total de entradas
  - Total de saídas
  - Saldo final

---

## 9. LÓGICA DE CÁLCULO (IMPORTANTE)

saldo_final =
saldo_inicial
+ soma(amount_received das entradas)
- soma(amount das saídas)

Essa lógica deve ser centralizada (backend ou service).

---

## 10. CONSIDERAÇÕES IMPORTANTES

- Não duplicar lógica entre frontend e backend
- Preferir cálculos no backend
- Garantir consistência dos dados
- Preparar estrutura para futura autenticação de usuários
- Preparar estrutura para relatórios (PDF, gráficos)

---

## 11. FUTURAS EVOLUÇÕES (NÃO OBRIGATÓRIO)

- Autenticação (login por usuário)
- Multiusuário
- Importação de Excel
- Gráficos mensais
- Exportação em PDF
- Dashboard anual

---

## 12. PAPEL DA IA (CLAUDE CODE)

A IA deve:
- Decidir a melhor arquitetura Nuxt 4
- Criar schemas Drizzle
- Criar migrations
- Criar server routes
- Criar serviços de cálculo
- Sugerir melhorias técnicas
- Garantir boas práticas de TypeScript

---

## 13. RESTRIÇÕES

- Não utilizar ORMs diferentes do Drizzle
- Não utilizar banco diferente de PostgreSQL
- Não salvar saldo final no banco
- Manter aderência ao modelo da planilha original

---

## 14. RESULTADO ESPERADO

Um sistema funcional que substitui a planilha Excel, mantendo:
- Clareza
- Organização
- Controle financeiro mensal
- Base sólida para crescimento futuro
