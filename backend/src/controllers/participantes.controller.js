import * as participantesService from '../services/participantes.service.js';

function handleError(res, err) {
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

export async function cadastrar(req, res) {
  try {
    const participante = await participantesService.cadastrar(req.body);
    res.status(201).json(participante);
  } catch (err) {
    handleError(res, err);
  }
}

export async function entrar(req, res) {
  try {
    const participante = await participantesService.entrar(req.body);
    res.json(participante);
  } catch (err) {
    handleError(res, err);
  }
}

export async function index(req, res) {
  try {
    const { equipeId } = req.query;
    res.json(await participantesService.listarParticipantes({ equipeId }));
  } catch (err) {
    handleError(res, err);
  }
}

export async function show(req, res) {
  try {
    res.json(await participantesService.getParticipanteById(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
}

export async function atualizarPerfil(req, res) {
  try {
    // Um participante só pode editar o próprio perfil; admin pode editar qualquer um.
    if (req.usuario.papel !== 'ADMIN' && req.usuario.id !== req.params.id) {
      return res.status(403).json({ error: 'Você só pode editar o seu próprio perfil.' });
    }
    res.json(await participantesService.atualizarPerfil(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
}

export async function atualizarPapel(req, res) {
  try {
    res.json(await participantesService.atualizarPapel(req.params.id, req.body.papel));
  } catch (err) {
    handleError(res, err);
  }
}
