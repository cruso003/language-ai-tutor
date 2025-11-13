import { buildApp } from '../src/app';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let app: Awaited<ReturnType<typeof buildApp>>;

describe('Conversation API', () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 400 on invalid payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/conversation',
      payload: { bad: 'data' }
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error).toBeDefined();
    expect(body.code).toBe('BAD_REQUEST');
  });
});
