// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import reducer, { fetchOffers } from '../searchSlice';
import { toOffers } from '../normalize';
import OffersTable from './OffersTable';
import analoguesAsam from '../__fixtures__/analogues-asam.json';

// Договорённость с владельцем: аналоги показываются порциями по 50 строк.
const PORTION = 50;

const asam = { key: 'ASAM|01089', brand: 'ASAM', number: '01089', name: 'Фильтр топливный' };
const offers = toOffers(analoguesAsam.goods);
const analoguesTotal = offers.filter((o) => !o.isRequested).length;
const requestedTotal = offers.length - analoguesTotal;
const lastPortion = analoguesTotal % PORTION;

function showOffers(store, requestId) {
  act(() => {
    store.dispatch(fetchOffers.pending(requestId, asam));
    store.dispatch(fetchOffers.fulfilled(offers, requestId, asam));
  });
}

function renderTable() {
  const store = configureStore({ reducer: { search: reducer } });
  render(
    <Provider store={store}>
      <OffersTable />
    </Provider>,
  );
  showOffers(store, 'r1');
  return store;
}

// Строки предложений без шапки и строк-заголовков групп.
const offerRows = () => screen.getAllByRole('row').filter((row) => !row.className.includes('offers__group')).length - 1;
const moreButton = () => screen.queryByRole('button', { name: /^Показать ещё/ });

afterEach(cleanup);

describe('OffersTable: «Показать ещё»', () => {
  it('фикстура подходит для проверки: аналогов больше двух порций, последняя неполная', () => {
    expect(analoguesTotal).toBeGreaterThan(PORTION * 2);
    expect(lastPortion).toBeGreaterThan(0);
  });

  it('сначала показывает искомую деталь целиком и 50 аналогов', () => {
    renderTable();
    expect(offerRows()).toBe(requestedTotal + 50);
    expect(screen.getByText(`Показано 50 из ${analoguesTotal} аналогов`)).toBeTruthy();
    expect(moreButton().textContent).toBe('Показать ещё 50');
  });

  it('догружает по 50, на последней порции обещает остаток и затем прячет кнопку', () => {
    renderTable();
    fireEvent.click(moreButton());
    expect(offerRows()).toBe(requestedTotal + 100);

    const clicksLeft = Math.ceil(analoguesTotal / PORTION) - 2;
    for (let i = 1; i < clicksLeft; i += 1) fireEvent.click(moreButton());
    expect(moreButton().textContent).toBe(`Показать ещё ${lastPortion}`);

    fireEvent.click(moreButton());
    expect(moreButton()).toBeNull();
    expect(offerRows()).toBe(requestedTotal + analoguesTotal);
    expect(screen.getByText(`Показано ${analoguesTotal} из ${analoguesTotal} аналогов`)).toBeTruthy();
  });

  it('новая выдача снова начинается с 50 аналогов', () => {
    const store = renderTable();
    fireEvent.click(moreButton());
    expect(offerRows()).toBe(requestedTotal + 100);
    showOffers(store, 'r2');
    expect(offerRows()).toBe(requestedTotal + 50);
  });
});
