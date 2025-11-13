import { buildApp } from '../src/app';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';

let app: Awaited<ReturnType<typeof buildApp>>;

describe('Sessions API', () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid start payload', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/sessions', payload: { bad: 'data' } });
    expect(res.statusCode).toBe(400);
  });

  it('creates then updates a session (no auth)', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: {
        userId: randomUUID(),
        scenarioId: 'scenario-test'
      }
    });
    expect(createRes.statusCode).toBe(201);
    const created = createRes.json();
    expect(created.id).toBeDefined();

    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/sessions/${created.id}`,
      payload: { completed: true, summary: { text: 'Done' }, metrics: { accuracy_score: 90 } }
    });
    expect(patchRes.statusCode).toBe(200);
    const patched = patchRes.json();
    expect(patched.updated).toBe(true);

    const getRes = await app.inject({ method: 'GET', url: `/api/v1/sessions/${created.id}` });
    expect(getRes.statusCode).toBe(200);
    const session = getRes.json();
    expect(session.completed).toBe(true);
    expect(session.summary).toBeDefined();
  });
});
