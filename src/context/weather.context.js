import { createContext, useEffect, useState } from 'react';
import { DEFAULT_PLACE, MEASUREMENT_SYSTEMS, UNITS } from '../constants';
import { getWeatherData, getWeatherDataByCoordinates, getNearestPlaceByCoordinates } from '../api';

const WeatherContext = createContext();

function WeatherProvider({ children }) {
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [loading, setLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [measurementSystem, setMeasurementSystem] = useState(MEASUREMENT_SYSTEMS.AUTO);
  const [units, setUnits] = useState({});
  const [isGeoLocation, setIsGeoLocation] = useState(false); // Flag to track if the place is from geolocation

  async function fetchWeatherByCoordinates(latitude, longitude) {
    setLoading(true);
    setIsGeoLocation(true);  // Mark that we are fetching data by geolocation

    try {
      // Fetch weather data using coordinates
      const cw = await getWeatherDataByCoordinates(latitude, longitude, measurementSystem);

      if (cw) {
        setCurrentWeather(cw.weather.current);
        setUnits(UNITS[cw.weather.units]);

        const hf = await getWeatherDataByCoordinates(latitude, longitude, measurementSystem, 'hourly');
        setHourlyForecast(hf.weather.hourly.data);

        const df = await getWeatherDataByCoordinates(latitude, longitude, measurementSystem, 'daily');
        setDailyForecast(df.weather.daily.data);

        // Fetch nearest place information based on coordinates
        const placeData = await getNearestPlaceByCoordinates(latitude, longitude);

        // Set the place data using the nearest place information
        setPlace({
          name: placeData.name || `Lat: ${latitude}, Lng: ${longitude}`,  // Default to lat/lng if no name is found
          place_id: placeData.place_id || `${latitude},${longitude}`, // Unique identifier based on coordinates
          country: placeData.country || 'Unknown',  // Use country from response or fallback to 'Unknown'
          lat: latitude,
          lon: longitude,
          timezone: placeData.timezone || 'UTC',  // Use timezone from response or fallback to 'UTC'
          type: 'geolocation',
        });
      } else {
        console.error("Failed to fetch weather data by coordinates");
      }
    } catch (error) {
      console.error("Error fetching weather by coordinates:", error);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);

      // Don't run fetchWeather if the place is set by geolocation
      if (isGeoLocation) {
        setLoading(false);
        return;
      }

      const cw = await getWeatherData('current', place.place_id, measurementSystem);
      if (cw) {
        setCurrentWeather(cw.current);
        setUnits(UNITS[cw.units]);

        const hf = await getWeatherData('hourly', place.place_id, measurementSystem);
        setHourlyForecast(hf.hourly.data);

        const df = await getWeatherData('daily', place.place_id, measurementSystem);
        setDailyForecast(df.daily.data);
      } else {
        console.error("Failed to fetch weather data for place:", place.place_id);
      }

      setLoading(false);
    }

    if (place.place_id && !isGeoLocation) {
      fetchWeather();
    }
  }, [place, measurementSystem, isGeoLocation]);

  return (
    <WeatherContext.Provider
      value={{
        place,
        setPlace,
        loading,
        currentWeather,
        hourlyForecast,
        dailyForecast,
        measurementSystem,
        setMeasurementSystem,
        units,
        fetchWeatherByCoordinates,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export { WeatherProvider };
export default WeatherContext;
