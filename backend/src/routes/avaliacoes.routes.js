import { Router } from 'express';
import * as avaliacoesController from '../controllers/avaliacoes.controller.js';
import { somentePapel } from '../utils/autorizacao.js';

const router = Router();

router.get('/', avaliacoesController.index);
router.post('/', somentePapel('ADMIN', 'MONITOR'), avaliacoesController.store);

export default router;
