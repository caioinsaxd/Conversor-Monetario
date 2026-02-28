import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Conversor Monetário API',
      version: '1.0.0',
      description: 'API REST para conversão de moedas com autenticação, cache e validação.',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'API Key ou JWT token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/entry-points/api/*.js', './src/app.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
