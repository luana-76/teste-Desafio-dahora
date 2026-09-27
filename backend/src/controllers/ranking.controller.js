import * as rankingService from '../services/ranking.service.js';
import { emitRankingAjustado } from '../socket.js';

function handleError(res, err) {
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

export async function rodada(req, res) {
  try {
    res.json(await rankingService.rankingRodada(req.params.desafioId));
  } catch (err) {
    handleError(res, err);
  }
}

export async function diario(req, res) {
  try {
    res.json(await rankingService.rankingDiario(req.params.dia));
  } catch (err) {
    handleError(res, err);
  }
}

export async function geral(req, res) {
  try {
    res.json(await rankingService.rankingGeral());
  } catch (err) {
    handleError(res, err);
  }
}

export async function ajustarPontos(req, res) {
  try {
    const { equipeId, pontos, motivo } = req.body;
    const ajuste = await rankingService.criarAjustePontos({
      equipeId,
      pontos,
      motivo,
      responsavel: req.usuario?.id,
    });
    emitRankingAjustado(ajuste);
    res.status(201).json(ajuste);
  } catch (err) {
    handleError(res, err);
  }
}
