import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, resetSearch } from '../searchSlice';

const MIN_LENGTH = 3;
const DEBOUNCE_MS = 500;

// Поиск запускается сам после паузы ввода; Enter — сразу.
export default function SearchForm() {
  const dispatch = useDispatch();
  const lastNumber = useSelector((state) => state.search.number);
  const [value, setValue] = useState(lastNumber);
  const timer = useRef(null);
  const request = useRef(null);

  const search = useCallback(
    (number) => {
      clearTimeout(timer.current);
      request.current?.abort();
      request.current = number ? dispatch(fetchBrands(number)) : null;
      if (!number) dispatch(resetSearch());
    },
    [dispatch],
  );

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );

  const handleChange = (event) => {
    const next = event.target.value;
    setValue(next);
    clearTimeout(timer.current);
    const number = next.trim();
    if (number.length < MIN_LENGTH) {
      search('');
      return;
    }
    timer.current = setTimeout(() => search(number), DEBOUNCE_MS);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    search(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="panel panel__body">
      <label htmlFor="part-number" className="search__label">
        Артикул детали
      </label>
      <div className="input-group input-group-lg">
        <input
          id="part-number"
          className="form-control search__input"
          value={value}
          onChange={handleChange}
          placeholder="Например, 01089"
          autoComplete="off"
          spellCheck="false"
          autoFocus
        />
        <button type="submit" className="btn btn-ink">
          Найти
        </button>
      </div>
      <p className="search__hint mb-0">Поиск начнётся сам после {MIN_LENGTH} символов.</p>
    </form>
  );
}
