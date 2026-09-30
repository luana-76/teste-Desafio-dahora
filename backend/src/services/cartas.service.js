import prisma from '../utils/prisma.js';
import { getEquipeById } from './equipes.service.js';

// Cartas bônus — seções 5 e 30. Cada uso custa 10 minutos do tempo da
// equipe e precisa ficar registrado: equipe, carta, rodada (desafio),
// horário, tempo utilizado, benefício e responsável pelo registro.
const TIPOS_VALIDOS = ['AULA', 'MENTOR', 'DICA'];
const TEMPO_PADRAO_MINUTOS = 10;

export async function registrarUso({ equipeId, desafioId, tipo, beneficio, responsavel }, usuario = {}) {
  const equipe = await getEquipeById(equipeId);

  // Participantes podem ativar cartas somente para a própria equipe.
  // ADMIN/MONITOR continuam podendo registrar o uso em qualquer equipe.
  if (usuario.papel === 'PARTICIPANTE') {
    const participante = await prisma.participante.findUnique({ where: { id: usuario.id } });
    if (!participante || participante.equipeId !== equipeId) {
      const err = new Error('Você só pode usar cartas para a sua própria equipe.');
      err.status = 403;
      throw err;
    }
    responsavel = participante.nome;
  }

  const tipoFinal = tipo?.trim().toUpperCase();
  if (!TIPOS_VALIDOS.includes(tipoFinal)) {
    const err = new Error(`Tipo de carta inválido. Use um dos: ${TIPOS_VALIDOS.join(', ')}`);
    err.status = 400;
    throw err;
  }
  if (!responsavel?.trim()) {
    const err = new Error('Informe quem está registrando o uso da carta (monitor/organização).');
    err.status = 400;
    throw err;
  }

  return prisma.cartaBonus.create({
    data: {
      equipeId,
      desafioId: desafioId || null,
      tipo: tipoFinal,
      tempoUtilizado: TEMPO_PADRAO_MINUTOS,
      beneficio: beneficio?.trim() || null,
      responsavel: responsavel.trim(),
    },
  });
}

export async function listarCartas({ equipeId } = {}) {
  return prisma.cartaBonus.findMany({
    where: equipeId ? { equipeId } : undefined,
    include: { equipe: true, desafio: true },
    orderBy: { horario: 'desc' },
  });
}

export { TIPOS_VALIDOS };
