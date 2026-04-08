import React from 'react';

function ToggleSwitch({ unit, onToggle }) {
  return (
    <div className="toggle-switch-container">
      <span>Metric</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={unit === 'imperial'}
          onChange={onToggle}
        />
        <span className="slider"></span>
      </label>
      <span>Imperial</span>
    </div>
  );
}

export default ToggleSwitch;
