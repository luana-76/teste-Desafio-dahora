import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import ordersRoutes from './routes/orders.routes.js';
import { initSocket } from './socket.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3333;

// CORS_ORIGIN aceita uma ou várias origens separadas por vírgula, ex:
// "http://localhost:5173,http://192.168.0.10:5173" — assim tanto quem
// acessa pelo próprio PC quanto quem acessa por outro computador na
// mesma rede consegue falar com o backend.
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/orders', ordersRoutes);

// 404 padrão
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

initSocket(server, CORS_ORIGINS);

// Escuta em 0.0.0.0 explicitamente, para aceitar conexões de outros
// computadores na rede local (não só do próprio PC).
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔌 Socket.io pronto para conexões em tempo real`);
  console.log(`🌐 Origens permitidas (CORS): ${CORS_ORIGINS.join(', ')}`);
});
