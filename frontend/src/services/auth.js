// Autenticação real, via API (backend/src/routes/participantes.routes.js).
// A sessão em si (quem está logado agora) continua no navegador — só que
// agora ela guarda o registro que veio do banco, não um usuário inventado
// no localStorage. Nunca guardamos a senha aqui.

import api from './api';
import { reconectarSocket } from './socket';

const CHAVE_SESSAO = 'desafio-dahora:sessao';

function salvarSessao(participante) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(participante));
  reconectarSocket();
  return participante;
}

export async function cadastrar({ nome, email, senha, papel }) {
  const { data } = await api.post('/participantes/cadastro', { nome, email, senha, papel });
  return salvarSessao(data);
}

export async function entrar({ email, senha }) {
  const { data } = await api.post('/participantes/entrar', { email, senha });
  return salvarSessao(data);
}

export function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
  reconectarSocket();
}

export function usuarioAtual() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO)) || null;
  } catch {
    return null;
  }
}

export async function atualizarUsuarioAtual({ nome, bio }) {
  const atual = usuarioAtual();
  if (!atual) return null;
  const { data } = await api.patch(`/participantes/${atual.id}`, { nome, bio });
  return salvarSessao({ ...atual, ...data });
}

// Chamada sempre que uma equipe muda (participante entrou/saiu) pra manter
// a sessão local em dia com a equipe atual.
export async function recarregarSessao() {
  const atual = usuarioAtual();
  if (!atual) return null;
  const { data } = await api.get(`/participantes/${atual.id}`);
  return salvarSessao({ ...atual, ...data });
}
