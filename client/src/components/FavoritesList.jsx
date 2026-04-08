import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function FavoritesList({ onFavoriteClick }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const res = await axios.get('/api/favorites', config);

        setFavorites(res.data.favoriteCities);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setError('Could not load your favorites.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  if (loading) {
    return <div className="favorites-list-container">Loading favorites...</div>;
  }

  if (error) {
    return <div className="favorites-list-container error-message">{error}</div>;
  }

  return (
    <div className="favorites-list-container">
      <h4>My Favorite Cities</h4>
      {favorites.length === 0 ? (
        <p className="no-favorites">You haven't added any favorites yet.</p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((city) => (
            <li
              key={city}
              className="favorite-item-clickable"
              onClick={() => onFavoriteClick && onFavoriteClick(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FavoritesList;

