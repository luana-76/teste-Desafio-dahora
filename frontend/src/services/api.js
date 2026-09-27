import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

// Anexa quem está fazendo a chamada (participante + papel) em toda
// requisição, a partir da sessão local. O backend usa esses headers pra
// decidir o que cada papel (Participante / Monitor / Administrador) pode
// fazer — ver seção 15 do documento e src/utils/autorizacao.js no backend.
api.interceptors.request.use((config) => {
  try {
    const sessao = JSON.parse(localStorage.getItem('desafio-dahora:sessao') || 'null');
    if (sessao?.id) config.headers['x-participante-id'] = sessao.id;
    if (sessao?.papel) config.headers['x-papel'] = sessao.papel;
  } catch {
    // sessão inválida no localStorage — segue sem os headers
  }
  return config;
});

export default api;
