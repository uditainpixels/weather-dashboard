import { useEffect, useState, useContext, useCallback } from 'react'
import axios from 'axios'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import SearchForm from './components/SearchForm'
import CurrentWeather from './components/CurrentWeather'
import Forecast from './components/Forecast'
import WeatherChart from './components/WeatherChart'
import Navbar from './components/Navbar'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import FavoritesList from './components/FavoritesList'
import { AuthContext } from './context/AuthContext'
import ToggleSwitch from './components/ToggleSwitch';
import { formatTemperature } from './utils/temperature';

function App() {
  const { isAuthenticated, user, token } = useContext(AuthContext);
  const [weatherData, setWeatherData] = useState({ current: null, forecast: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [geolocationError, setGeolocationError] = useState('');

  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('unit') || 'metric';
  });

  const fetchWeather = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/weather', {
        params: {
          city: city,
        },
      });

      setWeatherData({
        current: response.data.current,
        forecast: response.data.forecast || []
      });

      const newCity = response.data.current?.city || response.data.city;
      if (newCity) {
        setSearchHistory(prevHistory => {
          const updatedHistory = [
            newCity,
            ...prevHistory.filter(item => item.toLowerCase() !== newCity.toLowerCase())
          ].slice(0, 8);
          localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
          return updatedHistory;
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUnitToggle = useCallback(() => {
    setUnit(prevUnit => (prevUnit === 'metric' ? 'imperial' : 'metric'));
  }, []);

  const handleSetDefault = useCallback((city) => {
    localStorage.setItem('defaultCity', city);
    alert(`${city} has been set as your default city!`);
  }, []);

  const handleGeolocationClick = useCallback(() => {
    setError(null);
    setGeolocationError('');

    if (!navigator.geolocation) {
      setGeolocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await axios.get('/api/weather/coords', {
            params: {
              lat: latitude,
              lon: longitude,
            },
          });

          // FIX: Ensure consistent { current, forecast } structure
          setWeatherData({
            current: res.data.current,
            forecast: res.data.forecast || []
          });
          setError(null);
        } catch (err) {
          console.error('Failed to fetch weather by coordinates:', err);
          setError('Could not fetch weather data for your location. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        let message = '';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'You denied the request for Geolocation. Please enable it in your browser settings to use this feature.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable.';
            break;
          case err.TIMEOUT:
            message = 'The request to get your location timed out.';
            break;
          default:
            message = 'An unknown error occurred while getting your location.';
            break;
        }
        setGeolocationError(message);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.unitPreference) {
      setUnit(user.unitPreference);
    } else {
      setUnit(localStorage.getItem('unit') || 'metric');
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('unit', unit);

    if (isAuthenticated && token) {
      const updateUserPreferenceInDb = async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };
          await axios.put('/api/user/preferences', { unit }, config);
        } catch (error) {
          console.error('Failed to sync unit preference to DB:', error);
        }
      };

      updateUserPreferenceInDb();
    }
  }, [unit, isAuthenticated, token]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setSearchHistory(parsedHistory);
        } else {
          localStorage.removeItem('searchHistory');
        }
      } catch (err) {
        console.error('Failed to parse search history:', err);
        localStorage.removeItem('searchHistory');
      }
    }

    const defaultCity = localStorage.getItem('defaultCity');
    if (defaultCity) {
      fetchWeather(defaultCity);
    }
  }, [fetchWeather]);

  return (
    <div className='App'>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <header className="dashboard-header">
                  <div className="welcome-section">
                    {isAuthenticated ? (
                      <h1>Welcome back, {user?.name || 'User'}!</h1>
                    ) : (
                      <h1>Welcome to Weather Dashboard</h1>
                    )}
                    <p>Check the latest weather updates for your favorite cities.</p>
                  </div>
                  
                  <div className="header-main-controls">
                    <div className="search-section">
                      <div className="search-container">
                        <SearchForm onSearch={fetchWeather} />
                        <button className="btn-geolocation" onClick={handleGeolocationClick}>
                          Use My Location
                        </button>
                      </div>
                      {geolocationError && <p className="error-message">{geolocationError}</p>}
                    </div>

                    <div className="settings-section">
                      <ToggleSwitch unit={unit} onToggle={handleUnitToggle} />
                    </div>
                  </div>

                  {isAuthenticated && <FavoritesList onFavoriteClick={fetchWeather} />}
                  {searchHistory.length > 0 && (
                    <div className="search-history">
                      <h3>Recent Searches</h3>
                      <ul className="history-list">
                        {searchHistory.map(city => (
                          <li key={city} className="history-item" onClick={() => fetchWeather(city)}>
                            {city}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </header>
                <section className="dashboard-content">
                  {loading && <p className="loading-message">Loading...</p>}
                  {error && !loading && <p className="error-message">{error}</p>}
                  {weatherData.current && !loading && !error && (
                    <>
                      <CurrentWeather
                        weatherData={weatherData.current}
                        onSetDefault={handleSetDefault}
                        unit={unit}
                      />
                      {weatherData.forecast && weatherData.forecast.length > 0 && (
                        <>
                          <Forecast forecastData={weatherData.forecast} unit={unit} />
                          <WeatherChart
                            unit={unit}
                            data={(weatherData.forecast || []).filter(day => day && day.day).map(day => ({
                              name: day.day,
                              temperature: formatTemperature(day.tempHigh, unit),
                            }))}
                          />
                        </>
                      )}
                    </>
                  )}
                </section>
              </>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
