import prisma from '../utils/prisma.js';
import { DESAFIO_STATUSES, isValidStatus, podeAvancarPara } from '../utils/desafioStatus.js';

// 36 desafios no total, 12 por dia (seção 10 do documento).
const TOTAL_DESAFIOS = 36;
const DESAFIOS_POR_DIA = 12;
const DIAS_VALIDOS = [1, 2, 3];

function notFound() {
  const err = new Error('Desafio não encontrado.');
  err.status = 404;
  throw err;
}

export async function listarDesafios({ dia, status } = {}) {
  return prisma.desafio.findMany({
    where: {
      ...(dia ? { dia: Number(dia) } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { numero: 'asc' },
  });
}

export async function getDesafioById(id) {
  const desafio = await prisma.desafio.findUnique({ where: { id } });
  if (!desafio) notFound();
  return desafio;
}

export async function criarDesafio({ numero, titulo, descricao, categoria, instrucoes, dia }) {
  const numeroFinal = Number(numero);
  const diaFinal = Number(dia);

  if (!titulo?.trim()) {
    const err = new Error('Dê um título para o desafio.');
    err.status = 400;
    throw err;
  }
  if (!Number.isInteger(numeroFinal) || numeroFinal < 1 || numeroFinal > TOTAL_DESAFIOS) {
    const err = new Error(`O número do desafio deve ser entre 1 e ${TOTAL_DESAFIOS} (seção 1).`);
    err.status = 400;
    throw err;
  }
  if (!DIAS_VALIDOS.includes(diaFinal)) {
    const err = new Error('O dia do desafio deve ser 1, 2 ou 3 (seção 10).');
    err.status = 400;
    throw err;
  }

  const existente = await prisma.desafio.findUnique({ where: { numero: numeroFinal } });
  if (existente) {
    const err = new Error(`Já existe um desafio cadastrado com o número ${numeroFinal}.`);
    err.status = 409;
    throw err;
  }

  const totalNoDia = await prisma.desafio.count({ where: { dia: diaFinal } });
  if (totalNoDia >= DESAFIOS_POR_DIA) {
    const err = new Error(`O dia ${diaFinal} já tem os ${DESAFIOS_POR_DIA} desafios previstos (seção 10).`);
    err.status = 400;
    throw err;
  }

  return prisma.desafio.create({
    data: {
      numero: numeroFinal,
      titulo: titulo.trim(),
      descricao: descricao?.trim() || null,
      categoria: categoria?.trim() || null,
      instrucoes: instrucoes?.trim() || null,
      dia: diaFinal,
    },
  });
}

export async function atualizarDesafio(id, { titulo, descricao, categoria, instrucoes }) {
  await getDesafioById(id);
  return prisma.desafio.update({
    where: { id },
    data: {
      ...(titulo?.trim() ? { titulo: titulo.trim() } : {}),
      ...(descricao !== undefined ? { descricao: descricao?.trim() || null } : {}),
      ...(categoria !== undefined ? { categoria: categoria?.trim() || null } : {}),
      ...(instrucoes !== undefined ? { instrucoes: instrucoes?.trim() || null } : {}),
    },
  });
}

// Transições do fluxo (seção 19): BLOQUEADO -> DISPONIVEL -> EM_ANDAMENTO ->
// EM_AVALIACAO -> FINALIZADO. Só é permitido avançar uma etapa por vez.
async function avancarStatus(id, statusDestino, extraData = {}) {
  const desafio = await getDesafioById(id);
  if (!podeAvancarPara(desafio.status, statusDestino)) {
    const err = new Error(
      `Não é possível ir de "${desafio.status}" para "${statusDestino}". Siga a ordem: ${DESAFIO_STATUSES.join(' → ')}.`
    );
    err.status = 400;
    throw err;
  }
  return prisma.desafio.update({ where: { id }, data: { status: statusDestino, ...extraData } });
}

export const liberarDesafio = (id) => avancarStatus(id, 'DISPONIVEL');
export const iniciarDesafio = (id) => avancarStatus(id, 'EM_ANDAMENTO', { horarioInicio: new Date() });
export const encerrarDesafio = (id) => avancarStatus(id, 'EM_AVALIACAO', { horarioFim: new Date() });
export const finalizarDesafio = (id) => avancarStatus(id, 'FINALIZADO');

export async function excluirDesafio(id) {
  await getDesafioById(id);
  try {
    await prisma.desafio.delete({ where: { id } });
  } catch {
    const err = new Error('Não é possível excluir um desafio que já tem avaliações ou cartas registradas.');
    err.status = 409;
    throw err;
  }
}

export { isValidStatus, DESAFIO_STATUSES };
