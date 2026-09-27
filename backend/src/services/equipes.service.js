import prisma from '../utils/prisma.js';

const MIN_PARTICIPANTES = 3;
const MAX_PARTICIPANTES = 5;

function notFound(msg) {
  const err = new Error(msg);
  err.status = 404;
  throw err;
}

export async function listarEquipes() {
  const equipes = await prisma.equipe.findMany({
    include: { participantes: true },
    orderBy: { createdAt: 'asc' },
  });

  // Pontuação total e desafios concluídos vêm do ranking geral, calculado
  // sob demanda — aqui devolvemos só o cadastro (nome, cor, participantes).
  return equipes.map((e) => ({
    ...e,
    dentroDoLimite: e.participantes.length >= MIN_PARTICIPANTES && e.participantes.length <= MAX_PARTICIPANTES,
  }));
}

export async function getEquipeById(id) {
  const equipe = await prisma.equipe.findUnique({ where: { id }, include: { participantes: true } });
  if (!equipe) notFound('Equipe não encontrada.');
  return equipe;
}

export async function criarEquipe({ nome, cor }) {
  const nomeFinal = nome?.trim();
  if (!nomeFinal) {
    const err = new Error('Dê um nome para a equipe.');
    err.status = 400;
    throw err;
  }
  if (!cor?.trim()) {
    const err = new Error('Escolha uma cor para identificar a equipe (seção 9 do documento).');
    err.status = 400;
    throw err;
  }

  return prisma.equipe.create({ data: { nome: nomeFinal, cor: cor.trim() } });
}

export async function atualizarEquipe(id, { nome, cor }) {
  await getEquipeById(id);

  if (nome !== undefined && !nome?.trim()) {
    const err = new Error('Dê um nome para a equipe.');
    err.status = 400;
    throw err;
  }
  if (cor !== undefined && !cor?.trim()) {
    const err = new Error('Escolha uma cor para identificar a equipe (seção 9 do documento).');
    err.status = 400;
    throw err;
  }

  return prisma.equipe.update({
    where: { id },
    data: {
      ...(nome !== undefined ? { nome: nome.trim() } : {}),
      ...(cor !== undefined ? { cor: cor.trim() } : {}),
    },
    include: { participantes: true },
  });
}

export async function excluirEquipe(id) {
  await getEquipeById(id);
  try {
    await prisma.equipe.delete({ where: { id } });
  } catch {
    const err = new Error('Não é possível excluir uma equipe que já tem avaliações ou cartas registradas.');
    err.status = 409;
    throw err;
  }
}

// Vincula um participante a uma equipe, respeitando o teto de 5 membros e
// impedindo que um participante fique em duas equipes ao mesmo tempo
// (seção 18) — isso já é garantido pelo schema (equipeId é único por
// participante), mas aqui validamos o limite máximo antes de vincular.
export async function adicionarParticipante(equipeId, participanteId) {
  const equipe = await getEquipeById(equipeId);

  if (equipe.participantes.length >= MAX_PARTICIPANTES) {
    const err = new Error(`A equipe "${equipe.nome}" já tem o máximo de ${MAX_PARTICIPANTES} participantes.`);
    err.status = 400;
    throw err;
  }

  const participante = await prisma.participante.findUnique({ where: { id: participanteId } });
  if (!participante) notFound('Participante não encontrado.');

  return prisma.participante.update({ where: { id: participanteId }, data: { equipeId } });
}

export async function removerParticipante(equipeId, participanteId) {
  const participante = await prisma.participante.findUnique({ where: { id: participanteId } });
  if (!participante || participante.equipeId !== equipeId) notFound('Participante não encontrado nessa equipe.');

  return prisma.participante.update({ where: { id: participanteId }, data: { equipeId: null } });
}

export const LIMITES_EQUIPE = { MIN_PARTICIPANTES, MAX_PARTICIPANTES };
