// Если товар не найден, сервис возвращает массив с одной пустой структурой.
const isFound = (item) => Boolean(item?.brand || item?.number);

const partKey = (item) => `${item.brand}|${item.number}`;

export function toBrandList(goods) {
  const brands = new Map();
  for (const item of goods.filter(isFound)) {
    const key = partKey(item);
    if (!brands.has(key)) {
      brands.set(key, { key, brand: item.brand, number: item.number, name: item.name, count: item.count ?? 0 });
    }
  }
  return [...brands.values()];
}

// Строка таблицы — одно предложение склада. Цена берётся только из склада:
// верхнеуровневый price сервис просит не использовать.
export function toOffers(goods) {
  const requested = goods.filter(isFound);
  const parts = uniqueById([
    ...requested.map((item) => ({ ...item, isRequested: true })),
    ...requested.flatMap((item) => (item.analogues ?? []).filter(isFound)),
  ]);

  const rows = parts.flatMap(toRows);
  const inStock = (row) => row.stock > 0;
  return [
    ...rows.filter((row) => row.isRequested),
    ...rows.filter((row) => !row.isRequested && inStock(row)),
    ...rows.filter((row) => !row.isRequested && !inStock(row)),
  ];
}

function uniqueById(parts) {
  const seen = new Set();
  return parts.filter((part) => {
    const id = part.goodsID || partKey(part);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function toRows(part) {
  const base = {
    brand: part.brand,
    number: part.number,
    name: part.name,
    isRequested: Boolean(part.isRequested),
  };
  const warehouses = part.warehouses ?? [];
  if (warehouses.length === 0) {
    return [{ ...base, key: part.goodsID, warehouse: null, price: null, stock: 0, shipmentDate: null }];
  }
  return [...warehouses]
    .sort((a, b) => a.price - b.price)
    .map((warehouse, index) => ({
      ...base,
      key: `${part.goodsID}|${warehouse.id}|${index}`,
      warehouse: warehouse.code || null,
      price: warehouse.price,
      stock: warehouse.stock ?? 0,
      shipmentDate: warehouse.shipmentDate ?? null,
    }));
}
