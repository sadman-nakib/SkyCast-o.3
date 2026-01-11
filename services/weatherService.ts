
import { LocationData, WeatherData } from '../types';

export const searchCity = async (query: string): Promise<LocationData | null> => {
  try {
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        name: feature.properties.name,
        country: feature.properties.country || feature.properties.state || 'Unknown',
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<LocationData | null> => {
  try {
    const response = await fetch(`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        name: feature.properties.name || feature.properties.city || 'Current Location',
        country: feature.properties.country || 'Nearby',
        lat: lat,
        lon: lon,
      };
    }
    return { name: 'Detected Location', country: 'Nearby', lat, lon };
  } catch (error) {
    return { name: 'Detected Location', country: 'Nearby', lat, lon };
  }
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  // Main weather forecast
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
  
  // Separate AQI fetch
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`;

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(aqiUrl)
  ]);

  if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
  
  const weatherData = await weatherRes.json();
  const aqiData = aqiRes.ok ? await aqiRes.json() : { current: { european_aqi: 0 } };
  
  // Calculate current UV from hourly (estimating from the nearest hour)
  const currentHourIndex = new Date().getHours();
  const uvMax = weatherData.daily.uv_index_max[0];
  // Simple bell curve estimation for current UV index based on time of day
  const hour = new Date().getHours();
  const uvEstimate = (hour > 6 && hour < 18) ? Math.max(0, uvMax * Math.sin((hour - 6) * Math.PI / 12)) : 0;

  return {
    current: {
      temp: weatherData.current.temperature_2m,
      feelsLike: weatherData.current.apparent_temperature,
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
      windDirection: weatherData.current.wind_direction_10m,
      weatherCode: weatherData.current.weather_code,
      uvIndex: Number(uvEstimate.toFixed(1)),
      aqi: aqiData.current.european_aqi,
      isDay: weatherData.current.is_day === 1,
      time: weatherData.current.time,
    },
    hourly: {
      time: weatherData.hourly.time.slice(0, 24),
      temp: weatherData.hourly.temperature_2m.slice(0, 24),
      weatherCode: weatherData.hourly.weather_code.slice(0, 24),
      precipitationProbability: weatherData.hourly.precipitation_probability.slice(0, 24),
    },
    daily: {
      time: weatherData.daily.time,
      tempMax: weatherData.daily.temperature_2m_max,
      tempMin: weatherData.daily.temperature_2m_min,
      weatherCode: weatherData.daily.weather_code,
      sunrise: weatherData.daily.sunrise,
      sunset: weatherData.daily.sunset,
      uvIndexMax: weatherData.daily.uv_index_max,
    },
  };
};
