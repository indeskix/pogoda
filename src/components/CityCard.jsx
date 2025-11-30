function CityCard({ city, onSelect, isSelected, isFavorite, onToggleFavorite }) {
  return (
    <li className={`city-card ${isSelected ? 'city-card--selected' : ''}`}>
      <button
        className="city-card-button"
        onClick={() => onSelect(city.id)}
      >
        <div className="city-card-header">
          <h3 className="city-card-name">{city.name}</h3>
          {onToggleFavorite && (
            <button
              type="button"
              className={`fav-button ${isFavorite ? 'fav-button--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          )}
        </div>
      </button>
    </li>
  );
}

export default CityCard;
