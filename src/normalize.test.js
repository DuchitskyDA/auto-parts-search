import { describe, expect, it } from 'vitest';
import { toBrandList, toOffers } from './normalize';
import { formatShipment } from './format';
import brands01089 from './__fixtures__/brands-01089.json';
import analoguesAsam from './__fixtures__/analogues-asam.json';
import notFound from './__fixtures__/not-found.json';

describe('toBrandList', () => {
  it('собирает производителей из ответа по номеру', () => {
    const brands = toBrandList(brands01089.goods);
    expect(brands.map((b) => b.brand)).toContain('ASAM');
    expect(brands.map((b) => b.brand)).toContain('Meat & Doria');
    expect(new Set(brands.map((b) => b.key)).size).toBe(brands.length);
  });

  it('пустая структура «не найдено» даёт пустой список', () => {
    expect(toBrandList(notFound.goods)).toEqual([]);
  });
});

describe('toOffers', () => {
  const offers = toOffers(analoguesAsam.goods);

  it('ставит искомую деталь первой, затем аналоги', () => {
    expect(offers[0]).toMatchObject({ brand: 'ASAM', isRequested: true });
    expect(offers.some((o) => !o.isRequested)).toBe(true);
  });

  it('берёт цену и остаток из склада', () => {
    const [warehouse] = [...analoguesAsam.goods[0].warehouses].sort((a, b) => a.price - b.price);
    expect(offers[0]).toMatchObject({ price: warehouse.price, stock: warehouse.stock });
  });

  it('позиции без остатка — в конце, без цены', () => {
    const firstEmpty = offers.findIndex((o) => !o.isRequested && o.stock === 0);
    expect(firstEmpty).toBeGreaterThan(0);
    expect(offers.slice(firstEmpty).every((o) => o.stock === 0 && o.price === null)).toBe(true);
  });

  it('ключи строк уникальны', () => {
    expect(new Set(offers.map((o) => o.key)).size).toBe(offers.length);
  });

  it('пустой ответ — пустая таблица', () => {
    expect(toOffers(notFound.goods)).toEqual([]);
  });
});

describe('formatShipment', () => {
  it('разбирает дату отгрузки и время заказа без сдвига пояса', () => {
    expect(formatShipment('2026-11-09T13:40:00+03:00')).toEqual({ date: '09.11.2026', orderBefore: '13:40' });
    expect(formatShipment(null)).toBeNull();
  });
});
