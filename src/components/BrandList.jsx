import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, fetchOffers } from '../searchSlice';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

export default function BrandList() {
  const dispatch = useDispatch();
  const { number, brands, selected } = useSelector((state) => state.search);

  if (brands.status === 'idle') {
    return <p className="text-secondary">Введите артикул, чтобы увидеть производителей.</p>;
  }
  if (brands.status === 'loading') return <Loader text="Ищем производителей…" />;
  if (brands.status === 'failed') {
    return <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(number))} />;
  }
  if (brands.items.length === 0) {
    return <div className="alert alert-warning">По артикулу «{number}» ничего не найдено.</div>;
  }

  return (
    <>
      <h2 className="h6 text-secondary mb-2">Производители ({brands.items.length})</h2>
      <div className="list-group">
        {brands.items.map((part) => (
          <button
            key={part.key}
            type="button"
            className={`list-group-item list-group-item-action ${selected?.key === part.key ? 'active' : ''}`}
            onClick={() => dispatch(fetchOffers(part))}
          >
            <div className="d-flex justify-content-between">
              <strong>{part.brand}</strong>
              <span className="small">{part.number}</span>
            </div>
            <div className="small">{part.name}</div>
          </button>
        ))}
      </div>
    </>
  );
}
