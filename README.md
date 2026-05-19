# SB Pocket — IAF Fácil

**PWA** · by Setor de TI · Grupo SB Monteiro

O **SB Pocket — IAF Fácil** é uma PWA mobile para acompanhamento diário dos indicadores do IAF. Os dados são capturados da extranet do Grupo Boticário via extensão Chrome, processados pelo n8n, salvos no Firebase Firestore e exibidos no app em tempo real para os colaboradores.

![SB Pocket — Telas do app](./src/assets/readme-todas-as-telas.png)

---

## Visão geral

```txt
Extensão Chrome
→ Extranet Grupo Boticário (APIs consolidadas do IAF)
→ n8n (normalização e processamento)
→ Firebase Firestore (iafReports + iafLatest)
→ SB Pocket PWA (exibição para o colaborador)
```

---

## Funcionalidades principais

- Login por CPF e senha com validação de usuário ativo no Firebase.
- Rotas protegidas — redireciona para `/login` sem sessão ativa.
- Home com resumo diário do IAF:
  - Pontuação do CP com seta animada indicando alta ou queda em relação ao relatório anterior.
  - Percentual geral do CP.
  - Classificação/rating com ícone de medalha (`UNCLASSIFIED` exibido como "Não classificado").
- Cards por pilar na Home com:
  - Variação percentual em relação ao relatório anterior (`+X%` / `-X%`).
  - Atingimento oficial e falta para meta (dados de `pillarsCards`).
  - Média geral dos indicadores do pilar.
  - Mensagem de comparação (subiu, caiu, estável ou sem comparação).
  - Clique no card leva para a tela Dados já filtrada pelo pilar.
- Tela **IAF · Relatório diário** com todos os indicadores do pilar selecionado.
- Filtro da tela Dados respeitando os pilares escolhidos em Configurações.
- Tela de **Configurações** para selecionar pilares acompanhados — salvo no Firebase.
- Registro de acessos diários em `accessLogs`.
- Rodapé de Configurações mostrando usuários ativos ontem e hoje.
- Instalação como PWA no Android (Chrome) e iPhone (Safari).
- Responsividade mobile com safe-area, ajuste para tablets e tela cheia em `dvh`.

---

## Pilares do app

| Key visual | Nome exibido |
|---|---|
| `gestao_comercial` | Gestão Comercial |
| `omni_digital` | Omni & Digital |
| `esg` | ESG |
| `excelencia_operacional` | Excelência Operacional |
| `gestao_pessoas_financas` | Gestão de Pes. e Fin. |

**"Gestão de Pes. e Fin."** é um pilar consolidado. Os indicadores chegam com as chaves:
- `gestao_pessoas`
- `financas`

O app mapeia ambas para `gestao_pessoas_financas` ao calcular médias e comparações. O card oficial em `pillarsCards` usa a chave `gestao_pessoas_financas`.

---

## Estrutura geral do app

```txt
src/
├── app/
│   ├── App.tsx
│   ├── routes/
│   ├── layouts/         MobileFrame — frame responsivo para mobile e tablet
│   ├── providers/       AuthProvider — sessão e registro de acesso
│   ├── hooks/           useAuth, useIafReport
│   ├── pages/           HomePage, DataPage, ConfigPage, LoginPage, SplashPage
│   ├── components/
│   ├── constants/       pillars.ts, colors.ts
│   └── types/           iaf.ts, auth.ts, user.ts
│
├── services/
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── authService.ts
│   ├── userService.ts
│   ├── iafReportService.ts
│   └── accessLogService.ts
│
├── assets/
├── styles/
└── main.tsx
```

---

## Rotas principais

```txt
/              → Splash
/login         → Login
/home          → Home
/dados         → IAF · Relatório diário
/config        → Configurações
/notificacoes  → Notificações
```

---

## Estrutura de dados no Firebase

### `users`

```txt
users/{cpf}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string | Nome completo |
| `password` | string | Senha de acesso |
| `active` | boolean | Usuário habilitado |
| `selectedPillars` | string[] | Pilares em destaque na Home |

- O CPF confiável é sempre o **ID do documento** — não depender de campo interno.
- CPFs com zero à esquerda são preservados por serem tratados como string.
- `selectedPillars` é preferência visual, não regra de segurança.

---

### `iafReports`

```txt
iafReports/{YYYY-MM-DD}
```

Histórico diário dos relatórios. Cada documento representa um dia.

| Campo | Descrição |
|---|---|
| `reportDate` | Data no formato `YYYY-MM-DD` |
| `reportDateBr` | Data no formato `DD/MM/YYYY` |
| `createdAt` / `createdAtBr` | Criação do documento |
| `executedAt` / `executedAtBr` | Execução da captura |
| `updatedAt` / `updatedAtBr` | Última atualização |
| `source` | Origem (`chrome_extension`) |
| `page` | Página de captura |
| `endpoint` | Endpoint origem |
| `indicators` | Array de indicadores detalhados |
| `pillarsSummary` | Resumo calculado por pilar |
| `pillarsCards` | Dados consolidados oficiais por pilar |
| `rankingSummary` | Pontuação, percentual e rating do CP |

---

### `iafLatest`

```txt
iafLatest/current
```

Última atualização capturada. O front usa este documento como ponto de entrada.

| Campo | Descrição |
|---|---|
| `reportDate` | Data no formato `DD/MM/YYYY` |
| `reportDateBr` | Data no formato `DD/MM/YYYY` |
| `updatedAt` / `updatedAtBr` | Timestamp da última atualização |
| `sourceReportKey` | Chave do relatório atual (ex: `report_2026-05-19`) |
| `indicators` | Indicadores da última captura |
| `pillarsSummary` | Resumo por pilar |
| `pillarsCards` | Dados oficiais consolidados por pilar |
| `rankingSummary` | Pontuação, percentual e rating |

`sourceReportKey` segue o formato `report_YYYY-MM-DD`. O front remove o prefixo `report_` para buscar o documento correspondente em `iafReports`.

> **Atenção:** não converter `sourceReportId` via Timestamp para definir o ID do relatório atual — a conversão por `toISOString()` pode retroceder um dia por fuso horário. Usar sempre `sourceReportKey`.

---

### `accessLogs`

```txt
accessLogs/{dateKey}_{userId}
```

| Campo | Descrição |
|---|---|
| `dateKey` | Data no formato `YYYY-MM-DD` (fuso São Paulo) |
| `dateBr` | Data no formato `DD/MM/YYYY` |
| `userId` | CPF do usuário |
| `name` | Nome do usuário |
| `lastAccessAt` | ISO timestamp do último acesso |
| `lastAccessAtBr` | Data/hora formatada (pt-BR) |

Usado para contar usuários únicos que acessaram o app ontem e hoje. Exibido no rodapé de Configurações.

---

## Estrutura dos indicadores

Cada item em `indicators[]` representa um indicador individual do IAF capturado da API `iaf-consolidated-indicators`.

```json
{
  "code": "1.1",
  "title": "Nome do indicador",
  "pillar": "gestao_comercial",
  "indicador": "1.1 Nome do indicador",
  "link": "",
  "habilitador": "N/A",
  "realizado":           { "tipo": "moeda",      "raw": 0, "formatado": "R$ 0,00"  },
  "pontosAtingidos":     { "tipo": "pontos",      "raw": 0, "formatado": "0,00 pts" },
  "percentualAtingido":  { "tipo": "percentual",  "raw": 0, "formatado": "0,00%"   },
  "metaPontos":          { "tipo": "pontos",      "raw": 0, "formatado": "0,00 pts" },
  "metaValor":           { "tipo": "moeda",       "raw": 0, "formatado": "R$ 0,00"  },
  "faltaMetaPontos":     { "tipo": "pontos",      "raw": 0, "formatado": "0,00 pts" },
  "faltaMetaPercentual": { "tipo": "percentual",  "raw": 0, "formatado": "0,00%"   }
}
```

Os indicadores são filtrados por pilar na tela Dados. O campo `pillar` usa as sourceKeys (`gestao_pessoas`, `financas`), que o app mapeia para a key visual (`gestao_pessoas_financas`).

---

## Dados consolidados por pilar

`pillarsCards[]` vem da API `iaf-consolidated-pillars` e traz os dados oficiais consolidados de cada pilar.

```json
{
  "key": "gestao_comercial",
  "title": "Gestão Comercial",
  "achievement": { "raw": 45.97, "formatado": "45,97%" },
  "untilGoal":   { "raw": 54.03, "formatado": "54,03%" }
}
```

Usado nos cards da Home para exibir:
- **Atingimento** — `achievement.formatado`
- **Falta p/ Meta** — `untilGoal.formatado`

A busca do card usa `card.key === pillar.key` (ex: `gestao_pessoas_financas`), **não** as sourceKeys individuais.

---

## Pontuação geral do CP

`rankingSummary` vem da API `iaf-consolidated-ranking`.

```json
{
  "points":     { "raw": 580,   "formatado": "580 pts"  },
  "percentage": { "raw": 61.70, "formatado": "61,70%"  },
  "rating": "UNCLASSIFIED"
}
```

Exibição na Home:
- `points.formatado` — pontuação do CP com seta animada de tendência.
- `percentage.formatado` — percentual abaixo da pontuação.
- `rating` — exibido com ícone de medalha; `UNCLASSIFIED` é traduzido para "Não classificado".

---

## Comparações entre relatórios

O `iafReportService` realiza o seguinte fluxo:

```txt
1. Lê iafLatest/current
2. Extrai currentReportId de sourceReportKey (remove prefixo "report_")
3. Busca iafReports/{currentReportId}
4. Busca o documento anterior: maior ID < currentReportId em iafReports
5. Monta pillarsSummary comparando médias de percentualAtingido.raw por pilar
6. Retorna rankingSummary do currentReport e previousRankingSummary do previousReport
```

### Comparação dos pilares

Usa a **média de `percentualAtingido.raw`** dos indicadores de cada pilar.

| Resultado | Status | Mensagem |
|---|---|---|
| Atual > Anterior | `up` | Resultado alcançado se aproximou da meta |
| Atual < Anterior | `down` | Resultado alcançado se distanciou da meta |
| Atual = Anterior | `stable` | Resultado alcançado manteve-se estável |
| Sem anterior | `pending_comparison` | Sem relatório anterior para comparação |

### Comparação da Pontuação do CP

Compara `currentReport.rankingSummary.points.raw` com `previousReport.rankingSummary.points.raw`.

- Ambos devem ser do tipo `number` — se algum não for, a seta não é exibida.
- Seta para cima (verde, animação bounce): pontuação subiu.
- Seta para baixo (vermelha, animação bounce): pontuação caiu.
- Traço neutro: pontuação estável.

---

## n8n

### Fluxo de relatório IAF

```txt
Webhook
→ Preparar relatório Firebase
→ Create or update iafReports/{YYYY-MM-DD}
→ Create or update iafLatest/current
→ Respond to Webhook
```

O node **"Preparar relatório Firebase"** normaliza:
- Indicadores (`indicators[]`)
- Dados consolidados por pilar (`pillarsCards[]`)
- Pontuação geral (`rankingSummary`)
- Datas (`reportDate`, `reportDateBr`, `updatedAt`, `updatedAtBr`)
- Resumo por pilar (`pillarsSummary`)
- Chave de referência (`sourceReportKey = "report_YYYY-MM-DD"`)

### Fluxo de importação de usuários

```txt
Google Sheets
→ Preparar usuários
→ Create or update users/{cpf}
```

- CPF deve ser tratado como string com 11 dígitos (zero à esquerda preservado).
- Senha inicial definida por regra interna — não expor exemplos reais.
- `selectedPillars` é inserido com os pilares padrão do app.

### Versões estáveis registradas

```txt
"1 teste sbpocket"      — May 15, 11:02:22
"Versão adição de cpf"  — May 15, 16:35:21
"Versão c6dd50c9"       — May 18, 09:50:53
"Versão f1c16a3a"       — May 18, 17:04:57
```

---

## Extensão Chrome

A extensão captura dados da Extranet **apenas por ação manual do usuário** (clique no botão).

APIs capturadas:
- `iaf-consolidated-indicators`
- `iaf-consolidated-pillars`
- `iaf-consolidated-ranking`

Payload enviado ao n8n:

```txt
origem, destino, pagina, endpoint, executadoEm
indicadores, pillarsCards, rankingSummary
```

Regras:
- Não enviar automaticamente ao abrir o navegador.
- Enviar apenas ao clicar no botão da extensão.
- Aguardar todos os endpoints responderem antes do envio.
- Evitar duplicidade de envio.

---

## Regras de segurança do Firebase

Visão conceitual das permissões:

| Ação | App | n8n (Service Account) |
|---|---|---|
| Ler relatórios (`iafReports`, `iafLatest`) | ✅ | ✅ |
| Gravar relatórios | ❌ | ✅ |
| Buscar usuário específico | ✅ | ✅ |
| Listar todos os usuários | ❌ | ✅ |
| Criar/deletar usuários | ❌ | ✅ |
| Atualizar `selectedPillars` | ✅ | ✅ |
| Atualizar outros campos do usuário | ❌ | ✅ |
| Criar/atualizar `accessLogs` | ✅ | ✅ |

O n8n grava via Service Account, que não é afetado pelas regras do Firestore Security Rules.

---

## PWA e Deploy

- Projeto hospedado na **Vercel**.
- Domínio próprio pode ser apontado via DNS para a Vercel.
- HTTPS obrigatório para service worker e instalação PWA.
- Android: instalar pelo Chrome ("Adicionar à tela inicial").
- iPhone: instalar pelo Safari ("Adicionar à Tela de Início").

```bash
npm install       # instalar dependências
npm run dev       # desenvolvimento local
npm run build     # build de produção
npm run preview   # pré-visualizar build
```

Ao alterar o manifest ou ícones PWA, limpar cache do service worker:

```txt
DevTools → Application → Service Workers → Unregister
DevTools → Application → Storage → Clear site data
```

---

## Manutenção e cuidados

- [ ] Não expor `.env`, service account, webhooks ou chaves no repositório.
- [ ] Não subir `node_modules`.
- [ ] Não usar CPFs ou senhas reais em exemplos públicos.
- [ ] Conferir se `iafLatest/current` tem `sourceReportKey` atualizado após cada captura.
- [ ] Conferir se `iafReports` contém o relatório atual e o anterior para comparação.
- [ ] Confirmar que `rankingSummary` existe nos dois relatórios para a seta da Pontuação do CP.
- [ ] Confirmar que `pillarsCards` contém a chave `gestao_pessoas_financas` para o card consolidado.
- [ ] Não usar Timestamp para derivar o ID do relatório atual — usar sempre `sourceReportKey`.
- [ ] Limpar cache/reinstalar PWA após alterar manifest ou ícones.
- [ ] Validar o Firestore após alterações no n8n antes de liberar para usuários.

---

## Status atual

- [x] Login com validação de usuário ativo no Firebase funcionando.
- [x] Rotas protegidas implementadas.
- [x] n8n gravando relatórios em `iafReports` e `iafLatest/current`.
- [x] `sourceReportKey` usado como fonte principal do ID do relatório atual.
- [x] Comparação entre relatório atual e anterior funcionando.
- [x] Cards por pilar com dados oficiais de `pillarsCards` funcionando.
- [x] Atingimento e Falta p/ Meta exibidos nos cards da Home.
- [x] `rankingSummary` integrado com seta animada de tendência.
- [x] Pilar "Gestão de Pes. e Fin." unificando `gestao_pessoas` e `financas`.
- [x] `accessLogs` registrando acessos diários.
- [x] Contador de usuários ativos ontem/hoje em Configurações.
- [x] PWA publicada e compatível com Android e iPhone.
- [x] Filtros por pilares funcionando na Home e na tela Dados.
- [x] Responsividade ajustada para mobile, tablet 10,2" e tablet de alta resolução.
