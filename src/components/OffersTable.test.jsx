// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import reducer, { fetchOffers } from '../searchSlice';
import { toOffers } from '../normalize';
import OffersTable, { PAGE_SIZE } from './OffersTable';
import analoguesAsam from '../__fixtures__/analogues-asam.json';

const asam = { key: 'ASAM|01089', brand: 'ASAM', number: '01089', name: 'Фильтр топливный' };
const offers = toOffers(analoguesAsam.goods);
const analoguesTotal = offers.filter((o) => !o.isRequested).length;
const requestedTotal = offers.length - analoguesTotal;

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

// Строки предложений без строк-заголовков групп.
const offerRows = () => screen.getAllByRole('row').filter((row) => !row.className.includes('offers__group')).length - 1;

afterEach(cleanup);

describe('OffersTable: «Показать ещё»', () => {
  it('сначала показывает искомую деталь целиком и первые аналоги', () => {
    expect(analoguesTotal).toBeGreaterThan(PAGE_SIZE * 2);
    renderTable();
    expect(offerRows()).toBe(requestedTotal + PAGE_SIZE);
    expect(screen.getByText(`Показано ${PAGE_SIZE} из ${analoguesTotal} аналогов`)).toBeTruthy();
  });

  it('догружает порциями, пока не покажет все, и прячет кнопку', () => {
    renderTable();
    const clicks = Math.ceil(analoguesTotal / PAGE_SIZE) - 1;
    for (let i = 0; i < clicks; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: /Показать ещё/ }));
    }
    expect(screen.queryByRole('button', { name: /Показать ещё/ })).toBeNull();
    expect(offerRows()).toBe(requestedTotal + analoguesTotal);
    expect(screen.getByText(`Показано ${analoguesTotal} из ${analoguesTotal} аналогов`)).toBeTruthy();
  });

  it('новая выдача снова начинается с первой порции', () => {
    const store = renderTable();
    fireEvent.click(screen.getByRole('button', { name: /Показать ещё/ }));
    expect(offerRows()).toBe(requestedTotal + PAGE_SIZE * 2);
    showOffers(store, 'r2');
    expect(offerRows()).toBe(requestedTotal + PAGE_SIZE);
  });
});
