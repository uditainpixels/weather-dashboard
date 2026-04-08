import React from 'react';
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloud,
  WiCloudy,
  WiRain,
  WiShowers,
  WiThunderstorm,
  WiSnow,
  WiFog,
} from 'react-icons/wi';

export const getWeatherIcon = (condition, iconCode) => {
  const isNight = iconCode.endsWith('n');

  switch (condition) {
    case 'Clear':
      return isNight ? <WiNightClear /> : <WiDaySunny />;
    case 'Clouds':
      if (iconCode === '02d' || iconCode === '02n') {
        return isNight ? <WiNightAltCloudy /> : <WiDayCloudy />;
      }
      return <WiCloudy />;
    case 'Rain':
      return <WiRain />;
    case 'Drizzle':
      return <WiShowers />;
    case 'Thunderstorm':
      return <WiThunderstorm />;
    case 'Snow':
      return <WiSnow />;
    case 'Mist':
    case 'Smoke':
    case 'Haze':
    case 'Dust':
    case 'Fog':
    case 'Sand':
    case 'Ash':
    case 'Squall':
    case 'Tornado':
      return <WiFog />;
    default:
      return <WiCloud />;
  }
};

