import * as equipesService from '../services/equipes.service.js';
import { emitEquipeCreated, emitEquipeUpdated, emitEquipeDeleted } from '../socket.js';

function handleError(res, err) {
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

export async function index(req, res) {
  try {
    res.json(await equipesService.listarEquipes());
  } catch (err) {
    handleError(res, err);
  }
}

export async function show(req, res) {
  try {
    res.json(await equipesService.getEquipeById(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
}

export async function store(req, res) {
  try {
    const equipe = await equipesService.criarEquipe(req.body);
    emitEquipeCreated(equipe);
    res.status(201).json(equipe);
  } catch (err) {
    handleError(res, err);
  }
}

export async function update(req, res) {
  try {
    const equipe = await equipesService.atualizarEquipe(req.params.id, req.body);
    emitEquipeUpdated(equipe);
    res.json(equipe);
  } catch (err) {
    handleError(res, err);
  }
}

export async function destroy(req, res) {
  try {
    await equipesService.excluirEquipe(req.params.id);
    emitEquipeDeleted(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}

export async function adicionarParticipante(req, res) {
  try {
    const { participanteId } = req.body;
    await equipesService.adicionarParticipante(req.params.id, participanteId);
    const equipe = await equipesService.getEquipeById(req.params.id);
    emitEquipeUpdated(equipe);
    res.json(equipe);
  } catch (err) {
    handleError(res, err);
  }
}

export async function removerParticipante(req, res) {
  try {
    await equipesService.removerParticipante(req.params.id, req.params.participanteId);
    const equipe = await equipesService.getEquipeById(req.params.id);
    emitEquipeUpdated(equipe);
    res.json(equipe);
  } catch (err) {
    handleError(res, err);
  }
}
