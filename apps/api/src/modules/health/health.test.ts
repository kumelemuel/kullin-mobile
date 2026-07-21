import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../../app.js';

describe('GET /api/health', () => {
  const app = buildApp({ logger: false });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
