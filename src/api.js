// Клиент веб-сервиса «Проценка» Favorit: https://lk.favorit-parts.ru/static/wsprice.pdf

const DEMO_KEY = '00000000-0000-0000-0000-000000000001';
const API_URL = import.meta.env?.VITE_FAVORIT_API_URL || 'https://api.favorit-parts.ru/hs/hsprice/';
const API_KEY = import.meta.env?.VITE_FAVORIT_KEY || DEMO_KEY;

const NETWORK_ERROR = 'Не удалось связаться с сервером. Проверьте подключение к интернету.';

const API_ERRORS = {
  'Empty key!': 'не указан ключ покупателя',
  'Invalid key client!': 'неверный ключ покупателя',
  'Invalid access key': 'неверный ключ покупателя',
  'Empty number goods!': 'не указан номер детали',
  'Request quota exceeded!': 'превышен лимит запросов',
};

// Без brand сервис возвращает детали всех производителей с этим номером,
// с brand и analogues=on — саму деталь и её аналоги.
export async function searchParts({ number, brand }, { signal, key = API_KEY } = {}) {
  const params = new URLSearchParams({ key, number });
  if (brand) {
    params.set('brand', brand);
    params.set('analogues', 'on');
  }

  let response;
  try {
    response = await fetch(`${API_URL}?${params}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(NETWORK_ERROR);
  }

  const data = parseJson(await response.text());
  if (data?.error) throw new Error(`Ошибка сервиса: ${describeApiError(data.error)}.`);
  if (!response.ok) throw new Error(`Сервис недоступен (HTTP ${response.status}). Попробуйте позже.`);
  if (!Array.isArray(data?.goods)) throw new Error('Сервис вернул ответ в неожиданном формате.');
  return data.goods;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function describeApiError(error) {
  const messages = Array.isArray(error) ? error : [error];
  return messages.map((message) => API_ERRORS[message] ?? String(message)).join('; ');
}
