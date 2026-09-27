import prisma from '../utils/prisma.js';

// Três níveis de ranking — seção 24 do documento:
// - Rodada: classificação de um desafio específico.
// - Diário: soma acumulada de todos os desafios de um dia (1, 2 ou 3).
// - Geral: soma acumulada dos três dias de competição.

// Ajustes manuais de pontuação — usados pelo Administrador para dar (ou
// remover) pontos de uma equipe fora do fluxo normal de avaliação de
// desafios (bônus por comportamento exemplar, correção de um erro de
// lançamento, etc). Só entram no ranking GERAL, porque não têm um dia
// nem um desafio associados (ver rankingGeral/rankingAgregado abaixo).
export async function criarAjustePontos({ equipeId, pontos, motivo, responsavel }) {
  const equipe = await prisma.equipe.findUnique({ where: { id: equipeId } });
  if (!equipe) {
    const err = new Error('Equipe não encontrada.');
    err.status = 404;
    throw err;
  }

  const pontosFinal = Number(pontos);
  if (!Number.isInteger(pontosFinal) || pontosFinal === 0) {
    const err = new Error('Informe uma quantidade de pontos (inteiro, positivo ou negativo).');
    err.status = 400;
    throw err;
  }

  return prisma.ajustePontos.create({
    data: { equipeId, pontos: pontosFinal, motivo: motivo?.trim() || null, responsavel: responsavel?.trim() || null },
  });
}

export async function listarAjustesPontos(equipeId) {
  return prisma.ajustePontos.findMany({
    where: equipeId ? { equipeId } : {},
    orderBy: { createdAt: 'desc' },
  });
}

export async function rankingRodada(desafioId) {
  const avaliacoes = await prisma.avaliacao.findMany({
    where: { desafioId },
    include: { equipe: true },
    orderBy: { pontuacaoTotal: 'desc' },
  });

  return avaliacoes.map((a, i) => ({
    posicao: i + 1,
    equipeId: a.equipeId,
    nome: a.equipe.nome,
    cor: a.equipe.cor,
    pontuacao: a.pontuacaoTotal,
  }));
}

export async function rankingDiario(dia) {
  return rankingAgregado({ desafio: { dia: Number(dia) } });
}

export async function rankingGeral() {
  return rankingAgregado({}, { incluirAjustes: true });
}

// Agrega as avaliações por equipe (com o filtro passado) e ordena por
// pontuação total decrescente, junto com quantos desafios cada equipe já
// concluiu (== quantas avaliações tem) dentro do filtro. Quando
// `incluirAjustes` é true (só no ranking geral), soma também os ajustes
// manuais de pontos feitos pelo Administrador (ver criarAjustePontos acima).
async function rankingAgregado(where, { incluirAjustes = false } = {}) {
  const equipes = await prisma.equipe.findMany();

  const resultados = await Promise.all(
    equipes.map(async (equipe) => {
      const avaliacoes = await prisma.avaliacao.findMany({
        where: { equipeId: equipe.id, ...where },
      });
      const pontuacaoAvaliacoes = avaliacoes.reduce((soma, a) => soma + a.pontuacaoTotal, 0);

      let pontuacaoAjustes = 0;
      if (incluirAjustes) {
        const ajustes = await prisma.ajustePontos.findMany({ where: { equipeId: equipe.id } });
        pontuacaoAjustes = ajustes.reduce((soma, a) => soma + a.pontos, 0);
      }

      return {
        equipeId: equipe.id,
        nome: equipe.nome,
        cor: equipe.cor,
        pontuacao: pontuacaoAvaliacoes + pontuacaoAjustes,
        desafiosConcluidos: avaliacoes.length,
      };
    })
  );

  return resultados
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .map((r, i) => ({ posicao: i + 1, ...r }));
}
