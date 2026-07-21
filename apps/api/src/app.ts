import Fastify from 'fastify';
import { healthRoutes } from './modules/health/routes.js';
import { createActualBudgetStub } from './actual/ActualBudgetStub.js';
import type { ActualBudgetPort } from './actual/ActualBudgetPort.js';

export type AppOptions = {
  actual?: ActualBudgetPort;
  logger?: boolean;
};

export function buildApp(options: AppOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  const actual = options.actual ?? createActualBudgetStub();
  app.decorate('actual', actual);

  app.register(healthRoutes);

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    actual: ActualBudgetPort;
  }
}
