import { Router } from 'express';
import * as quadroController from '../controllers/quadro.controller.js';

const router = Router();

// A autorização (só quem é da equipe, ou monitor/admin) é feita dentro do
// controller, porque depende do "equipeId" no corpo/param — ver
// controllers/quadro.controller.js.
router.get('/:equipeId', quadroController.show);
router.post('/:equipeId/colunas', quadroController.criarColuna);
router.patch('/colunas/:id', quadroController.renomearColuna);
router.delete('/colunas/:id', quadroController.excluirColuna);
router.post('/colunas/:colunaId/cartoes', quadroController.criarCartao);
router.patch('/cartoes/:id', quadroController.editarCartao);
router.patch('/cartoes/:id/mover', quadroController.moverCartao);
router.delete('/cartoes/:id', quadroController.excluirCartao);

export default router;
