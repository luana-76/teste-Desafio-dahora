// Cadastro geral de participantes (usado para listar quem ainda não tem
// equipe, gerenciar monitores, etc). Login/cadastro da própria sessão
// ficam em services/auth.js.
import api from './api';

export async function listarParticipantes({ equipeId } = {}) {
  const { data } = await api.get('/participantes', { params: { equipeId } });
  return data;
}

export async function atualizarPapel(id, papel) {
  const { data } = await api.patch(`/participantes/${id}/papel`, { papel });
  return data;
}
