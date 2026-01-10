import swaggerJsdoc from 'swagger-jsdoc';
import { components } from './swagger/components';
import { paths } from './swagger/paths';

const version = process.env.npm_package_version || '1.0.0';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PlanPal API Documentation',
      version,
      description: 'API documentation for PlanPal - A ministry management platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        url: 'https://github.com/neydareh/PlanPal',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Development server',
      },
    ],
    paths,
    components,
  },
  apis: ['./src/routes/*.ts', './src/interfaces/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
