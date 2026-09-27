// Equipes — agora persistidas no backend (Prisma), não mais no
// localStorage. Regra da seção 9: 3 a 5 participantes por equipe (o
// máximo é validado pelo servidor; o mínimo é só um aviso na tela).
import api from './api';

export async function listarEquipes() {
  const { data } = await api.get('/equipes');
  return data;
}

export async function criarEquipe({ nome, cor }) {
  const { data } = await api.post('/equipes', { nome, cor });
  return data;
}

export async function atualizarEquipe(id, { nome, cor }) {
  const { data } = await api.patch(`/equipes/${id}`, { nome, cor });
  return data;
}

export async function excluirEquipe(id) {
  await api.delete(`/equipes/${id}`);
}

export async function adicionarParticipante(equipeId, participanteId) {
  const { data } = await api.post(`/equipes/${equipeId}/participantes`, { participanteId });
  return data;
}

export async function removerParticipante(equipeId, participanteId) {
  const { data } = await api.delete(`/equipes/${equipeId}/participantes/${participanteId}`);
  return data;
}

export const LIMITE_MIN_PARTICIPANTES = 3;
export const LIMITE_MAX_PARTICIPANTES = 5;
