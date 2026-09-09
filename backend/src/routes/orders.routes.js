import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';

const router = Router();

router.get('/', ordersController.index);
router.get('/ranking', ordersController.ranking);
router.get('/:id', ordersController.show);
router.post('/', ordersController.store);
router.patch('/:id/status', ordersController.updateStatus);
router.delete('/:id', ordersController.destroy);

export default router;
