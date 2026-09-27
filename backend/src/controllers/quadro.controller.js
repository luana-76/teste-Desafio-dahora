import * as quadroService from '../services/quadro.service.js';
import * as participantesService from '../services/participantes.service.js';
import { emitQuadroAtualizado } from '../socket.js';

function handleError(res, err) {
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

// Só membros da própria equipe (ou ADMIN/MONITOR) podem editar o quadro
// dela. Ver o quadro é liberado pra qualquer pessoa logada (é útil pra
// monitores acompanharem várias equipes). Toda mutação abaixo exige
// "equipeId" no corpo — é o jeito mais simples do front-end garantir que a
// autorização e o aviso via socket sempre sabem de qual equipe se trata.
async function podeEditar(req, equipeId) {
  if (!equipeId) return false;
  if (req.usuario.papel === 'ADMIN' || req.usuario.papel === 'MONITOR') return true;
  if (!req.usuario.id) return false;
  try {
    const participante = await participantesService.getParticipanteById(req.usuario.id);
    return participante.equipeId === equipeId;
  } catch {
    return false;
  }
}

function proibido(res) {
  res.status(403).json({ error: 'Só quem é dessa equipe (ou monitor/admin) pode editar o quadro dela.' });
}

function semEquipeId(res) {
  res.status(400).json({ error: 'Envie "equipeId" no corpo da requisição.' });
}

export async function show(req, res) {
  try {
    res.json(await quadroService.listarQuadro(req.params.equipeId));
  } catch (err) {
    handleError(res, err);
  }
}

export async function criarColuna(req, res) {
  try {
    if (!(await podeEditar(req, req.params.equipeId))) return proibido(res);
    const coluna = await quadroService.criarColuna(req.params.equipeId, req.body);
    emitQuadroAtualizado(req.params.equipeId);
    res.status(201).json(coluna);
  } catch (err) {
    handleError(res, err);
  }
}

export async function renomearColuna(req, res) {
  try {
    const { equipeId } = req.body;
    if (!equipeId) return semEquipeId(res);
    if (!(await podeEditar(req, equipeId))) return proibido(res);
    const coluna = await quadroService.renomearColuna(req.params.id, req.body);
    emitQuadroAtualizado(equipeId);
    res.json(coluna);
  } catch (err) {
    handleError(res, err);
  }
}

export async function excluirColuna(req, res) {
  try {
    const { equipeId } = req.body;
    if (!equipeId) return semEquipeId(res);
    if (!(await podeEditar(req, equipeId))) return proibido(res);
    await quadroService.excluirColuna(req.params.id);
    emitQuadroAtualizado(equipeId);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}

export async function criarCartao(req, res) {
  try {
    const { equipeId } = req.body;
    if (!equipeId) return semEquipeId(res);
    if (!(await podeEditar(req, equipeId))) return proibido(res);
    const cartao = await quadroService.criarCartao(req.params.colunaId, req.body);
    emitQuadroAtualizado(equipeId);
    res.status(201).json(cartao);
  } catch (err) {
    handleError(res, err);
  }
}

export async function editarCartao(req, res) {
  try {
    const { equipeId } = req.body;
    if (!equipeId) return semEquipeId(res);
    if (!(await podeEditar(req, equipeId))) return proibido(res);
    const cartao = await quadroService.editarCartao(req.params.id, req.body);
    emitQuadroAtualizado(equipeId);
    res.json(cartao);
  } catch (err) {
    handleError(res, err);
  }
}

export async function moverCartao(req, res) {
  try {
    const { equipeId } = req.body;
    if (!equipeId) return semEquipeId(res);
    if (!(await podeEditar(req, equipeId))) return proibido(res);
    const cartao = await quadroService.moverCartao(req.params.id, req.body);
    emitQuadroAtualizado(equipeId);
    res.json(cartao);
  } catch (err) {
    handleError(res, err);
  }
}

export async function excluirCartao(req, res) {
  try {
    const { equipeId } = req.body;
    if (!equipeId) return semEquipeId(res);
    if (!(await podeEditar(req, equipeId))) return proibido(res);
    await quadroService.excluirCartao(req.params.id);
    emitQuadroAtualizado(equipeId);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}
