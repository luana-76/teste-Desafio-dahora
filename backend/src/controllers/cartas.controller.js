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
    const carta = await cartasService.registrarUso(req.body, req.usuario);
    emitCartaRegistrada(carta);
    res.status(201).json(carta);
  } catch (err) {
    handleError(res, err);
  }
}


export async function desbloqueadas(req, res) {
  try { res.json(await cartasService.listarDesbloqueios(req.usuario?.id)); }
  catch (err) { handleError(res, err); }
}

export async function resgatar(req, res) {
  try { res.status(201).json(await cartasService.resgatarCodigo(req.body, req.usuario)); }
  catch (err) { handleError(res, err); }
}

export async function criarCodigo(req, res) {
  try { res.status(201).json(await cartasService.criarCodigo(req.body)); }
  catch (err) { handleError(res, err); }
}
