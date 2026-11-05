import SearchForm from './components/SearchForm';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';

export default function App() {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Поиск автозапчастей</h1>
      <SearchForm />
      <div className="row g-4 mt-1">
        <div className="col-lg-4">
          <BrandList />
        </div>
        <div className="col-lg-8">
          <OffersTable />
        </div>
      </div>
    </div>
  );
}
