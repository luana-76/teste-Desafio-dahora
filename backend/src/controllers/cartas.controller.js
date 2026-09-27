import * as cartasService from '../services/cartas.service.js';
import { emitCartaRegistrada } from '../socket.js';

function handleError(res, err) {
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

export async function index(req, res) {
  try {
    const { equipeId } = req.query;
    res.json(await cartasService.listarCartas({ equipeId }));
  } catch (err) {
    handleError(res, err);
  }
}

export async function store(req, res) {
  try {
    const carta = await cartasService.registrarUso(req.body);
    emitCartaRegistrada(carta);
    res.status(201).json(carta);
  } catch (err) {
    handleError(res, err);
  }
}
