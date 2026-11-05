import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchParts } from './api';

const respond = (status, body) => vi.fn().mockResolvedValue(new Response(body, { status }));

afterEach(() => vi.unstubAllGlobals());

describe('searchParts', () => {
  it('сбой сети — понятное сообщение', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(searchParts({ number: '01089' })).rejects.toThrow('Не удалось связаться с сервером');
  });

  it('ошибка API в теле ответа с кодом 403', async () => {
    vi.stubGlobal('fetch', respond(403, '{"error":"Empty number goods!"}'));
    await expect(searchParts({ number: '' })).rejects.toThrow('не указан номер детали');
  });

  it('не-JSON ответ — ошибка сервиса с кодом', async () => {
    vi.stubGlobal('fetch', respond(502, '<html>Bad gateway</html>'));
    await expect(searchParts({ number: '01089' })).rejects.toThrow('HTTP 502');
  });

  it('передаёт бренд и analogues=on с кодированием спецсимволов', async () => {
    const fetch = respond(200, '{"goods":[]}');
    vi.stubGlobal('fetch', fetch);
    await searchParts({ number: '01089', brand: 'Meat & Doria' });
    expect(fetch.mock.calls[0][0]).toContain('brand=Meat+%26+Doria&analogues=on');
  });
});
