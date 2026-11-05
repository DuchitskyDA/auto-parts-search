import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBrands, resetSearch } from '../searchSlice';

const MIN_LENGTH = 3;
const DEBOUNCE_MS = 500;

// Поиск запускается сам после паузы ввода; Enter — сразу.
export default function SearchForm() {
  const dispatch = useDispatch();
  const [value, setValue] = useState('');
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
    <form onSubmit={handleSubmit} role="search">
      <label htmlFor="part-number" className="form-label">
        Артикул детали
      </label>
      <input
        id="part-number"
        className="form-control form-control-lg"
        value={value}
        onChange={handleChange}
        placeholder="Например, 01089"
        autoComplete="off"
        autoFocus
      />
      <div className="form-text">Поиск начнётся после ввода {MIN_LENGTH} символов или по Enter.</div>
    </form>
  );
}
