// Прогон клиента против живого API: оба этапа, «не найдено», неверный ключ.
import { searchParts } from '../src/api.js';
import { toBrandList, toOffers } from '../src/normalize.js';

const brands = toBrandList(await searchParts({ number: '01089' }));
console.log('Этап 1, производители 01089:', brands.map((b) => b.brand).join(', '));

const special = brands.find((b) => b.brand.includes('&')) ?? brands[0];
const offers = toOffers(await searchParts(special));
console.log(`Этап 2, ${special.brand}: строк ${offers.length}, первая:`, offers[0]);

const asam = toOffers(await searchParts({ number: '01089', brand: 'ASAM' }));
console.log('Этап 2, ASAM: строк', asam.length, 'аналогов в наличии', asam.filter((o) => !o.isRequested && o.stock > 0).length);

console.log('Не найдено:', toBrandList(await searchParts({ number: 'ZZZ999999QQ' })));

try {
  await searchParts({ number: '01089' }, { key: 'bad' });
} catch (error) {
  console.log('Неверный ключ:', error.message);
}
