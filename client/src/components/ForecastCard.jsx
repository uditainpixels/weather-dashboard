import React from 'react';
import { formatTemperature } from '../utils/temperature';
import { getWeatherIcon } from '../utils/weatherIconMap';

const dummyForecastData = {
  day: "Tue",
  icon: "10d",
  tempHigh: 19,
  tempLow: 12,
  condition: "Clouds"
};

function ForecastCard({ dayData = dummyForecastData, unit }) {
  const { day, icon, tempHigh, tempLow, condition } = dayData;
  const unitSymbol = unit === 'imperial' ? '°F' : '°C';

  const displayHigh = formatTemperature(tempHigh, unit);
  const displayLow = formatTemperature(tempLow, unit);

  return (
    <div className="forecast-card">
      <h3 className="forecast-day">{day}</h3>
      <div className="weather-icon-small">
        {getWeatherIcon(condition, icon)}
      </div>
      <div className="forecast-temps">
        <span className="temp-high">{displayHigh}{unitSymbol}</span>
        <span className="temp-low">{displayLow}{unitSymbol}</span>
      </div>
    </div>
  );
}

export default ForecastCard;