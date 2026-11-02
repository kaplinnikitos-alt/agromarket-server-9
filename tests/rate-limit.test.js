import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { uniqueEmail } from './helpers.js';

// Отдельный файл: счётчик неудачных входов живёт в памяти процесса,
// и этот тест «выбирает» весь лимит для своего IP
describe('Ограничение попыток входа', () => {
  it('6-я неудачная попытка подряд — 429', async () => {
    const email = uniqueEmail('brute');
    const statuses = [];

    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'неверный-пароль' });
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);
  });
});
