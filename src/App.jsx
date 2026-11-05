import SearchForm from './components/SearchForm';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';

export default function App() {
  return (
    <>
      <header className="app-bar">
        <div className="container-xl d-flex flex-wrap align-items-baseline justify-content-between gap-2 py-3">
          <h1 className="app-bar__title m-0">Поиск автозапчастей</h1>
          <span className="app-bar__note">Артикул → производитель → предложения и аналоги</span>
        </div>
      </header>
      <main className="container-xl py-4">
        <SearchForm />
        <div className="row g-4 mt-0">
          <div className="col-md-4 col-xl-3">
            <BrandList />
          </div>
          <div className="col-md-8 col-xl-9">
            <OffersTable />
          </div>
        </div>
      </main>
    </>
  );
}
