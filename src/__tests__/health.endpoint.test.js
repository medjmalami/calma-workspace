const request = require('supertest');

const app = require('../app');

describe('GET /health', () => {
  it('returns a healthy service response', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'calma-workspace'
    });
  });
});
