import { useContext, useEffect } from 'react';
import WeatherContext from '../context/weather.context';
import { getWeatherData } from '../api';

function Weather() {
  const { place, setWeather, weather } = useContext(WeatherContext);

  useEffect(() => {
    const fetchWeather = async () => {
      if (place?.place_id) {
        const data = await getWeatherData('current', place.place_id, 'metric');
        setWeather(data);
      }
    };
    fetchWeather();
  }, [place, setWeather]);

  if (!weather) {
    return <div>Loading weather...</div>;
  }

  return (
    <div className='Weather'>
      <h2>{weather?.temperature || 'N/A'}°C</h2>
      <p>{weather?.description || 'N/A'}</p>
    </div>
  );
}

export default Weather;
