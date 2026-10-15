import { Router } from 'express';
import * as cartasController from '../controllers/cartas.controller.js';
import { somentePapel } from '../utils/autorizacao.js';
const router = Router();

router.get('/', cartasController.index);
router.get('/desbloqueadas', cartasController.desbloqueadas);
router.post('/desbloquear', cartasController.resgatar);
router.post('/codigos', somentePapel('ADMIN', 'MONITOR'), cartasController.criarCodigo);
router.post('/', cartasController.store);

export default router;
