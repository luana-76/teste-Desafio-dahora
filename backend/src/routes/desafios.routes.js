import { Router } from 'express';
import * as desafiosController from '../controllers/desafios.controller.js';
import { somentePapel } from '../utils/autorizacao.js';

const router = Router();

router.get('/', desafiosController.index);
router.get('/:id', desafiosController.show);
router.post('/', somentePapel('ADMIN'), desafiosController.store);
router.patch('/:id', somentePapel('ADMIN'), desafiosController.update);
router.patch('/:id/liberar', somentePapel('ADMIN'), desafiosController.liberar);
router.patch('/:id/iniciar', somentePapel('ADMIN'), desafiosController.iniciar);
router.patch('/:id/encerrar', somentePapel('ADMIN'), desafiosController.encerrar);
router.patch('/:id/finalizar', somentePapel('ADMIN'), desafiosController.finalizar);
router.delete('/:id', somentePapel('ADMIN'), desafiosController.destroy);

export default router;
