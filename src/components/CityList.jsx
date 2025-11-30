import CityCard from './CityCard';

function CityList({
  cities,
  onSelectCity,
  selectedCityId,
  favoriteIds = [],
  onToggleFavorite,
}) {
  return (
    <ul className="city-list">
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          onSelect={onSelectCity}
          isSelected={city.id === selectedCityId}
          isFavorite={favoriteIds.includes(city.id)}
          onToggleFavorite={
            onToggleFavorite ? () => onToggleFavorite(city.id) : undefined
          }
        />
      ))}
    </ul>
  );
}

export default CityList;
