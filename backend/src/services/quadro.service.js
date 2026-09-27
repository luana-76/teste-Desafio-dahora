import prisma from '../utils/prisma.js';
import { getEquipeById } from './equipes.service.js';

// Quadro estilo Trello, organizado em torno dos 36 desafios oficiais. Cada
// equipe tem seu próprio quadro (colunas e cartões ordenados por "ordem").
// Na primeira vez que a equipe abre o quadro, criamos as 3 colunas padrão
// e um cartão em "Pendente" para cada desafio (ver popularCartoesDosDesafios
// abaixo) — daí em diante a equipe é livre pra arrastar os cartões entre as
// colunas, renomear/mover colunas, e também criar cartões extras à mão
// (sem desafioId), pra anotações e tarefas soltas que não são um desafio.

const COLUNAS_PADRAO = ['Pendente', 'Andamento', 'Concluído'];

// Pra sempre trazer os dados do desafio junto do cartão (número, dia, etc.),
// sem o front-end precisar de uma segunda chamada.
const INCLUDE_CARTAO_DESAFIO = { desafio: { select: { numero: true, titulo: true, dia: true } } };

function notFound(msg) {
  const err = new Error(msg);
  err.status = 404;
  throw err;
}

async function popularCartoesDosDesafios(equipeId, colunas) {
  const colunaPendente = colunas.find((c) => c.nome === 'Pendente') || colunas[0];
  if (!colunaPendente) return;

  const desafios = await prisma.desafio.findMany({ orderBy: { numero: 'asc' } });
  if (desafios.length === 0) return;

  await prisma.$transaction(
    desafios.map((desafio, ordem) =>
      prisma.quadroCartao.create({
        data: {
          colunaId: colunaPendente.id,
          titulo: `${String(desafio.numero).padStart(2, '0')} · ${desafio.titulo}`,
          desafioId: desafio.id,
          ordem,
        },
      })
    )
  );
}

// Garante que toda equipe tenha um quadro com as 3 colunas padrão e um
// cartão por desafio na primeira vez que alguém abrir a tela.
export async function listarQuadro(equipeId) {
  await getEquipeById(equipeId);

  const buscarColunas = () =>
    prisma.quadroColuna.findMany({
      where: { equipeId },
      orderBy: { ordem: 'asc' },
      include: { cartoes: { orderBy: { ordem: 'asc' }, include: INCLUDE_CARTAO_DESAFIO } },
    });

  let colunas = await buscarColunas();

  if (colunas.length === 0) {
    await prisma.$transaction(
      COLUNAS_PADRAO.map((nome, ordem) => prisma.quadroColuna.create({ data: { equipeId, nome, ordem } }))
    );
    colunas = await buscarColunas();
    await popularCartoesDosDesafios(equipeId, colunas);
    colunas = await buscarColunas();
  }

  return colunas;
}

export async function criarColuna(equipeId, { nome }) {
  await getEquipeById(equipeId);
  if (!nome?.trim()) {
    const err = new Error('Dê um nome para a coluna.');
    err.status = 400;
    throw err;
  }

  const ultima = await prisma.quadroColuna.findFirst({ where: { equipeId }, orderBy: { ordem: 'desc' } });
  return prisma.quadroColuna.create({
    data: { equipeId, nome: nome.trim(), ordem: (ultima?.ordem ?? -1) + 1 },
    include: { cartoes: true },
  });
}

async function getColuna(id) {
  const coluna = await prisma.quadroColuna.findUnique({ where: { id } });
  if (!coluna) notFound('Coluna não encontrada.');
  return coluna;
}

export async function renomearColuna(id, { nome }) {
  await getColuna(id);
  if (!nome?.trim()) {
    const err = new Error('Dê um nome para a coluna.');
    err.status = 400;
    throw err;
  }
  return prisma.quadroColuna.update({ where: { id }, data: { nome: nome.trim() } });
}

export async function excluirColuna(id) {
  await getColuna(id);
  await prisma.quadroColuna.delete({ where: { id } }); // cartões somem em cascata
}

export async function criarCartao(colunaId, { titulo, descricao, cor }) {
  const coluna = await getColuna(colunaId);
  if (!titulo?.trim()) {
    const err = new Error('Dê um título para o cartão.');
    err.status = 400;
    throw err;
  }

  const ultimo = await prisma.quadroCartao.findFirst({ where: { colunaId }, orderBy: { ordem: 'desc' } });
  return prisma.quadroCartao.create({
    data: {
      colunaId,
      titulo: titulo.trim(),
      descricao: descricao?.trim() || null,
      cor: cor || null,
      ordem: (ultimo?.ordem ?? -1) + 1,
    },
    include: INCLUDE_CARTAO_DESAFIO,
  });
}

async function getCartao(id) {
  const cartao = await prisma.quadroCartao.findUnique({ where: { id } });
  if (!cartao) notFound('Cartão não encontrado.');
  return cartao;
}

export async function editarCartao(id, { titulo, descricao, cor }) {
  await getCartao(id);
  return prisma.quadroCartao.update({
    where: { id },
    data: {
      ...(titulo?.trim() ? { titulo: titulo.trim() } : {}),
      ...(descricao !== undefined ? { descricao: descricao?.trim() || null } : {}),
      ...(cor !== undefined ? { cor: cor || null } : {}),
    },
    include: INCLUDE_CARTAO_DESAFIO,
  });
}

export async function excluirCartao(id) {
  await getCartao(id);
  await prisma.quadroCartao.delete({ where: { id } });
}

// Arrasta um cartão para outra coluna e/ou outra posição (índice, base 0).
// Reindexa a coluna de destino (e a de origem, se for diferente) pra manter
// a ordem sempre sequencial (0, 1, 2, ...), do jeito que o Trello faz.
export async function moverCartao(id, { colunaId: colunaDestinoId, posicao }) {
  const cartao = await getCartao(id);
  await getColuna(colunaDestinoId);

  const colunaOrigemId = cartao.colunaId;

  return prisma.$transaction(async (tx) => {
    const cartoesDestino = await tx.quadroCartao.findMany({
      where: { colunaId: colunaDestinoId, id: { not: id } },
      orderBy: { ordem: 'asc' },
    });

    const indice = Math.max(0, Math.min(posicao ?? cartoesDestino.length, cartoesDestino.length));
    cartoesDestino.splice(indice, 0, cartao);

    await Promise.all(
      cartoesDestino.map((c, ordem) =>
        tx.quadroCartao.update({ where: { id: c.id }, data: { colunaId: colunaDestinoId, ordem } })
      )
    );

    // Se saiu de outra coluna, reindexa o que ficou pra trás também.
    if (colunaOrigemId !== colunaDestinoId) {
      const restantes = await tx.quadroCartao.findMany({
        where: { colunaId: colunaOrigemId },
        orderBy: { ordem: 'asc' },
      });
      await Promise.all(
        restantes.map((c, ordem) => tx.quadroCartao.update({ where: { id: c.id }, data: { ordem } }))
      );
    }

    return tx.quadroCartao.findUnique({ where: { id }, include: INCLUDE_CARTAO_DESAFIO });
  });
}
