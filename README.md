# SB Pocket — IAF Fácil

**PWA** · by Setor de TI · Grupo SB Monteiro

O **SB Pocket — IAF Fácil** é um app de guia de bolso criado para facilitar o acompanhamento diário dos indicadores do IAF. A aplicação permite que colaboradores visualizem os resultados atualizados por pilar, acompanhem o relatório diário e configurem quais pilares desejam visualizar em destaque.

![SB Pocket — Telas do app](./src/assets/readme-todas-as-telas.png)

---

## Objetivo

Centralizar, simplificar e tornar mais acessível o acompanhamento dos indicadores do IAF, reduzindo a dependência de consultas manuais na extranet e oferecendo uma visualização rápida dos principais resultados do dia.

Fluxo geral da solução:

```txt
Extensão da Extranet
↓
n8n
↓
Firebase Firestore
↓
SB Pocket
```

---

## Pilares do IAF

O app organiza os indicadores nos seguintes pilares:

- Gestão Comercial
- Omni & Digital
- ESG
- Excelência Operacional
- Gestão de Pessoas
- Finanças

Chaves internas usadas no sistema:

```txt
gestao_comercial
omni_digital
esg
excelencia_operacional
gestao_pessoas
financas
```

---

## Funcionalidades principais

- Login por CPF e senha.
- Leitura de usuários cadastrados no Firebase.
- Tela Home com resumo diário dos pilares.
- Tela de Dados com indicadores organizados por pilar.
- Tela de Configuração para escolha dos pilares em destaque.
- Salvamento das preferências do usuário no Firebase.
- Leitura do relatório mais recente salvo no Firestore.
- Comparação entre relatório atual e relatório anterior, quando disponível.
- Tratamento para quando não existe relatório anterior.
- Estrutura PWA instalável via navegador.
- Integração com n8n para atualização automática dos dados.

---

## Estrutura geral do app

Estrutura base esperada:

```txt
src/
├── app/
│   ├── App.tsx
│   ├── routes/
│   ├── layouts/
│   ├── providers/
│   ├── hooks/
│   ├── pages/
│   ├── components/
│   └── types/
│
├── services/
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── authService.ts
│   ├── userService.ts
│   └── iafReportService.ts
│
├── assets/
├── styles/
└── main.tsx
```

---

## Rotas principais

```txt
/                 → Splash / Tela inicial
/login            → Login
/home             → Home
/dados            → Relatório diário / Dados
/config           → Configurações
/notificacoes     → Notificações
/perfil           → Perfil
```

As rotas internas devem ser protegidas. Caso o usuário tente acessar uma rota privada sem estar logado, deve ser redirecionado para `/login`.

---

## Login

O login é feito usando os usuários cadastrados na coleção `users` do Firestore.

Regras esperadas:

```txt
1. Limpar o CPF digitado.
2. Buscar o documento users/{cpfLimpo}.
3. Se não existir, exibir "Usuário não encontrado".
4. Se active !== true, exibir "Usuário inativo".
5. Se a senha estiver incorreta, exibir "Senha incorreta".
6. Se os dados estiverem corretos, liberar acesso ao app.
```

Importante:

```txt
O CPF confiável deve ser sempre o ID do documento.
Não depender de um campo cpf interno, pois CPFs iniciados com zero podem ser convertidos de forma incorreta se tratados como número.
```

Exemplo de leitura segura no app:

```ts
return {
  id: snapshot.id,
  cpf: snapshot.id,
  ...data,
};
```

---

## Firebase Firestore

### Coleção `users`

Cada usuário é salvo como um documento na coleção `users`.

O ID do documento deve ser o CPF limpo, com 11 dígitos:

```txt
users/{cpf}
```

Estrutura recomendada:

```json
{
  "name": "Nome do Usuário",
  "password": "senha_definida",
  "active": true,
  "selectedPillars": [
    "gestao_comercial",
    "omni_digital",
    "esg",
    "excelencia_operacional",
    "gestao_pessoas",
    "financas"
  ]
}
```

Observação:

```txt
O campo selectedPillars não define permissão.
Ele é apenas uma preferência visual do usuário.
Todos os usuários logados podem acessar todos os dados do relatório.
```

---

### Coleção `iafReports`

Cada relatório diário é salvo como documento na coleção `iafReports`.

O ID do documento deve seguir o formato:

```txt
YYYY-MM-DD
```

Exemplo:

```txt
iafReports/2026-05-15
```

Estrutura esperada:

```json
{
  "reportDate": "YYYY-MM-DD",
  "reportDateBr": "DD/MM/YYYY",
  "createdAt": "ISO_DATE",
  "createdAtBr": "DD/MM/YYYY, HH:mm:ss",
  "executedAt": "ISO_DATE",
  "executedAtBr": "DD/MM/YYYY, HH:mm:ss",
  "source": "chrome_extension",
  "page": "origem_da_captura",
  "endpoint": "endpoint_origem",
  "indicators": [],
  "pillarsSummary": {}
}
```

Campos de debug podem existir durante manutenção:

```json
{
  "debugUpdatedAt": "ISO_DATE",
  "debugUpdatedAtBr": "DD/MM/YYYY, HH:mm:ss",
  "debugSource": "n8n-firestore",
  "debugRunId": "identificador_da_execucao"
}
```

Esses campos ajudam a confirmar se o app está lendo o relatório mais recente.

---

## Indicadores

Cada item em `indicators` representa um indicador do IAF.

Estrutura base:

```json
{
  "code": "1.1",
  "title": "Nome do indicador",
  "pillar": "gestao_comercial",
  "indicador": "1.1 Nome do indicador",
  "link": "",
  "habilitador": "N/A",
  "realizado": {
    "tipo": "moeda",
    "raw": 0,
    "formatado": "R$ 0,00"
  },
  "pontosAtingidos": {
    "tipo": "pontos",
    "raw": 0,
    "formatado": "0,00 pts"
  },
  "percentualAtingido": {
    "tipo": "percentual",
    "raw": 0,
    "formatado": "0,00%"
  },
  "metaPontos": {
    "tipo": "pontos",
    "raw": 0,
    "formatado": "0,00 pts"
  },
  "metaValor": {
    "tipo": "moeda",
    "raw": 0,
    "formatado": "R$ 0,00"
  },
  "faltaMetaPontos": {
    "tipo": "pontos",
    "raw": 0,
    "formatado": "0,00 pts"
  },
  "faltaMetaPercentual": {
    "tipo": "percentual",
    "raw": 0,
    "formatado": "0,00%"
  }
}
```

---

## Resumo e comparação

O app deve buscar:

```txt
1. Relatório mais recente
2. Relatório imediatamente anterior
```

A ordenação deve ser feita pelo ID do documento no formato `YYYY-MM-DD`.

Exemplo:

```txt
Relatório atual: iafReports/2026-05-15
Relatório anterior: iafReports/2026-05-14
```

A comparação é feita por pilar, usando a média de `percentualAtingido.raw`.

Regras:

```txt
Atual > Anterior → Resultado alcançado se aproximou da meta
Atual < Anterior → Resultado alcançado se distanciou da meta
Atual = Anterior → Resultado alcançado manteve-se estável
```

Caso não exista relatório anterior:

```txt
Mostrar o relatório atual normalmente.
Exibir mensagem: "Sem relatório anterior para comparação".
Não tratar como erro.
```

---

## Preferências do usuário

A tela de Configuração permite selecionar quais pilares o usuário deseja visualizar em destaque.

Essas preferências são salvas em:

```txt
users/{cpf}/selectedPillars
```

Comportamento esperado:

```txt
1. Usuário entra na tela Configuração.
2. Clica no ícone de edição.
3. Altera os pilares desejados.
4. Clica em "Salvar escolhas".
5. O app atualiza apenas selectedPillars no Firestore.
```

Importante:

```txt
selectedPillars é apenas preferência visual.
Não restringe acesso aos dados.
```

---

## Regras de segurança do Firestore

Versão recomendada para o estágio atual do projeto:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /iafReports/{reportId} {
      allow read: if true;
      allow write: if false;
    }

    match /users/{userId} {
      allow get: if true;
      allow list: if false;
      allow create: if false;
      allow delete: if false;

      allow update: if request.resource.data.diff(resource.data)
        .affectedKeys()
        .hasOnly(['selectedPillars']);
    }
  }
}
```

Essas regras permitem:

```txt
- O app ler relatórios.
- O app buscar um usuário específico.
- O app salvar apenas selectedPillars.
```

Essas regras bloqueiam:

```txt
- Escrita direta nos relatórios pelo app.
- Listagem de todos os usuários.
- Criação de usuários pelo app.
- Alteração de dados sensíveis do usuário pelo app.
```

Observação:

```txt
O n8n grava usando Service Account.
Por isso, ele consegue atualizar o Firestore mesmo com as escritas bloqueadas para o front.
```

---

## n8n

### Fluxo principal de relatórios

Fluxo responsável por receber os dados da extensão e salvar o relatório no Firestore:

```txt
Webhook
↓
Preparar relatório Firebase
↓
Create or update a document
↓
Respond to Webhook
```

Responsabilidades:

```txt
Webhook:
Recebe o payload enviado pela extensão.

Preparar relatório Firebase:
Normaliza indicadores, define pilares, gera datas formatadas e monta o objeto final.

Create or update a document:
Salva ou atualiza o relatório em iafReports/{YYYY-MM-DD}.

Respond to Webhook:
Retorna a resposta para a extensão após o processamento.
```

### Fluxo de importação de usuários

Fluxo responsável por importar usuários em lote a partir de uma planilha:

```txt
When clicking Execute workflow
↓
Google Sheets - Get row(s)
↓
preparar usuarios
↓
Create or update a document
```

Responsabilidades:

```txt
Google Sheets:
Lê os colaboradores da planilha.

preparar usuarios:
Normaliza nome, CPF, senha, status e pilares padrão.

Create or update a document:
Cria ou atualiza documentos em users/{cpf}.
```

### Versões estáveis registradas

```txt
N8N versão estável: "1 teste sbpocket" — May 15, 11:02:22
N8N versão estável: "Versão adição de cpf" — May 15, 16:35:21
```

---

## Importação de usuários

Estrutura esperada da planilha:

```txt
nome | cpf | senha
```

A senha pode seguir o padrão:

```txt
3 primeiros números do CPF + @ + primeiro nome
```

Exemplo conceitual:

```txt
CPF: 00000000000
Nome: Nome Exemplo
Senha: 000@nome
```

O CPF deve ser normalizado com 11 dígitos:

```js
function cleanCpf(cpf) {
  const onlyNumbers = String(cpf ?? "").replace(/\D/g, "");
  return onlyNumbers.padStart(11, "0");
}
```

No Firestore, o CPF deve ser usado como ID do documento:

```txt
users/{cpf}
```

Recomendação:

```txt
Não salvar o CPF como campo interno.
Usar o ID do documento como CPF confiável.
```

---

## Rodando o projeto

Instalar dependências:

```bash
npm i
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Gerar build de produção:

```bash
npm run build
```

Pré-visualizar build:

```bash
npm run preview
```

---

## PWA

O app pode ser instalado pelo navegador.

No Chrome ou Edge:

```txt
Abrir o app
↓
Menu do navegador
↓
Instalar app / Adicionar à tela inicial
```

Caso alterações recentes não apareçam, pode ser necessário limpar cache da PWA:

```txt
DevTools
↓
Application
↓
Service Workers
↓
Unregister
↓
Storage
↓
Clear site data
```

---

## Cuidados de manutenção

- Não expor URLs sensíveis, tokens, chaves privadas ou credenciais no README.
- Não subir arquivos `.env` ou chaves de Service Account para o GitHub.
- Não usar dados reais de CPF/senha em exemplos públicos.
- Não depender do campo `date` do Firestore para exibir a data principal.
- Usar `reportDateBr`, `reportDate` ou o ID do documento.
- Usar o ID do documento como CPF confiável.
- Manter o fluxo de relatórios separado do fluxo de importação de usuários.
- Validar alterações primeiro em poucos registros antes de executar em lote.
- Evitar deixar regras como `allow read, write: if true`.

---

## Status atual

- App convertido em PWA.
- Firebase conectado.
- Login com usuários do Firestore funcionando.
- Relatórios sendo salvos em `iafReports`.
- App lendo relatório atualizado.
- Preferências de pilares sendo salvas em `selectedPillars`.
- Importação de usuários em lote via Google Sheets e n8n funcionando.
- Regras de segurança ajustadas para reduzir risco de escrita indevida.

---
### Versões N8N:
 - N8N versão estáve:  "1 teste sbpocket" - May 15, 11:02:22
 - N8N versão estáve: " Versão adicção de cpf" - May 15, 16:35:21
