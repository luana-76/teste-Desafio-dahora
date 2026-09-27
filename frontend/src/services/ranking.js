// Três níveis de ranking — seção 24 do documento.
import api from './api';

export async function rankingRodada(desafioId) {
  const { data } = await api.get(`/ranking/rodada/${desafioId}`);
  return data;
}

export async function rankingDiario(dia) {
  const { data } = await api.get(`/ranking/diario/${dia}`);
  return data;
}

export async function rankingGeral() {
  const { data } = await api.get('/ranking/geral');
  return data;
}

export async function ajustarPontos({ equipeId, pontos, motivo }) {
  const { data } = await api.post('/ranking/ajustes', { equipeId, pontos, motivo });
  return data;
}
