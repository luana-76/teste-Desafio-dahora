import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import ordersRoutes from './routes/orders.routes.js';
import { initSocket } from './socket.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3333;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/orders', ordersRoutes);

// 404 padrão
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

initSocket(server, CORS_ORIGIN);

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔌 Socket.io pronto para conexões em tempo real`);
});
