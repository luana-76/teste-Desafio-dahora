import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import equipesRoutes from './routes/equipes.routes.js';
import participantesRoutes from './routes/participantes.routes.js';
import desafiosRoutes from './routes/desafios.routes.js';
import avaliacoesRoutes from './routes/avaliacoes.routes.js';
import rankingRoutes from './routes/ranking.routes.js';
import cartasRoutes from './routes/cartas.routes.js';
import quadroRoutes from './routes/quadro.routes.js';
import { identificarUsuario } from './utils/autorizacao.js';
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

// Qualquer porta em localhost/127.0.0.1 é sempre liberada: o Vite muda de
// porta sozinho (5173 -> 5174, 5175...) quando a porta padrão já está em
// uso, e sem isso o CORS quebra toda vez que isso acontece. Origens de
// rede (ex: o IP da máquina) continuam vindo só da lista explícita acima.
const ORIGEM_LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

function origemPermitida(origin, callback) {
  // Sem header "Origin" (ex: curl, apps mobile) — libera.
  if (!origin) return callback(null, true);
  if (ORIGEM_LOCALHOST.test(origin) || CORS_ORIGINS.includes(origin)) {
    return callback(null, true);
  }
  return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
}

app.use(cors({ origin: origemPermitida }));
app.use(express.json());
app.use(identificarUsuario);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sistema Desafio da Hora — rotas alinhadas à documentação oficial:
app.use('/equipes', equipesRoutes);
app.use('/participantes', participantesRoutes);
app.use('/desafios', desafiosRoutes);
app.use('/avaliacoes', avaliacoesRoutes);
app.use('/ranking', rankingRoutes);
app.use('/cartas', cartasRoutes);
app.use('/quadro', quadroRoutes);

// 404 padrão
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

initSocket(server, origemPermitida);

// Escuta em 0.0.0.0 explicitamente, para aceitar conexões de outros
// computadores na rede local (não só do próprio PC).
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔌 Socket.io pronto para conexões em tempo real`);
  console.log(`🌐 Origens permitidas (CORS): ${CORS_ORIGINS.join(', ')}`);
});
