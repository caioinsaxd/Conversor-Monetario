import { Router } from 'express';
import { conversionController } from './conversionController.js';
import { generateJWT } from '../middleware/authentication.js';
import { config } from '../../config/index.js';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check da API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /auth/token:
 *   post:
 *     summary: Gera um token JWT para testes (apenas em desenvolvimento)
 *     tags: [Autenticação]
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       403:
 *         description: Disponível apenas em ambiente de desenvolvimento
 */

/**
 * @swagger
 * /api/convert:
 *   post:
 *     summary: Converte um valor de uma moeda para outra
 *     tags: [Conversão]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromCurrency
 *               - toCurrency
 *               - value
 *             properties:
 *               fromCurrency:
 *                 type: string
 *                 description: "Moeda de origem, ex: USD"
 *                 example: USD
 *               toCurrency:
 *                 type: string
 *                 description: "Moeda de destino, ex: BRL"
 *                 example: BRL
 *               value:
 *                 type: number
 *                 description: Valor a ser convertido
 *                 example: 100
 *     responses:
 *       200:
 *         description: Conversão realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     fromCurrency:
 *                       type: string
 *                     toCurrency:
 *                       type: string
 *                     value:
 *                       type: number
 *                     convertedValue:
 *                       type: number
 *                     rate:
 *                       type: number
 *                     source:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                 metadata:
 *                   type: object
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autorizado
 *       503:
 *         description: Serviço externo indisponível
 */

//rota publica
router.get('/health', conversionController.health);

//rota protegida pra conversao
router.post('/convert', conversionController.convert);
router.get('/convert', conversionController.convert);

export default router;
