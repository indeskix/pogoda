import { useState, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import cities from './data/cities';
import CityList from './components/CityList';
import CityDetails from './components/CityDetails';
import FavoriteCitiesSlider from './components/FavoriteCitiesSlider';
import { setUnit, toggleFavorite } from './store';
import './App.css';

function HomePage() {
  const [selectedCityId, setSelectedCityId] = useState(cities[0].id);
  const [search, setSearch] = useState('');
  const favoriteIds = useSelector((state) => state.favorites.ids);
  const dispatch = useDispatch();

  const handleSelectCity = useCallback((cityId) => {
    setSelectedCityId(cityId);
  }, []);

  const handleToggleFavorite = useCallback(
    (cityId) => {
      dispatch(toggleFavorite(cityId));
    },
    [dispatch],
  );

  const filteredCities = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) {
      return cities;
    }
    return cities.filter((city) => city.name.toLowerCase().includes(searchTerm));
  }, [search]);

  const filteredPolishCities = useMemo(
    () => filteredCities.filter((city) => city.isPolishCity),
    [filteredCities],
  );

  const filteredForeignCities = useMemo(
    () => filteredCities.filter((city) => !city.isPolishCity),
    [filteredCities],
  );

  const selectedCity = useMemo(() => {
    return (
      filteredCities.find((city) => city.id === selectedCityId) ||
      filteredCities[0] ||
      null
    );
  }, [filteredCities, selectedCityId]);

  const favoriteCities = useMemo(
    () => cities.filter((city) => favoriteIds.includes(city.id)),
    [favoriteIds],
  );

  useEffect(() => {
    if (!selectedCity && filteredCities.length > 0) {
      setSelectedCityId(filteredCities[0].id);
    }
  }, [filteredCities, selectedCity]);

  return (
    <main className="app-main">
      <section className="app-sidebar">
        <h2 className="section-title">Miasta</h2>
        <input
          className="search-input"
          type="text"
          placeholder="Szukaj miasta..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {filteredPolishCities.length > 0 && (
          <>
            <h3 className="city-group-title">Miasta w Polsce</h3>
            <CityList
              cities={filteredPolishCities}
              onSelectCity={handleSelectCity}
              selectedCityId={selectedCityId}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}

        {filteredForeignCities.length > 0 && (
          <>
            <h3 className="city-group-title">Miasta na świecie</h3>
            <CityList
              cities={filteredForeignCities}
              onSelectCity={handleSelectCity}
              selectedCityId={selectedCityId}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}
      </section>

      <section className="app-details">
        {selectedCity ? (
          <>
            <CityDetails city={selectedCity} />
            {favoriteCities.length > 0 && (
              <FavoriteCitiesSlider
                favoriteCities={favoriteCities}
                selectedCityId={selectedCityId}
                onSelectCity={handleSelectCity}
              />
            )}
          </>
        ) : (
          <p>Brak miast do wyświetlenia.</p>
        )}
      </section>
    </main>
  );
}

function FavoritesPage() {
  const favoriteIds = useSelector((state) => state.favorites.ids);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const dispatch = useDispatch();

  const favoriteCities = useMemo(
    () => cities.filter((city) => favoriteIds.includes(city.id)),
    [favoriteIds],
  );

  const favoritePolishCities = useMemo(
    () => favoriteCities.filter((city) => city.isPolishCity),
    [favoriteCities],
  );

  const favoriteForeignCities = useMemo(
    () => favoriteCities.filter((city) => !city.isPolishCity),
    [favoriteCities],
  );

  useEffect(() => {
    if (favoriteCities.length > 0 && !selectedCityId) {
      setSelectedCityId(favoriteCities[0].id);
    }
  }, [favoriteCities, selectedCityId]);

  const selectedCity = useMemo(() => {
    return favoriteCities.find((city) => city.id === selectedCityId) || null;
  }, [favoriteCities, selectedCityId]);

  const handleSelectCity = useCallback((cityId) => {
    setSelectedCityId(cityId);
  }, []);

  const handleToggleFavorite = useCallback(
    (cityId) => {
      dispatch(toggleFavorite(cityId));
    },
    [dispatch],
  );

  return (
    <main className="app-main">
      <section className="app-sidebar">
        <h2 className="section-title">Ulubione miasta</h2>

        {favoriteCities.length === 0 && (
          <p>Brak ulubionych miast. Dodaj je na stronie głównej.</p>
        )}

        {favoritePolishCities.length > 0 && (
          <>
            <h3 className="city-group-title">Miasta w Polsce</h3>
            <CityList
              cities={favoritePolishCities}
              onSelectCity={handleSelectCity}
              selectedCityId={selectedCityId}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}

        {favoriteForeignCities.length > 0 && (
          <>
            <h3 className="city-group-title">Miasta na świecie</h3>
            <CityList
              cities={favoriteForeignCities}
              onSelectCity={handleSelectCity}
              selectedCityId={selectedCityId}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}
      </section>

      <section className="app-details">
        {selectedCity ? (
          <CityDetails city={selectedCity} />
        ) : favoriteCities.length > 0 ? (
          <p>Wybierz miasto z listy ulubionych.</p>
        ) : (
          <p>Brak ulubionych miast.</p>
        )}
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="app-main">
      <section className="app-details">
        <h2>O aplikacji</h2>
        <p>Prosta aplikacja pogodowa stworzona na projekt zaliczeniowy.</p>
      </section>
    </main>
  );
}

function App() {
  const unit = useSelector((state) => state.temperature.unit);
  const dispatch = useDispatch();

  const handleChangeUnit = (newUnit) => {
    dispatch(setUnit(newUnit));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <h1 className="app-title">POGODA</h1>
          <nav className="app-nav">
            <Link className="app-nav-link" to="/">
              Strona główna
            </Link>
            <Link className="app-nav-link" to="/favorites">
              Ulubione
            </Link>
            <Link className="app-nav-link" to="/about">
              O aplikacji
            </Link>
          </nav>
        </div>
        <div className="unit-switcher">
          <button
            className={`unit-button ${unit === 'C' ? 'unit-button--active' : ''}`}
            onClick={() => handleChangeUnit('C')}
          >
            °C
          </button>
          <button
            className={`unit-button ${unit === 'F' ? 'unit-button--active' : ''}`}
            onClick={() => handleChangeUnit('F')}
          >
            °F
          </button>
          <button
            className={`unit-button ${unit === 'K' ? 'unit-button--active' : ''}`}
            onClick={() => handleChangeUnit('K')}
          >
            K
          </button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

export default App;
