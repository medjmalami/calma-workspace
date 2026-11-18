const request = require('supertest');

const app = require('../app');

describe('shared error handler', () => {
  it('returns the standard not-found error contract', async () => {
    const response = await request(app).get('/route-that-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found'
      }
    });
  });
});
