import { Router } from 'express';
import * as equipesController from '../controllers/equipes.controller.js';
import { somentePapel } from '../utils/autorizacao.js';

const router = Router();

router.get('/', equipesController.index);
router.get('/:id', equipesController.show);
router.post('/', somentePapel('ADMIN'), equipesController.store);
router.patch('/:id', somentePapel('ADMIN'), equipesController.update);
router.delete('/:id', somentePapel('ADMIN'), equipesController.destroy);
router.post('/:id/participantes', somentePapel('ADMIN'), equipesController.adicionarParticipante);
router.delete('/:id/participantes/:participanteId', somentePapel('ADMIN'), equipesController.removerParticipante);

export default router;
