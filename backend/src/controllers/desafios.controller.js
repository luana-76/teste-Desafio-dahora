import * as desafiosService from '../services/desafios.service.js';
import { emitDesafioCreated, emitDesafioUpdated, emitDesafioDeleted, emitTimerEstado } from '../socket.js';
import { iniciarCronometro } from '../state/timer.js';

function handleError(res, err) {
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

export async function index(req, res) {
  try {
    const { dia, status } = req.query;
    res.json(await desafiosService.listarDesafios({ dia, status }));
  } catch (err) {
    handleError(res, err);
  }
}

export async function show(req, res) {
  try {
    res.json(await desafiosService.getDesafioById(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
}

export async function store(req, res) {
  try {
    const desafio = await desafiosService.criarDesafio(req.body);
    emitDesafioCreated(desafio);
    res.status(201).json(desafio);
  } catch (err) {
    handleError(res, err);
  }
}

export async function update(req, res) {
  try {
    const desafio = await desafiosService.atualizarDesafio(req.params.id, req.body);
    emitDesafioUpdated(desafio);
    res.json(desafio);
  } catch (err) {
    handleError(res, err);
  }
}

export async function liberar(req, res) {
  try {
    const desafio = await desafiosService.liberarDesafio(req.params.id);
    emitDesafioUpdated(desafio);
    res.json(desafio);
  } catch (err) {
    handleError(res, err);
  }
}

// Ao iniciar o desafio (seção 3), o cronômetro de 60 minutos começa
// automaticamente e o novo estado é transmitido a todos os clientes.
export async function iniciar(req, res) {
  try {
    const desafio = await desafiosService.iniciarDesafio(req.params.id);
    emitDesafioUpdated(desafio);
    emitTimerEstado(iniciarCronometro(desafio.id));
    res.json(desafio);
  } catch (err) {
    handleError(res, err);
  }
}

export async function encerrar(req, res) {
  try {
    const desafio = await desafiosService.encerrarDesafio(req.params.id);
    emitDesafioUpdated(desafio);
    res.json(desafio);
  } catch (err) {
    handleError(res, err);
  }
}

export async function finalizar(req, res) {
  try {
    const desafio = await desafiosService.finalizarDesafio(req.params.id);
    emitDesafioUpdated(desafio);
    res.json(desafio);
  } catch (err) {
    handleError(res, err);
  }
}

export async function destroy(req, res) {
  try {
    await desafiosService.excluirDesafio(req.params.id);
    emitDesafioDeleted(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}
