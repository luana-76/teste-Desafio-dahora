import prisma from '../utils/prisma.js';
import { validarCriterios, calcularTotal } from '../utils/criteriosAvaliacao.js';
import { getDesafioById } from './desafios.service.js';
import { getEquipeById } from './equipes.service.js';

// Registra (ou corrige — seção 15.3 "Corrigir pontuações") a avaliação de
// uma equipe num desafio. Um upsert porque só pode existir UMA avaliação
// por (desafio, equipe): reavaliar substitui a nota anterior.
export async function registrarAvaliacao({ desafioId, equipeId, ...criteriosBrutos }) {
  await getDesafioById(desafioId);
  await getEquipeById(equipeId);

  const criterios = validarCriterios(criteriosBrutos);
  const pontuacaoTotal = calcularTotal(criterios);

  return prisma.avaliacao.upsert({
    where: { desafioId_equipeId: { desafioId, equipeId } },
    update: { ...criterios, pontuacaoTotal },
    create: { desafioId, equipeId, ...criterios, pontuacaoTotal },
  });
}

export async function listarAvaliacoes({ desafioId, equipeId } = {}) {
  return prisma.avaliacao.findMany({
    where: {
      ...(desafioId ? { desafioId } : {}),
      ...(equipeId ? { equipeId } : {}),
    },
    include: { equipe: true, desafio: true },
    orderBy: { pontuacaoTotal: 'desc' },
  });
}
