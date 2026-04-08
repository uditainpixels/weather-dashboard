import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function WeatherChart({ data, unit }) {
  if (!data || data.length === 0) {
    return <p className="no-data">No forecast data available for the chart.</p>;
  }

  const unitSymbol = unit === 'imperial' ? '°F' : '°C';

  return (
    <div className="weather-chart-container" style={{ width: '100%', height: 300, margin: '20px 0' }}>
      <h2>5-Day Temperature Trend ({unitSymbol})</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="name" 
            stroke="#8884d8"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#8884d8"
            tick={{ fontSize: 12 }}
            unit={unitSymbol}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(5px)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px', color: '#374151' }} />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#ff7300"
            strokeWidth={3}
            dot={{ r: 6, fill: '#ff7300', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeatherChart;
