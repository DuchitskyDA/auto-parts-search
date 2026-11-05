import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, fetchOffers } from '../searchSlice';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

export default function BrandList() {
  const { brands } = useSelector((state) => state.search);
  const count = brands.status === 'succeeded' ? brands.items.length : null;

  return (
    <section className="panel brands" aria-labelledby="brands-title">
      <div className="panel__head">
        <h2 id="brands-title" className="panel__title">
          Производители
        </h2>
        {count > 0 && <span className="panel__meta">{count}</span>}
      </div>
      <BrandListBody />
    </section>
  );
}

function BrandListBody() {
  const dispatch = useDispatch();
  const { number, brands, selected } = useSelector((state) => state.search);

  if (brands.status === 'idle') {
    return <p className="state m-0">Введите артикул, чтобы увидеть производителей.</p>;
  }
  if (brands.status === 'loading') return <Loader text="Ищем производителей…" />;
  if (brands.status === 'failed') {
    return (
      <div className="panel__body">
        <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(number))} />
      </div>
    );
  }
  if (brands.items.length === 0) {
    return (
      <p className="state m-0">
        По артикулу <span className="mono">{number}</span> ничего не найдено. Проверьте номер.
      </p>
    );
  }

  return (
    <div className="brands__list">
      {brands.items.map((part) => (
        <button
          key={part.key}
          type="button"
          className={`brand ${selected?.key === part.key ? 'is-active' : ''}`}
          aria-pressed={selected?.key === part.key}
          onClick={() => dispatch(fetchOffers(part))}
        >
          <span className="brand__name">{part.brand}</span>
          <span className="part-no">{part.number}</span>
          <span className="brand__part">{part.name}</span>
        </button>
      ))}
    </div>
  );
}
