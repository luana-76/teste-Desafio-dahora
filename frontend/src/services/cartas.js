// Cartas bônus — seções 5 e 30 do documento (Aula, Mentor, Dica).
import api from './api';

export async function listarCartas({ equipeId } = {}) {
  const { data } = await api.get('/cartas', { params: { equipeId } });
  return data;
}

export async function registrarCarta(dados) {
  const { data } = await api.post('/cartas', dados);
  return data;
}

export const TIPOS_CARTA = [
  { valor: 'AULA', label: 'Carta Aula', descricao: '+10 min de explicação adicional sobre o desafio.' },
  { valor: 'MENTOR', label: 'Carta Mentor', descricao: 'Consultoria rápida com um mentor.' },
  { valor: 'DICA', label: 'Carta Dica', descricao: 'Uma dica exclusiva para o desafio atual.' },
];
