import type { FastifyPluginAsync } from 'fastify';
import type { components } from '@kullin/contracts';

type HealthResponse = components['schemas']['HealthResponse'];

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Reply: HealthResponse }>('/api/health', async () => {
    return { status: 'ok' };
  });
};
