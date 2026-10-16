import prisma from '../utils/prisma.js';
import { getEquipeById } from './equipes.service.js';
import { textoObrigatorio, textoOpcional, validarId, numeroInteiro } from '../utils/validacao.js';

// Quadro estilo Trello com três colunas e um único cartão demonstrativo.
const COLUNAS_PADRAO = ['Pendente', 'Andamento', 'Concluído'];
const TITULO_EXEMPLO = 'EXEMPLO: Organizar uma tarefa da equipe';
const DESCRICAO_EXEMPLO = `CENÁRIO DE TESTE — Como usar o quadro

1. PENDENTE: crie um cartão para uma tarefa que a equipe ainda precisa fazer. Ex.: “Pesquisar ideias para o projeto”.
2. ANDAMENTO: quando alguém começar a tarefa, arraste o cartão para esta coluna.
3. CONCLUÍDO: quando a tarefa terminar, arraste o cartão para cá.

Para criar seu próprio cartão, clique em “＋ Adicionar um cartão”, informe o título e a descrição. Clique no cartão para editar a tarefa ou a etiqueta. Toda a equipe pode acompanhar o progresso neste quadro. Este cartão é apenas um exemplo; vocês podem editá-lo ou excluí-lo.`;

const INCLUDE_CARTAO_DESAFIO = { desafio: { select: { numero: true, titulo: true, dia: true } } };

function notFound(msg) {
  const err = new Error(msg);
  err.status = 404;
  throw err;
}

async function criarCartaoExemplo(colunas) {
  const pendente = colunas.find((c) => c.nome === 'Pendente') || colunas[0];
  if (!pendente) return;
  await prisma.quadroCartao.create({
    data: {
      colunaId: pendente.id,
      titulo: TITULO_EXEMPLO,
      descricao: DESCRICAO_EXEMPLO,
      criadoPor: 'EXEMPLO DO SISTEMA',
      ordem: 0,
    },
  });
}

// Garante as colunas padrão. Quadros antigos que continham cartões automáticos
// dos desafios são limpos uma única vez e recebem apenas o cartão demonstrativo.
// A criação/edição de novos cartões continua funcionando normalmente.
export async function listarQuadro(equipeId) {
  validarId(equipeId, 'ID da equipe');
  await getEquipeById(equipeId);

  const buscarColunas = () =>
    prisma.quadroColuna.findMany({
      where: { equipeId },
      orderBy: { ordem: 'asc' },
      include: { cartoes: { orderBy: { ordem: 'asc' }, include: INCLUDE_CARTAO_DESAFIO } },
    });

  let colunas = await buscarColunas();
  let quadroNovo = false;

  if (colunas.length === 0) {
    await prisma.$transaction(
      COLUNAS_PADRAO.map((nome, ordem) => prisma.quadroColuna.create({ data: { equipeId, nome, ordem } }))
    );
    colunas = await buscarColunas();
    quadroNovo = true;
  }

  const possuiCartoesDeDesafio = colunas.some((coluna) => coluna.cartoes.some((cartao) => cartao.desafioId));
  if (possuiCartoesDeDesafio) {
    await prisma.quadroCartao.deleteMany({
      where: { colunaId: { in: colunas.map((coluna) => coluna.id) } },
    });
    await criarCartaoExemplo(colunas);
    colunas = await buscarColunas();
  } else if (quadroNovo) {
    await criarCartaoExemplo(colunas);
    colunas = await buscarColunas();
  }

  return colunas;
}

export async function criarColuna(equipeId, { nome }) {
  await getEquipeById(equipeId);
  nome = textoObrigatorio(nome, 'Nome da coluna', { minimo: 1, maximo: 60 });
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
  nome = textoObrigatorio(nome, 'Nome da coluna', { minimo: 1, maximo: 60 });
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

export async function criarCartao(colunaId, { titulo, descricao, cor, criadoPor }) {
  await getColuna(colunaId);
  titulo = textoObrigatorio(titulo, 'Título do cartão', { minimo: 2, maximo: 120 });
  descricao = textoObrigatorio(descricao, 'Descrição do cartão', { minimo: 5, maximo: 2000 });
  cor = textoOpcional(cor, 'Cor do cartão', 40);
  criadoPor = textoOpcional(criadoPor, 'Criador do cartão', 100);

  const ultimo = await prisma.quadroCartao.findFirst({ where: { colunaId }, orderBy: { ordem: 'desc' } });
  return prisma.quadroCartao.create({
    data: {
      colunaId,
      titulo,
      descricao,
      criadoPor: criadoPor || null,
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
  if (titulo !== undefined) titulo = textoObrigatorio(titulo, 'Título do cartão', { minimo: 2, maximo: 120 });
  if (descricao !== undefined) descricao = textoObrigatorio(descricao, 'Descrição do cartão', { minimo: 5, maximo: 2000 });
  if (cor !== undefined) cor = textoOpcional(cor, 'Cor do cartão', 40);
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
