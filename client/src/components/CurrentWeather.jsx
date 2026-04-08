import React, { useContext, useState } from "react";
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { formatTemperature } from '../utils/temperature';
import { getWeatherIcon } from '../utils/weatherIconMap';

function CurrentWeather({ weatherData, onSetDefault, unit }) {
  const { isAuthenticated, token } = useContext(AuthContext);

  const [favoriteStatus, setFavoriteStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });

  const { city, country, temperature, description, icon, humidity, windSpeed, feelsLike, condition } = weatherData;
  const unitSymbol = unit === 'imperial' ? '°F' : '°C';
  const windUnit = unit === 'imperial' ? 'mph' : 'm/s';

  const displayTemp = formatTemperature(temperature, unit);
  const displayFeelsLike = formatTemperature(feelsLike, unit);

  const handleAddFavorite = async () => {
    setFavoriteStatus({ loading: true, error: null, success: null });

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      await axios.post('/api/favorites', { city }, config);

      setFavoriteStatus({ loading: false, success: 'Added to favorites!', error: null });
      setTimeout(() => setFavoriteStatus(prev => ({ ...prev, success: null })), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not add to favorites.';
      setFavoriteStatus({ loading: false, error: message, success: null });
    }
  };

  return (
    <div className="current-weather">
      <h2 className="city-name">{city}, {country}</h2>
      <div className="weather-main">
        <div className="weather-icon-large">
          {getWeatherIcon(condition, icon)}
        </div>
        <p className="temperature">{displayTemp}{unitSymbol}</p>
      </div>
      <p className="weather-description">{description}</p>
      <div className="weather-details">
        <div>
          <span className="weather-details-label">Feels like</span>
          <span className="weather-details-value">{displayFeelsLike}{unitSymbol}</span>
        </div>
        <div>
          <span className="weather-details-label">Humidity</span>
          <span className="weather-details-value">{humidity}%</span>
        </div>
        <div>
          <span className="weather-details-label">Wind</span>
          <span className="weather-details-value">{windSpeed} {windUnit}</span>
        </div>
      </div>

      <div className="weather-actions">
        {isAuthenticated && (
          <div className="favorites-actions">
            <button
              onClick={handleAddFavorite}
              className="btn-favorite"
              disabled={favoriteStatus.loading}
            >
              {favoriteStatus.loading ? 'Adding...' : 'Add to Favorites'}
            </button>

            {favoriteStatus.success && <p className="success-message-local">{favoriteStatus.success}</p>}
            {favoriteStatus.error && <p className="error-message-local">{favoriteStatus.error}</p>}
          </div>
        )}

        <button
          onClick={() => onSetDefault(city)}
          className="btn-set-default"
        >
          Set as Default
        </button>
      </div>
    </div>
  );
}

export default CurrentWeather;

