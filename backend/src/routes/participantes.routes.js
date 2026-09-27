import { Router } from 'express';
import * as participantesController from '../controllers/participantes.controller.js';
import { somentePapel } from '../utils/autorizacao.js';

const router = Router();

router.post('/cadastro', participantesController.cadastrar);
router.post('/entrar', participantesController.entrar);
router.get('/', somentePapel('ADMIN', 'MONITOR'), participantesController.index);
router.get('/:id', participantesController.show);
router.patch('/:id', participantesController.atualizarPerfil);
router.patch('/:id/papel', somentePapel('ADMIN'), participantesController.atualizarPapel);

export default router;
