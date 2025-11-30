import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { convertTemperature } from '../utils/temperature';

function getWindDirection(windDegrees) {
  if (windDegrees === null || windDegrees === undefined) return null;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const roundedIndex = Math.round(windDegrees / 45) % 8;
  return directions[roundedIndex];
}

function getDayLabel(dateString) {
  const date = new Date(dateString);
  const dayIndex = date.getDay();
  const dayLabels = ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
  return dayLabels[dayIndex];
}

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

function getWeatherEmoji(mainCondition) {
  switch (mainCondition) {
    case 'Clear':
      return '☀️';
    case 'Clouds':
      return '☁️';
    case 'Rain':
      return '🌧️';
    case 'Snow':
      return '❄️';
    case 'Thunderstorm':
      return '⛈️';
    case 'Drizzle':
      return '🌦️';
    case 'Mist':
    case 'Fog':
    case 'Haze':
      return '🌫️';
    default:
      return '🌡️';
  }
}

function CityDetails({ city }) {
  const unit = useSelector((state) => state.temperature.unit);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastDays, setForecastDays] = useState([]);
  const [todayPrecipitation, setTodayPrecipitation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      setErrorMessage('Brak klucza API.');
      setCurrentWeather(null);
      setForecastDays([]);
      setTodayPrecipitation(null);
      return;
    }

    let wasCancelled = false;

    const fetchWeatherData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setCurrentWeather(null);
      setForecastDays([]);
      setTodayPrecipitation(null);

      try {
        const [weatherResponse, forecastResponse] = await Promise.all([
          axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
              lat: city.lat,
              lon: city.lon,
              units: 'metric',
              appid: apiKey,
            },
          }),
          axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
              lat: city.lat,
              lon: city.lon,
              units: 'metric',
              appid: apiKey,
            },
          }),
        ]);

        if (wasCancelled) return;

        const weatherData = weatherResponse.data;
        const forecastData = forecastResponse.data;

        const currentWeatherData = {
          temperatureCelsius: weatherData.main?.temp ?? null,
          mainCondition: weatherData.weather?.[0]?.main ?? null,
          iconCode: weatherData.weather?.[0]?.icon ?? null,
          windSpeedKilometersPerHour:
            weatherData.wind?.speed !== undefined && weatherData.wind?.speed !== null
              ? weatherData.wind.speed * 3.6
              : null,
          windDegrees: weatherData.wind?.deg ?? null,
          cloudinessPercent: weatherData.clouds?.all ?? null,
          humidityPercent: weatherData.main?.humidity ?? null,
          pressureHpa: weatherData.main?.pressure ?? null,
        };

        const forecastGroupsByDate = {};

        forecastData.list.forEach((forecastItem) => {
          const forecastDate = new Date(forecastItem.dt * 1000);
          const dateKey = forecastDate.toISOString().slice(0, 10);

          const minTemperatureCelsius = forecastItem.main?.temp_min ?? null;
          const maxTemperatureCelsius = forecastItem.main?.temp_max ?? null;
          const rainAmountInThreeHours = forecastItem.rain?.['3h'] ?? null;
          const snowAmountInThreeHours = forecastItem.snow?.['3h'] ?? null;
          const precipitationProbability = forecastItem.pop ?? null;
          const precipitationAmount = (rainAmountInThreeHours ?? 0) + (snowAmountInThreeHours ?? 0);
          const mainCondition = forecastItem.weather?.[0]?.main ?? 'Clear';
          const iconCode = forecastItem.weather?.[0]?.icon ?? null;

          if (!forecastGroupsByDate[dateKey]) {
            forecastGroupsByDate[dateKey] = {
              dateKey,
              minTemperatureCelsius,
              maxTemperatureCelsius,
              maxPrecipitationProbability: precipitationProbability,
              totalPrecipitationMillimeters: precipitationAmount,
              hasRain: rainAmountInThreeHours > 0,
              hasSnow: snowAmountInThreeHours > 0,
              conditionCounts: {},
              iconCode,
            };
          } else {
            const dateGroup = forecastGroupsByDate[dateKey];

            if (minTemperatureCelsius !== null) {
              const isMinNotSet = dateGroup.minTemperatureCelsius === null;
              dateGroup.minTemperatureCelsius = isMinNotSet
                ? minTemperatureCelsius
                : Math.min(dateGroup.minTemperatureCelsius, minTemperatureCelsius);
            }

            if (maxTemperatureCelsius !== null) {
              const isMaxNotSet = dateGroup.maxTemperatureCelsius === null;
              dateGroup.maxTemperatureCelsius = isMaxNotSet
                ? maxTemperatureCelsius
                : Math.max(dateGroup.maxTemperatureCelsius, maxTemperatureCelsius);
            }

            if (precipitationProbability !== null) {
              dateGroup.maxPrecipitationProbability = Math.max(
                dateGroup.maxPrecipitationProbability,
                precipitationProbability,
              );
            }

            dateGroup.totalPrecipitationMillimeters += precipitationAmount;
            dateGroup.hasRain = dateGroup.hasRain || rainAmountInThreeHours > 0;
            dateGroup.hasSnow = dateGroup.hasSnow || snowAmountInThreeHours > 0;
          }

          const dateGroupForConditions = forecastGroupsByDate[dateKey];
          dateGroupForConditions.conditionCounts[mainCondition] =
            (dateGroupForConditions.conditionCounts[mainCondition] || 0) + 1;

          if (!dateGroupForConditions.iconCode && iconCode) {
            dateGroupForConditions.iconCode = iconCode;
          }
        });

        const sortedDateKeys = Object.keys(forecastGroupsByDate).sort();

        const days = sortedDateKeys.slice(0, 5).map((dateKey) => {
          const dateGroup = forecastGroupsByDate[dateKey];

          const sortedConditions = Object.entries(dateGroup.conditionCounts).sort(
            (firstEntry, secondEntry) => secondEntry[1] - firstEntry[1],
          );

          const mostFrequentCondition = sortedConditions[0]?.[0] || 'Clear';

          let precipitationTypeLabel = 'brak opadów';
          if (dateGroup.hasRain && dateGroup.hasSnow) {
            precipitationTypeLabel = 'deszcz i śnieg';
          } else if (dateGroup.hasSnow) {
            precipitationTypeLabel = 'śnieg';
          } else if (dateGroup.hasRain) {
            precipitationTypeLabel = 'deszcz';
          }

          return {
            dateKey: dateGroup.dateKey,
            dayLabel: getDayLabel(dateGroup.dateKey),
            minTemperatureCelsius: dateGroup.minTemperatureCelsius,
            maxTemperatureCelsius: dateGroup.maxTemperatureCelsius,
            precipitationProbabilityPercent: Math.round(
              dateGroup.maxPrecipitationProbability * 100,
            ),
            precipitationAmountMillimeters:
              Math.round(dateGroup.totalPrecipitationMillimeters * 10) / 10,
            precipitationTypeLabel,
            mainCondition: mostFrequentCondition,
            mainConditionLabel: getWeatherDescription(mostFrequentCondition),
            mainConditionEmoji: getWeatherEmoji(mostFrequentCondition),
            iconCode: dateGroup.iconCode,
          };
        });

        const todayGroup = days[0] || null;

        setCurrentWeather(currentWeatherData);
        setForecastDays(days);
        setTodayPrecipitation(todayGroup);
      } catch (error) {
        if (!wasCancelled) {
          console.error('Błąd pobierania danych pogodowych:', error);
          setErrorMessage('Nie udało się pobrać danych pogodowych.');
        }
      } finally {
        if (!wasCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchWeatherData();

    return () => {
      wasCancelled = true;
    };
  }, [city]);

  if (isLoading) {
    return (
      <div className="city-details">
        <p>Ładowanie danych...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="city-details">
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className="city-details">
        <p>Brak danych pogodowych.</p>
      </div>
    );
  }

  const currentTemperature =
    currentWeather.temperatureCelsius !== null
      ? convertTemperature(currentWeather.temperatureCelsius, unit)
      : null;
  const windDirection = getWindDirection(currentWeather.windDegrees);
  const currentConditionLabel = getWeatherDescription(currentWeather.mainCondition);

  return (
    <div className="city-details">
      <h2 className="city-details-name">{city.name}</h2>

      <div className="city-details-current">
        <div className="city-details-temp">
          {currentTemperature !== null ? (
            <>
              {currentTemperature}°{unit}
            </>
          ) : (
            'brak danych'
          )}
        </div>
        <div className="city-details-icon">
          {currentWeather.iconCode && (
            <img
              src={`https://openweathermap.org/img/wn/${currentWeather.iconCode}@2x.png`}
              alt={`Pogoda: ${currentConditionLabel}`}
              className="city-details-main-condition-icon"
            />
          )}
          <span className="city-details-main-condition-label">{currentConditionLabel}</span>
        </div>
      </div>

      <div className="city-details-grid">
        <section className="city-details-section">
          <div className="city-details-section-header">
            <span className="city-details-section-icon" aria-hidden="true">
              🌬️
            </span>
            <h3>Wiatr</h3>
          </div>
          <p>
            {currentWeather.windSpeedKilometersPerHour !== null
              ? `${Math.round(currentWeather.windSpeedKilometersPerHour * 10) / 10} km/h`
              : 'brak danych'}
          </p>
          <p>{windDirection ? `Kierunek: ${windDirection}` : 'kierunek: brak danych'}</p>
        </section>

        <section className="city-details-section">
          <div className="city-details-section-header">
            <span className="city-details-section-icon" aria-hidden="true">
              ☁️
            </span>
            <h3>Zachmurzenie</h3>
          </div>
          <p>
            {currentWeather.cloudinessPercent !== null
              ? `${currentWeather.cloudinessPercent}%`
              : 'brak danych'}
          </p>
        </section>

        <section className="city-details-section">
          <div className="city-details-section-header">
            <span className="city-details-section-icon" aria-hidden="true">
              💧
            </span>
            <h3>Wilgotność</h3>
          </div>
          <p>
            {currentWeather.humidityPercent !== null
              ? `${currentWeather.humidityPercent}%`
              : 'brak danych'}
          </p>
        </section>

        <section className="city-details-section">
          <div className="city-details-section-header">
            <span className="city-details-section-icon" aria-hidden="true">
              🌡️
            </span>
            <h3>Ciśnienie</h3>
          </div>
          <p>
            {currentWeather.pressureHpa !== null
              ? `${currentWeather.pressureHpa} hPa`
              : 'brak danych'}
          </p>
        </section>

        <section className="city-details-section">
          <div className="city-details-section-header">
            <span className="city-details-section-icon" aria-hidden="true">
              ☔
            </span>
            <h3>Opady (dziś)</h3>
          </div>
          {todayPrecipitation ? (
            <>
              <p>
                Prawdopodobieństwo:{' '}
                {todayPrecipitation.precipitationProbabilityPercent === 0
                  ? '0% (brak opadów)'
                  : `${todayPrecipitation.precipitationProbabilityPercent}%`}
              </p>
              <p>
                Rodzaj:{' '}
                {todayPrecipitation.precipitationProbabilityPercent === 0
                  ? 'brak opadów'
                  : todayPrecipitation.precipitationTypeLabel}
              </p>
              <p>
                Ilość:{' '}
                {todayPrecipitation.precipitationAmountMillimeters === 0
                  ? '0 mm (brak opadów)'
                  : `${todayPrecipitation.precipitationAmountMillimeters} mm`}
              </p>
            </>
          ) : (
            <p>Brak danych o opadach.</p>
          )}
        </section>
      </div>

      <section className="city-details-forecast">
        <h3>Prognoza na 5 dni</h3>
        {forecastDays.length === 0 ? (
          <p>Brak danych prognozy.</p>
        ) : (
          <ul className="forecast-list">
            {forecastDays.map((forecastDay) => {
              const minTemperature =
                forecastDay.minTemperatureCelsius !== null
                  ? convertTemperature(forecastDay.minTemperatureCelsius, unit)
                  : null;
              const maxTemperature =
                forecastDay.maxTemperatureCelsius !== null
                  ? convertTemperature(forecastDay.maxTemperatureCelsius, unit)
                  : null;

              return (
                <li key={forecastDay.dateKey} className="forecast-item">
                  <div className="forecast-day">{forecastDay.dayLabel}</div>

                  <div className="forecast-icon">
                    {forecastDay.iconCode && (
                      <img
                        src={`https://openweathermap.org/img/wn/${forecastDay.iconCode}.png`}
                        alt={forecastDay.mainConditionLabel}
                        className="forecast-icon-image"
                      />
                    )}
                    <span className="forecast-icon-text">
                      {forecastDay.mainConditionLabel}
                    </span>
                  </div>

                  <div className="forecast-temps">
                    {minTemperature !== null && maxTemperature !== null
                      ? `${minTemperature}°${unit} – ${maxTemperature}°${unit}`
                      : 'brak danych'}
                  </div>

                  <div className="forecast-precip">
                    {forecastDay.precipitationProbabilityPercent === 0
                      ? 'brak opadów'
                      : `${forecastDay.precipitationProbabilityPercent}% opadów, ${forecastDay.precipitationAmountMillimeters} mm`}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default CityDetails;
