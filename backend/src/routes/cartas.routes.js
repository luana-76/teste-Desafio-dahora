import { Router } from 'express';
import * as cartasController from '../controllers/cartas.controller.js';
const router = Router();

router.get('/', cartasController.index);
router.post('/', cartasController.store);

export default router;
