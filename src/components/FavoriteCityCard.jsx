import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { convertTemperature } from '../utils/temperature';

function getWeatherDescription(mainCondition) {
  if (!mainCondition) {
    return 'Brak danych';
  }

  switch (mainCondition) {
    case 'Clear':
      return 'Słonecznie';
    case 'Clouds':
      return 'Pochmurno';
    case 'Rain':
      return 'Deszcz';
    case 'Snow':
      return 'Śnieg';
    case 'Thunderstorm':
      return 'Burza';
    case 'Drizzle':
      return 'Mżawka';
    case 'Mist':
    case 'Fog':
    case 'Haze':
    case 'Smoke':
    case 'Dust':
    case 'Sand':
    case 'Ash':
    case 'Squall':
    case 'Tornado':
      return 'Mglisto';
    default:
      return mainCondition;
  }
}

function FavoriteCityCard({ city, isActive, onSelectCity }) {
  const unit = useSelector((state) => state.temperature.unit);
  const [currentWeather, setCurrentWeather] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      setCurrentWeather(null);
      return;
    }

    let wasCancelled = false;

    const fetchWeather = async () => {
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            lat: city.lat,
            lon: city.lon,
            units: 'metric',
            appid: apiKey,
          },
        });

        if (wasCancelled) return;

        const data = response.data;
        const temperatureCelsius = data.main?.temp ?? null;
        const mainCondition = data.weather?.[0]?.main ?? null;
        const iconCode = data.weather?.[0]?.icon ?? null;

        setCurrentWeather({
          temperatureCelsius,
          conditionLabel: getWeatherDescription(mainCondition),
          iconCode,
        });
      } catch (error) {
        if (!wasCancelled) {
          console.error('Błąd pobierania danych ulubionego miasta:', error);
          setCurrentWeather(null);
        }
      }
    };

    fetchWeather();

    return () => {
      wasCancelled = true;
    };
  }, [city]);

  const temperature =
    currentWeather && currentWeather.temperatureCelsius !== null
      ? `${convertTemperature(currentWeather.temperatureCelsius, unit)}°${unit}`
      : '—';

  const conditionLabel = currentWeather ? currentWeather.conditionLabel : 'Ładowanie...';

  return (
    <li className="favorites-slider-item">
      <button
        type="button"
        className={`favorites-slider-card ${
          isActive ? 'favorites-slider-card--active' : ''
        }`}
        onClick={() => onSelectCity(city.id)}
      >
        <div className="favorites-slider-card-header">
          <span className="favorites-slider-city-name">{city.name}</span>
          <span className="favorites-slider-temp">{temperature}</span>
        </div>
        <div className="favorites-slider-card-footer">
          {currentWeather && currentWeather.iconCode && (
            <img
              src={`https://openweathermap.org/img/wn/${currentWeather.iconCode}.png`}
              alt={conditionLabel}
              className="favorites-slider-icon-image"
            />
          )}
          <span className="favorites-slider-condition-text">{conditionLabel}</span>
        </div>
      </button>
    </li>
  );
}

export default FavoriteCityCard;
