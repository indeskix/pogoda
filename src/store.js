import { configureStore, createSlice } from '@reduxjs/toolkit';

const persisted = (() => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem('weather-settings');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const temperatureSlice = createSlice({
  name: 'temperature',
  initialState: { unit: persisted?.unit || 'C' },
  reducers: {
    setUnit(state, action) {
      state.unit = action.payload;
    },
  },
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { ids: persisted?.favorites || [] },
  reducers: {
    toggleFavorite(state, action) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((x) => x !== id);
      } else {
        state.ids.push(id);
      }
    },
  },
});

export const { setUnit } = temperatureSlice.actions;
export const { toggleFavorite } = favoritesSlice.actions;

const store = configureStore({
  reducer: {
    temperature: temperatureSlice.reducer,
    favorites: favoritesSlice.reducer,
  },
});

if (typeof localStorage !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState();
    const data = {
      unit: state.temperature.unit,
      favorites: state.favorites.ids,
    };
    localStorage.setItem('weather-settings', JSON.stringify(data));
  });
}

export default store;
