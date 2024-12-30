import { useContext, useState, useEffect, useCallback } from 'react';
import WeatherContext from '../context/weather.context';
import Place from './Place';
import Search from './Search'; // Import the Search component
import Settings from './Settings';
import '../styles/components/Header.scss';

function Header() {
  const { fetchWeatherByCoordinates } = useContext(WeatherContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);  // Track if location is granted
  const [locationDenied, setLocationDenied] = useState(false);    // Track if location was denied

  const handleGetLocation = useCallback(() => {
    if (navigator.geolocation && !locationGranted && !locationDenied) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLocationGranted(true);  // Mark location as granted
          fetchWeatherByCoordinates(coords.latitude, coords.longitude);
        },
        (error) => {
          console.error('Error fetching location', error);
          if (error.code === error.PERMISSION_DENIED && !locationDenied) {
            setLocationDenied(true);  // Set locationDenied to true after the first denial
          }
        }
      );
    }
  }, [fetchWeatherByCoordinates, locationDenied, locationGranted]); // Dependency on locationDenied and locationGranted

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Request location permission only once on mount or when denied
  useEffect(() => {
    if (!locationGranted && !locationDenied) {
      handleGetLocation();  // Trigger location fetch when the page is loaded
    }
  }, [locationGranted, locationDenied, handleGetLocation]); // Dependencies prevent repeated calls

  // Show alert once when location is denied
  useEffect(() => {
    if (locationDenied) {
      alert('Location permission denied. Please allow location access in your browser settings.');
    }
  }, [locationDenied]); // Trigger alert only when location is denied

  return (
    <div className="Header">
      {/* Display the Place component */}
      <Place />

      {/* Menu toggle button */}
      <button className="menu-btn" onClick={toggleMenu}>
        ☰ {/* Hamburger menu icon */}
      </button>

      {/* Menu Overlay */}
      <div
        className={`overlay ${menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Menu Content */}
      <div className={`menu ${menuOpen ? 'open' : ''}`}>
        {/* Reuse the Search component */}
        <Search />

        {/* Get Location button */}
        <button className="get-location-btn" onClick={handleGetLocation}>
          Get Current Location
        </button>

        {/* Settings component */}
        <Settings />
      </div>
    </div>
  );
}

export default Header;
