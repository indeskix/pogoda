import { useRef, useEffect } from 'react';
import FavoriteCityCard from './FavoriteCityCard';

function FavoriteCitiesSlider({ favoriteCities, selectedCityId, onSelectCity }) {
  const listWrapperRef = useRef(null);

  if (!favoriteCities || favoriteCities.length === 0) {
    return null;
  }

  const handleScroll = (direction) => {
    const wrapperElement = listWrapperRef.current;
    if (!wrapperElement) {
      return;
    }

    const scrollAmount = 260;
    if (direction === 'left') {
      wrapperElement.scrollLeft -= scrollAmount;
      if (wrapperElement.scrollLeft < 0) {
        wrapperElement.scrollLeft = 0;
      }
    } else {
      wrapperElement.scrollLeft += scrollAmount;
      const maxScrollLeft = wrapperElement.scrollWidth - wrapperElement.clientWidth;
      if (wrapperElement.scrollLeft > maxScrollLeft) {
        wrapperElement.scrollLeft = maxScrollLeft;
      }
    }
  };

  useEffect(() => {
    const wrapperElement = listWrapperRef.current;
    if (!wrapperElement) {
      return;
    }

    const interval = setInterval(() => {
      if (!wrapperElement) {
        return;
      }

      if (wrapperElement.scrollWidth <= wrapperElement.clientWidth) {
        return;
      }

      wrapperElement.scrollLeft += 1;

      const maxScrollLeft = wrapperElement.scrollWidth - wrapperElement.clientWidth;
      if (wrapperElement.scrollLeft >= maxScrollLeft - 1) {
        wrapperElement.scrollLeft = 0;
      }
    }, 40);

    return () => clearInterval(interval);
  }, [favoriteCities.length]);

  return (
    <section className="favorites-slider favorites-slider--lower">
      <div className="favorites-slider-header">
        <h3 className="favorites-slider-title">Ulubione miasta</h3>
        <div className="favorites-slider-arrows">
          <button
            type="button"
            className="favorites-slider-arrow"
            onClick={() => handleScroll('left')}
          >
            ‹
          </button>
          <button
            type="button"
            className="favorites-slider-arrow"
            onClick={() => handleScroll('right')}
          >
            ›
          </button>
        </div>
      </div>

      <div className="favorites-slider-list-wrapper" ref={listWrapperRef}>
        <div className="favorites-slider-list">
          {favoriteCities.map((city) => (
            <div key={city.id} className="favorites-slider-item">
              <FavoriteCityCard
                city={city}
                isActive={city.id === selectedCityId}
                onSelectCity={onSelectCity}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FavoriteCitiesSlider;
