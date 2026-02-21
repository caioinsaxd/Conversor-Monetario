import { Router } from 'express';
import { conversionController } from './conversionController.js';

const router = Router();

//rota publica
router.get('/health', conversionController.health);

//rota protegida pra conversao
router.post('/convert', conversionController.convert);
router.get('/convert', conversionController.convert);

export default router;
