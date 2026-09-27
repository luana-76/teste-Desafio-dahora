import { Router } from 'express';
import * as rankingController from '../controllers/ranking.controller.js';
import { somentePapel } from '../utils/autorizacao.js';

const router = Router();

router.get('/rodada/:desafioId', rankingController.rodada);
router.get('/diario/:dia', rankingController.diario);
router.get('/geral', rankingController.geral);
router.post('/ajustes', somentePapel('ADMIN'), rankingController.ajustarPontos);

export default router;
