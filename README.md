# Desafio da Hora — REC'n'PLAY

Sistema digital de apoio à oficina **Desafio da Hora** (documentação oficial da oficina):
36 desafios, 3 dias, equipes de 3 a 5 participantes, avaliação por critérios, cartas
bônus, cronômetro em tempo real e ranking em 3 níveis (rodada / diário / geral).

Backend em **Node.js + Express + Prisma (SQLite) + Socket.io**, frontend em **React + Vite**.

> Esta versão substitui uma implementação anterior do projeto que era, na prática, um
> painel de pedidos (kanban PENDENTE → EM_PREPARO → PRONTO → ENTREGUE) sem nenhuma
> relação com a oficina. O domínio foi reescrito do zero (schema, services, controllers,
> rotas e as telas de Equipes/Desafios/Ranking) para seguir a documentação oficial.

## Estrutura

```
teste-Desafio-dahora/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Equipe, Participante, Desafio, Avaliacao, CartaBonus
│   │   └── seed.js           # cria a conta ADMIN e os 36 desafios (12 por dia)
│   └── src/
│       ├── controllers/      # camada HTTP
│       ├── services/         # regras de negócio + Prisma
│       ├── routes/           # rotas Express
│       ├── state/timer.js    # estado do cronômetro (fases 10/40/10 min)
│       ├── utils/            # autorização por papel, status do desafio, critérios
│       ├── socket.js         # Socket.io (cronômetro + eventos em tempo real)
│       └── index.js          # ponto de entrada do servidor
└── frontend/
    └── src/
        ├── components/       # CountdownTimer, RankingPodium, etc.
        ├── pages/            # Dashboard, Equipes, Desafios, Ranking, Perfil, Auth
        ├── services/         # api.js (axios), socket.js, um arquivo por recurso
        └── constants/        # status/ícones do desafio, critérios de avaliação
```

## Como rodar

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init   # cria o banco SQLite (dev.db)
npm run prisma:seed                  # cria a conta ADMIN + os 36 desafios
npm run dev                          # inicia em http://localhost:3333
```

O seed imprime no terminal o e-mail/senha da conta ADMIN criada — **entre com ela e
troque a senha (ou crie outras contas ADMIN)** antes do evento. Sem um ADMIN, ninguém
consegue criar equipes nem liberar/iniciar/encerrar desafios.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                          # inicia em http://localhost:5173
```

Abra `http://localhost:5173`. Cadastre-se como Participante (ou Monitor), e use a conta
ADMIN criada pelo seed para as ações de organização.

## Solução de problemas

- **`vite: Permission denied` ou `Cannot find module @rollup/rollup-linux-...`**
  Acontece quando a pasta `node_modules` é copiada de outra máquina/sistema. Apague e
  reinstale:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- **`@prisma/client did not initialize yet`**
  Rode `npx prisma generate` dentro de `backend/`.

## Papéis de acesso (seção 15 do documento)

| Papel | Pode |
|---|---|
| **Participante** | Ver desafio atual, cronômetro, ranking, histórico, sua equipe |
| **Monitor** | Tudo do Participante + gerenciar membros de equipe, registrar avaliações e cartas bônus |
| **Administrador** | Tudo do Monitor + criar/editar/excluir equipes e desafios, controlar o ciclo de status dos desafios, promover papéis |

O cadastro público só permite virar Participante ou Monitor — a conta ADMIN vem do seed
(ou é promovida por outro ADMIN via `PATCH /participantes/:id/papel`).

## Ciclo de um desafio (seção 19)

```
🔒 BLOQUEADO → 🟢 DISPONIVEL → 🟡 EM_ANDAMENTO → 🔵 EM_AVALIACAO → ✅ FINALIZADO
```

Ao "iniciar" um desafio, o cronômetro de 60 minutos é ativado automaticamente para todos
os clientes conectados, dividido nas 3 fases da metodologia (seção 4): 10 min de
explicação, 40 min de execução, 10 min de apresentação.

## Sistema de pontuação (seção 6)

| Critério | Pontos máx. |
|---|---|
| Conclusão | 50 |
| Criatividade | 20 |
| Inovação | 20 |
| Apresentação | 10 |
| Conclusão em menos tempo | 40 |
| Utilização responsável de IA | 30 |
| **Total por desafio** | **170** |

## Quadro estilo Trello (organização livre da equipe)

Página separada (`#/quadro`), sem relação com o fluxo oficial dos desafios — é um espaço
livre pra cada equipe se organizar durante a competição: colunas e cartões que a própria
equipe cria, renomeia e arrasta entre si (drag-and-drop nativo). Toda equipe já nasce com
3 colunas padrão (*A fazer*, *Fazendo*, *Feito*) na primeira vez que alguém abre o quadro
dela, mas colunas podem ser renomeadas, criadas e excluídas livremente.

Só quem é daquela equipe pode editar o quadro dela (Monitor e Admin podem editar
qualquer quadro, e Admin/Monitor também conseguem alternar entre as equipes pelo seletor
no topo da página). Atualiza em tempo real via Socket.io (`quadro:atualizado`) — se dois
integrantes da equipe abrirem o quadro ao mesmo tempo, um vê a mudança do outro na hora.

## API REST

| Método | Rota | Descrição |
|---|---|---|
| POST | `/participantes/cadastro` | Cria uma conta (Participante ou Monitor) |
| POST | `/participantes/entrar` | Login |
| GET | `/participantes` | Lista participantes (ADMIN/MONITOR) |
| PATCH | `/participantes/:id` | Edita o próprio perfil (nome, bio) |
| PATCH | `/participantes/:id/papel` | Promove/rebaixa um papel (ADMIN) |
| GET | `/equipes` | Lista equipes com seus participantes |
| POST | `/equipes` | Cria equipe (ADMIN) |
| DELETE | `/equipes/:id` | Exclui equipe (ADMIN) |
| POST | `/equipes/:id/participantes` | Adiciona participante à equipe (máx. 5) |
| DELETE | `/equipes/:id/participantes/:participanteId` | Remove participante da equipe |
| GET | `/desafios?dia=&status=` | Lista desafios, com filtros opcionais |
| POST | `/desafios` | Cria desafio (ADMIN) |
| PATCH | `/desafios/:id` | Edita título/descrição/instruções (ADMIN) |
| PATCH | `/desafios/:id/liberar` \| `/iniciar` \| `/encerrar` \| `/finalizar` | Avança o status (ADMIN) |
| GET | `/avaliacoes?desafioId=` | Lista avaliações de um desafio |
| POST | `/avaliacoes` | Registra/corrige a nota de uma equipe (ADMIN/MONITOR) |
| GET | `/ranking/rodada/:desafioId` | Ranking daquele desafio |
| GET | `/ranking/diario/:dia` | Ranking acumulado do dia (1, 2 ou 3) |
| GET | `/ranking/geral` | Ranking acumulado dos 3 dias |
| GET | `/cartas?equipeId=` | Histórico de cartas bônus usadas |
| POST | `/cartas` | Registra o uso de uma carta (ADMIN/MONITOR) |
| GET | `/quadro/:equipeId` | Colunas + cartões do quadro daquela equipe |
| POST | `/quadro/:equipeId/colunas` | Cria coluna |
| PATCH | `/quadro/colunas/:id` | Renomeia coluna |
| DELETE | `/quadro/colunas/:id` | Exclui coluna (e os cartões dela) |
| POST | `/quadro/colunas/:colunaId/cartoes` | Cria cartão |
| PATCH | `/quadro/cartoes/:id` | Edita título/descrição do cartão |
| PATCH | `/quadro/cartoes/:id/mover` | Move o cartão pra outra coluna/posição (drag-and-drop) |
| DELETE | `/quadro/cartoes/:id` | Exclui cartão |

## Eventos Socket.io

- `timer:estado` — estado atual do cronômetro (duração, início, fases, desafio associado)
- `timer:iniciar` / `timer:reiniciar` — ativa/reinicia o cronômetro manualmente
- `equipe:created` / `equipe:updated` / `equipe:deleted`
- `desafio:created` / `desafio:updated` / `desafio:deleted`
- `avaliacao:registrada`
- `carta:registrada`
- `quadro:atualizado` — `{ equipeId }`, avisa que o quadro daquela equipe mudou

Todos os clientes conectados recebem essas atualizações instantaneamente — inclusive o
telão, se for aberto na mesma rede.

## O que ainda não foi implementado

Fora do escopo desta correção (são telas/dispositivos adicionais, não mudanças no
domínio de dados):
- Painel dedicado para o telão (seção 28) — hoje o Dashboard já mostra o desafio atual e
  o cronômetro, mas não há uma tela "modo telão" em tamanho grande.
- Geração de QR Codes (seção 29).
- Integração com a roleta física (é um dispositivo físico, seção 8).

Conta: adminLMA2026@senac.br.com / senacLMA2026@