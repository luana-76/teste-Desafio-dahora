import * as ordersService from '../services/orders.service.js';
import { emitOrderCreated, emitOrderUpdated, emitOrderDeleted } from '../socket.js';

function handleError(res, err) {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erro interno do servidor.' });
}

export async function index(req, res) {
  try {
    const orders = await ordersService.listOrders();
    res.json(orders);
  } catch (err) {
    handleError(res, err);
  }
}

export async function ranking(req, res) {
  try {
    const { periodo } = req.query;
    const dados = await ordersService.getRanking(periodo);
    res.json(dados);
  } catch (err) {
    handleError(res, err);
  }
}

export async function show(req, res) {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
}

export async function store(req, res) {
  try {
    const order = await ordersService.createOrder(req.body);
    emitOrderCreated(order);
    res.status(201).json(order);
  } catch (err) {
    handleError(res, err);
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await ordersService.updateOrderStatus(id, status);
    emitOrderUpdated(order);
    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
}

export async function destroy(req, res) {
  try {
    const { id } = req.params;
    await ordersService.removeOrder(id);
    emitOrderDeleted(id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}
