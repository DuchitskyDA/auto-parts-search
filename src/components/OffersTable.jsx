import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers } from '../searchSlice';
import { formatPrice, formatShipment } from '../format';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

const COLUMNS = 6;

export default function OffersTable() {
  const { selected, offers } = useSelector((state) => state.search);
  if (!selected) return null;

  const count = offers.status === 'succeeded' ? offers.items.length : null;
  return (
    <section className="panel" aria-labelledby="offers-title">
      <div className="panel__head">
        <h2 id="offers-title" className="panel__title">
          {selected.brand} <span className="part-no ms-1">{selected.number}</span>
          <span className="d-block fw-normal text-secondary small mt-1">{selected.name}</span>
        </h2>
        {count > 0 && <span className="panel__meta">{count} предложений</span>}
      </div>
      <OffersBody />
    </section>
  );
}

function OffersBody() {
  const dispatch = useDispatch();
  const { selected, offers } = useSelector((state) => state.search);

  if (offers.status === 'loading') return <Loader text="Ищем предложения и аналоги…" />;
  if (offers.status === 'failed') {
    return (
      <div className="panel__body">
        <ErrorAlert message={offers.error} onRetry={() => dispatch(fetchOffers(selected))} />
      </div>
    );
  }
  if (offers.items.length === 0) {
    return <p className="state m-0">Предложений по этой детали нет. Выберите другого производителя.</p>;
  }

  const requested = offers.items.filter((offer) => offer.isRequested);
  const analogues = offers.items.filter((offer) => !offer.isRequested);

  return (
    <div className="table-responsive">
      <table className="offers table table-hover">
        <thead>
          <tr>
            <th scope="col">Производитель</th>
            <th scope="col">Наименование</th>
            <th scope="col">Склад</th>
            <th scope="col">Отгрузка</th>
            <th scope="col" className="num">
              Остаток
            </th>
            <th scope="col" className="num">
              Цена
            </th>
          </tr>
        </thead>
        <tbody>
          <OfferGroup title="Искомая деталь" offers={requested} />
          <OfferGroup title={`Аналоги · ${analogues.length}`} offers={analogues} />
        </tbody>
      </table>
    </div>
  );
}

function OfferGroup({ title, offers }) {
  if (offers.length === 0) return null;
  return (
    <>
      <tr className="offers__group">
        <td colSpan={COLUMNS} className="cell-wide">
          {title}
        </td>
      </tr>
      {offers.map((offer) => (
        <OfferRow key={offer.key} offer={offer} />
      ))}
    </>
  );
}

function OfferRow({ offer }) {
  const shipment = formatShipment(offer.shipmentDate);
  const inStock = offer.stock > 0;
  return (
    <tr className={inStock ? '' : 'is-out'}>
      <td data-label="Производитель" className="cell-wide cell-plain">
        <div className="offers__brand">{offer.brand}</div>
        <span className="part-no">{offer.number}</span>
      </td>
      <td data-label="Наименование" className="cell-wide cell-plain">
        {offer.name}
      </td>
      <td data-label="Склад" className="text-nowrap">
        {offer.warehouse ?? '—'}
      </td>
      <td data-label="Отгрузка" className="text-nowrap">
        {shipment ? (
          <>
            <span className="offers__date">{shipment.date}</span>
            <div className="offers__sub">заказ до {shipment.orderBefore}</div>
          </>
        ) : (
          '—'
        )}
      </td>
      <td data-label="Остаток" className="num">
        <span className={`stock ${inStock ? '' : 'is-empty'}`}>{inStock ? offer.stock : 'нет'}</span>
      </td>
      <td data-label="Цена" className="num">
        <span className="offers__price">{formatPrice(offer.price)}</span>
      </td>
    </tr>
  );
}
