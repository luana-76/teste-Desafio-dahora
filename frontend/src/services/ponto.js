// Sistema de ponto simples, guardado no navegador por usuário (mesmo
// esquema local usado pelo login/perfil — não existe backend pra isso).

const CHAVE_PONTO = 'desafio-dahora:ponto';

function lerRegistros() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PONTO)) || {};
  } catch {
    return {};
  }
}

function salvarRegistros(registros) {
  localStorage.setItem(CHAVE_PONTO, JSON.stringify(registros));
}

export function obterEntrada(email) {
  return lerRegistros()[email]?.entrada ?? null;
}

export function baterEntrada(email) {
  const registros = lerRegistros();
  const entrada = Date.now();
  registros[email] = { entrada };
  salvarRegistros(registros);
  return entrada;
}

export function baterSaida(email) {
  const registros = lerRegistros();
  delete registros[email];
  salvarRegistros(registros);
}
