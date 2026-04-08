import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import favoritesRoutes from './routes/favorites.js';
import userRoutes from './routes/user.js';
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Weather Dashboard API' });
});

app.get('/', (req, res) => {
  res.send('Weather Dashboard API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user', userRoutes);

app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: 'City name is required.' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    const [weatherResponse, forecastResponse] = await Promise.all([
      axios.get(weatherUrl),
      axios.get(forecastUrl),
    ]);

    const rawWeatherData = weatherResponse.data;
    const rawForecastData = forecastResponse.data;

    const processedWeatherData = {
      city: rawWeatherData.name,
      country: rawWeatherData.sys.country,
      temperature: rawWeatherData.main.temp,
      feelsLike: rawWeatherData.main.feels_like,
      humidity: rawWeatherData.main.humidity,
      windSpeed: rawWeatherData.wind.speed,
      condition: rawWeatherData.weather[0].main,
      description: rawWeatherData.weather[0].description,
      icon: rawWeatherData.weather[0].icon,
    };

    const processedForecastData = (rawForecastData.list || [])
      .filter((item, index) => index % 8 === 0)
      .map((item) => ({
        day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        icon: item.weather[0].icon,
        condition: item.weather[0].main,
        tempHigh: item.main.temp_max,
        tempLow: item.main.temp_min,
        description: item.weather[0].description,
      }));

    res.json({
      current: processedWeatherData,
      forecast: processedForecastData,
    });
  } catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found.' });
    }
    res.status(500).json({ message: 'Failed to fetch weather data.' });
  }
});

app.get('/api/weather/coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Coordinates (lat, lon) are required.' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    const [weatherResponse, forecastResponse] = await Promise.all([
      axios.get(weatherUrl),
      axios.get(forecastUrl),
    ]);

    const rawWeatherData = weatherResponse.data;
    const rawForecastData = forecastResponse.data;

    const processedWeatherData = {
      city: rawWeatherData.name,
      country: rawWeatherData.sys.country,
      temperature: rawWeatherData.main.temp,
      feelsLike: rawWeatherData.main.feels_like,
      humidity: rawWeatherData.main.humidity,
      windSpeed: rawWeatherData.wind.speed,
      condition: rawWeatherData.weather[0].main,
      description: rawWeatherData.weather[0].description,
      icon: rawWeatherData.weather[0].icon,
    };

    const processedForecastData = (rawForecastData.list || [])
      .filter((item, index) => index % 8 === 0)
      .map((item) => ({
        day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        icon: item.weather[0].icon,
        condition: item.weather[0].main,
        tempHigh: item.main.temp_max,
        tempLow: item.main.temp_min,
        description: item.weather[0].description,
      }));

    res.json({
      current: processedWeatherData,
      forecast: processedForecastData,
    });
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch weather for your location.' });
  }
});

// Production Serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
