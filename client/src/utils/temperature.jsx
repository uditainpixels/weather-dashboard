export const convertToFahrenheit = (celsius) => {
  if (typeof celsius !== 'number') return NaN;
  return (celsius * 9) / 5 + 32;
};

export const formatTemperature = (celsiusTemp, unit) => {
  const temp = unit === 'imperial' ? convertToFahrenheit(celsiusTemp) : celsiusTemp;
  return Math.round(temp);
};

