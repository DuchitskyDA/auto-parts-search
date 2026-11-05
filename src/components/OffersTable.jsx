import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers } from '../searchSlice';
import { formatPrice, formatShipment } from '../format';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

export default function OffersTable() {
  const dispatch = useDispatch();
  const { selected, offers } = useSelector((state) => state.search);

  if (!selected) return null;
  if (offers.status === 'loading') return <Loader text={`Ищем предложения и аналоги ${selected.brand}…`} />;
  if (offers.status === 'failed') {
    return <ErrorAlert message={offers.error} onRetry={() => dispatch(fetchOffers(selected))} />;
  }
  if (offers.items.length === 0) {
    return <div className="alert alert-warning">Предложений по {selected.brand} {selected.number} нет.</div>;
  }

  return (
    <>
      <h2 className="h6 text-secondary mb-2">
        {selected.brand} {selected.number}: предложения и аналоги ({offers.items.length})
      </h2>
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th>Производитель</th>
              <th>Наименование</th>
              <th>Склад</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
              <th>Отгрузка</th>
            </tr>
          </thead>
          <tbody>
            {offers.items.map((offer) => (
              <OfferRow key={offer.key} offer={offer} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OfferRow({ offer }) {
  const shipment = formatShipment(offer.shipmentDate);
  const inStock = offer.stock > 0;
  return (
    <tr className={inStock ? '' : 'text-secondary'}>
      <td>
        <strong>{offer.brand}</strong>
        <div className="small">{offer.number}</div>
        {offer.isRequested && <span className="badge text-bg-primary">Искомая</span>}
      </td>
      <td>{offer.name}</td>
      <td>{offer.warehouse ?? '—'}</td>
      <td className="text-end text-nowrap">{formatPrice(offer.price)}</td>
      <td className="text-end">{inStock ? offer.stock : 'нет в наличии'}</td>
      <td className="small text-nowrap">
        {shipment ? (
          <>
            {shipment.date}
            <div className="text-secondary">заказ до {shipment.orderBefore}</div>
          </>
        ) : (
          '—'
        )}
      </td>
    </tr>
  );
}
