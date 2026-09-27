// Quadro estilo Trello — uma ferramenta livre de organização por equipe
// (sem relação com o fluxo oficial dos desafios).
import api from './api';

export async function buscarQuadro(equipeId) {
  const { data } = await api.get(`/quadro/${equipeId}`);
  return data;
}

export async function criarColuna(equipeId, nome) {
  const { data } = await api.post(`/quadro/${equipeId}/colunas`, { nome });
  return data;
}

export async function renomearColuna(colunaId, equipeId, nome) {
  const { data } = await api.patch(`/quadro/colunas/${colunaId}`, { nome, equipeId });
  return data;
}

export async function excluirColuna(colunaId, equipeId) {
  await api.delete(`/quadro/colunas/${colunaId}`, { data: { equipeId } });
}

export async function criarCartao(colunaId, equipeId, { titulo, descricao, cor }) {
  const { data } = await api.post(`/quadro/colunas/${colunaId}/cartoes`, { titulo, descricao, cor, equipeId });
  return data;
}

export async function editarCartao(cartaoId, equipeId, { titulo, descricao, cor }) {
  const { data } = await api.patch(`/quadro/cartoes/${cartaoId}`, { titulo, descricao, cor, equipeId });
  return data;
}

export async function moverCartao(cartaoId, equipeId, { colunaId, posicao }) {
  const { data } = await api.patch(`/quadro/cartoes/${cartaoId}/mover`, { colunaId, posicao, equipeId });
  return data;
}

export async function excluirCartao(cartaoId, equipeId) {
  await api.delete(`/quadro/cartoes/${cartaoId}`, { data: { equipeId } });
}
