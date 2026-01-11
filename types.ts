
export type Unit = 'celsius' | 'fahrenheit';
export type Theme = 'light' | 'dark';

export interface LocationData {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    uvIndex: number;
    aqi: number;
    isDay: boolean;
    time: string;
  };
  hourly: {
    time: string[];
    temp: number[];
    weatherCode: number[];
    precipitationProbability: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    weatherCode: number[];
    sunrise: string[];
    sunset: string[];
    uvIndexMax: number[];
  };
}

export interface CacheEntry {
  data: WeatherData;
  location: LocationData;
  timestamp: number;
}
