import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { searchParts } from './api';
import { toBrandList, toOffers } from './normalize';

export const fetchBrands = createAsyncThunk('search/fetchBrands', async (number, { signal }) =>
  toBrandList(await searchParts({ number }, { signal })),
);

export const fetchOffers = createAsyncThunk('search/fetchOffers', async (part, { signal }) =>
  toOffers(await searchParts({ number: part.number, brand: part.brand }, { signal })),
);

const emptyRequest = { items: [], status: 'idle', error: null, requestId: null };

const initialState = {
  number: '',
  brands: emptyRequest,
  selected: null,
  offers: emptyRequest,
};

const start = (action) => ({ ...emptyRequest, status: 'loading', requestId: action.meta.requestId });

// Ответ на устаревший или отменённый запрос не должен перетирать актуальный.
const isCurrent = (request, action) => request.requestId === action.meta.requestId && !action.meta.aborted;

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    resetSearch: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.number = action.meta.arg;
        state.brands = start(action);
        state.selected = null;
        state.offers = emptyRequest;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (!isCurrent(state.brands, action)) return;
        state.brands.items = action.payload;
        state.brands.status = 'succeeded';
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (!isCurrent(state.brands, action)) return;
        state.brands.status = 'failed';
        state.brands.error = action.error.message;
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selected = action.meta.arg;
        state.offers = start(action);
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (!isCurrent(state.offers, action)) return;
        state.offers.items = action.payload;
        state.offers.status = 'succeeded';
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (!isCurrent(state.offers, action)) return;
        state.offers.status = 'failed';
        state.offers.error = action.error.message;
      });
  },
});

export const { resetSearch } = searchSlice.actions;
export default searchSlice.reducer;
