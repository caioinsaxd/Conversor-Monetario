import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import routes from './entry-points/api/routes.js';
import { authenticationMiddleware, generateJWT } from './entry-points/middleware/authentication.js';
import { errorHandlerMiddleware } from './entry-points/middleware/errorHandler.js';

const app = express();

//middleware com cors
app.use(cors());

//parsea o json
app.use(express.json());

//rota pública sem auth
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
  });
});

//rota para gerar token de teste(apenas em ambiente de dev)
if (config.NODE_ENV === 'development') {
  app.post('/auth/token', (req, res) => {
    const token = generateJWT({ sub: 'test-user', role: 'user' });
    res.status(200).json({ token, expiresIn: '1h' });
  });
}

//aplica auth a todas as rotas não publicas
app.use(authenticationMiddleware);

//rotas da API
app.use('/api', routes);

//middleware de tratamento de erros
app.use(errorHandlerMiddleware);

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});


process.on('unhandledRejection', (reason) => {
  console.error('[ERROR] Unhandled rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught exception:', error.message);
  process.exit(1);
});

export default app;
