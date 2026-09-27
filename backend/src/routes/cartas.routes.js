import { Router } from 'express';
import * as cartasController from '../controllers/cartas.controller.js';
import { somentePapel } from '../utils/autorizacao.js';

const router = Router();

router.get('/', cartasController.index);
router.post('/', somentePapel('ADMIN', 'MONITOR'), cartasController.store);

export default router;
