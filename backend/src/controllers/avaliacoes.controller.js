import * as avaliacoesService from '../services/avaliacoes.service.js';
import { emitAvaliacaoRegistrada } from '../socket.js';

function handleError(res, err) {
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

export async function index(req, res) {
  try {
    const { desafioId, equipeId } = req.query;
    res.json(await avaliacoesService.listarAvaliacoes({ desafioId, equipeId }));
  } catch (err) {
    handleError(res, err);
  }
}

export async function store(req, res) {
  try {
    const avaliacao = await avaliacoesService.registrarAvaliacao(req.body);
    emitAvaliacaoRegistrada(avaliacao);
    res.status(201).json(avaliacao);
  } catch (err) {
    handleError(res, err);
  }
}
