const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });

export const formatPrice = (price) => (price == null ? '—' : priceFormat.format(price));

// shipmentDate: дата — день отгрузки, время — до скольки заказать, чтобы успеть к ней.
// Разбираем строку как есть, чтобы не сдвигать время в часовой пояс браузера.
export function formatShipment(shipmentDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(shipmentDate ?? '');
  if (!match) return null;
  const [, year, month, day, time] = match;
  return { date: `${day}.${month}.${year}`, orderBefore: time };
}
