// Avaliação por critérios — seção 6 e 23 do documento.
import api from './api';

export async function listarAvaliacoes({ desafioId, equipeId } = {}) {
  const { data } = await api.get('/avaliacoes', { params: { desafioId, equipeId } });
  return data;
}

export async function registrarAvaliacao(dados) {
  const { data } = await api.post('/avaliacoes', dados);
  return data;
}
