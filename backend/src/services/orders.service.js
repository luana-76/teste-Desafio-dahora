import prisma from '../utils/prisma.js';
import { ORDER_STATUSES, isValidStatus } from '../utils/orderStatus.js';

const PERIODOS = {
  hoje: () => {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  },
  semana: () => {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 7);
    return inicio;
  },
  mes: () => {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    return inicio;
  },
  sempre: () => null,
};

// Ranking de clientes por valor total gasto (pedidos cancelados não contam).
// Como o app não tem uma entidade "cliente" própria, agrupamos pelo nome
// exatamente como foi digitado ao criar o pedido.
export async function getRanking(periodo = 'sempre') {
  const desde = (PERIODOS[periodo] || PERIODOS.sempre)();

  const grupos = await prisma.order.groupBy({
    by: ['cliente'],
    where: {
      status: { not: 'CANCELADO' },
      ...(desde ? { createdAt: { gte: desde } } : {}),
    },
    _sum: { valor: true },
    _count: { _all: true },
  });

  return grupos
    .map((g) => ({
      cliente: g.cliente,
      totalGasto: g._sum.valor || 0,
      totalPedidos: g._count._all,
    }))
    .sort((a, b) => b.totalGasto - a.totalGasto);
}

export async function listOrders() {
  return prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getOrderById(id) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    const err = new Error('Pedido não encontrado.');
    err.status = 404;
    throw err;
  }
  return order;
}

export async function createOrder({ cliente, itens, valor, observacao }) {
  if (!cliente?.trim() || !itens?.trim()) {
    const err = new Error('Os campos "cliente" e "itens" são obrigatórios.');
    err.status = 400;
    throw err;
  }

  return prisma.order.create({
    data: {
      cliente: cliente.trim(),
      itens: itens.trim(),
      valor: valor ? Number(valor) : 0,
      observacao: observacao?.trim() || null,
    },
  });
}

export async function updateOrder(id, { cliente, itens, valor, observacao }) {
  if (!cliente?.trim() || !itens?.trim()) {
    const err = new Error('Os campos "cliente" e "itens" são obrigatórios.');
    err.status = 400;
    throw err;
  }

  await getOrderById(id); // garante que existe (lança 404 se não)

  return prisma.order.update({
    where: { id },
    data: {
      cliente: cliente.trim(),
      itens: itens.trim(),
      valor: valor ? Number(valor) : 0,
      observacao: observacao?.trim() || null,
    },
  });
}

export async function updateOrderStatus(id, status) {
  if (!isValidStatus(status)) {
    const err = new Error(`Status inválido. Use um dos: ${ORDER_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  await getOrderById(id); // garante que existe (lança 404 se não)

  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function removeOrder(id) {
  await getOrderById(id);
  await prisma.order.delete({ where: { id } });
}
