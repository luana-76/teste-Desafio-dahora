// Desafios — agora persistidos no backend, com o mesmo ciclo de status da
// seção 19 do documento: BLOQUEADO -> DISPONIVEL -> EM_ANDAMENTO ->
// EM_AVALIACAO -> FINALIZADO.
import api from './api';

export async function listarDesafios({ dia, status } = {}) {
  const { data } = await api.get('/desafios', { params: { dia, status } });
  return data;
}

export async function criarDesafio(dados) {
  const { data } = await api.post('/desafios', dados);
  return data;
}

export async function atualizarDesafio(id, dados) {
  const { data } = await api.patch(`/desafios/${id}`, dados);
  return data;
}

export async function liberarDesafio(id) {
  const { data } = await api.patch(`/desafios/${id}/liberar`);
  return data;
}

export async function iniciarDesafio(id) {
  const { data } = await api.patch(`/desafios/${id}/iniciar`);
  return data;
}

export async function encerrarDesafio(id) {
  const { data } = await api.patch(`/desafios/${id}/encerrar`);
  return data;
}

export async function finalizarDesafio(id) {
  const { data } = await api.patch(`/desafios/${id}/finalizar`);
  return data;
}

export async function excluirDesafio(id) {
  await api.delete(`/desafios/${id}`);
}
