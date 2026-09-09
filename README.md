# Desafio Dahora — Monitoramento de Pedidos em Tempo Real

Painel de acompanhamento de pedidos com atualização em tempo real via **Socket.io**.
Backend em **Node.js + Express + Prisma (SQLite)** e frontend em **React + Vite**.

## Estrutura

```
Desafio-Dahora/
├── backend/
│   ├── prisma/schema.prisma      # Modelo do banco (Order)
│   └── src/
│       ├── controllers/          # Camada HTTP
│       ├── services/             # Regras de negócio + Prisma
│       ├── routes/               # Rotas Express
│       ├── utils/                # Prisma client, status
│       ├── socket.js             # Setup do Socket.io + eventos
│       └── index.js              # Ponto de entrada do servidor
└── frontend/
    └── src/
        ├── components/           # OrderCard, OrderColumn, NewOrderForm
        ├── pages/Dashboard.jsx   # Tela principal (kanban)
        ├── services/             # api.js (axios), socket.js
        └── constants/            # Labels e fluxo de status
```

## Como rodar

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init   # cria o banco SQLite (dev.db)
npm run dev                          # inicia em http://localhost:3333
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                          # inicia em http://localhost:5173
```

Abra `http://localhost:5173` — o painel se conecta ao backend via REST (carga inicial)
e via Socket.io (atualizações em tempo real).

## Solução de problemas

- **`vite: Permission denied` ou `Cannot find module @rollup/rollup-linux-...`**
  Acontece quando a pasta `node_modules` é copiada de outra máquina/sistema (ex.: dentro
  de um .zip). Apague e reinstale:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- **`@prisma/client did not initialize yet`**
  Rode `npx prisma generate` dentro de `backend/` (o `npm run dev` do backend não faz
  isso sozinho na primeira vez).

## Fluxo de status do pedido

```
PENDENTE → EM_PREPARO → PRONTO → ENTREGUE
              ↓             ↓
          CANCELADO ← (a partir de PENDENTE/EM_PREPARO/PRONTO)
```

## API REST

| Método | Rota                  | Descrição                        |
|--------|------------------------|-----------------------------------|
| GET    | `/orders`              | Lista todos os pedidos            |
| GET    | `/orders/:id`          | Detalha um pedido                 |
| POST   | `/orders`               | Cria um pedido                    |
| PATCH  | `/orders/:id/status`    | Atualiza o status                 |
| DELETE | `/orders/:id`           | Remove um pedido                  |

## Eventos Socket.io

- `order:created` — emitido ao criar um pedido
- `order:updated` — emitido ao mudar o status
- `order:deleted` — emitido ao excluir um pedido

Todos os clientes conectados recebem essas atualizações instantaneamente, sem precisar
recarregar a página.
