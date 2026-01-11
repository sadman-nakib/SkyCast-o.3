
import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle, 
  CloudFog,
  Wind,
  Moon,
  Compass
} from 'lucide-react';

export const WMO_WEATHER_CODES: Record<number, { label: string; icon: React.ReactNode; color: string; darkColor: string }> = {
  0: { 
    label: 'Clear Sky', 
    icon: <Sun className="w-8 h-8 text-yellow-400" />, 
    color: 'from-blue-400 to-blue-600',
    darkColor: 'from-blue-900 to-slate-900'
  },
  1: { 
    label: 'Mainly Clear', 
    icon: <Sun className="w-8 h-8 text-yellow-300" />, 
    color: 'from-blue-300 to-blue-500',
    darkColor: 'from-blue-800 to-slate-900'
  },
  2: { 
    label: 'Partly Cloudy', 
    icon: <Cloud className="w-8 h-8 text-blue-200" />, 
    color: 'from-blue-400 to-gray-400',
    darkColor: 'from-slate-700 to-slate-900'
  },
  3: { 
    label: 'Overcast', 
    icon: <Cloud className="w-8 h-8 text-gray-400" />, 
    color: 'from-gray-400 to-gray-600',
    darkColor: 'from-gray-800 to-slate-950'
  },
  45: { label: 'Foggy', icon: <CloudFog className="w-8 h-8 text-gray-300" />, color: 'from-gray-300 to-gray-500', darkColor: 'from-gray-900 to-slate-900' },
  48: { label: 'Rime Fog', icon: <CloudFog className="w-8 h-8 text-gray-300" />, color: 'from-gray-300 to-gray-500', darkColor: 'from-gray-900 to-slate-900' },
  51: { label: 'Light Drizzle', icon: <CloudDrizzle className="w-8 h-8 text-blue-300" />, color: 'from-blue-400 to-indigo-500', darkColor: 'from-indigo-900 to-slate-950' },
  61: { label: 'Slight Rain', icon: <CloudRain className="w-8 h-8 text-blue-400" />, color: 'from-blue-500 to-indigo-600', darkColor: 'from-blue-900 to-indigo-950' },
  63: { label: 'Rain', icon: <CloudRain className="w-8 h-8 text-blue-500" />, color: 'from-blue-600 to-indigo-700', darkColor: 'from-blue-950 to-indigo-950' },
  71: { label: 'Slight Snow', icon: <CloudSnow className="w-8 h-8 text-white" />, color: 'from-blue-100 to-gray-300', darkColor: 'from-slate-600 to-slate-900' },
  80: { label: 'Rain Showers', icon: <CloudRain className="w-8 h-8 text-blue-500" />, color: 'from-blue-600 to-indigo-800', darkColor: 'from-indigo-950 to-slate-950' },
  95: { label: 'Thunderstorm', icon: <CloudLightning className="w-8 h-8 text-yellow-500" />, color: 'from-indigo-700 to-purple-900', darkColor: 'from-indigo-950 to-purple-950' },
};

export const getWeatherInfo = (code: number) => {
  return WMO_WEATHER_CODES[code] || { 
    label: 'Unknown', 
    icon: <Wind />, 
    color: 'from-gray-400 to-gray-600',
    darkColor: 'from-gray-800 to-slate-950'
  };
};

export const getAqiInfo = (aqi: number) => {
  if (aqi <= 20) return { label: 'Good', color: 'text-emerald-400', desc: 'Air is fresh.' };
  if (aqi <= 40) return { label: 'Fair', color: 'text-green-400', desc: 'Acceptable quality.' };
  if (aqi <= 60) return { label: 'Moderate', color: 'text-yellow-400', desc: 'Moderate pollution.' };
  if (aqi <= 80) return { label: 'Poor', color: 'text-orange-400', desc: 'Sensitive groups watch out.' };
  return { label: 'Very Poor', color: 'text-red-400', desc: 'Health warning issued.' };
};

export const getUvInfo = (uv: number) => {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', risk: 'Low risk.' };
  if (uv <= 5) return { label: 'Mod', color: 'text-yellow-400', risk: 'Sunscreen needed.' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400', risk: 'Seek shade.' };
  return { label: 'Extr', color: 'text-red-500', risk: 'Extreme danger.' };
};

export const getMoonPhase = (date: Date) => {
  const lp = 2551443; 
  const now = new Date(date.getTime());
  const new_moon = new Date(1970, 0, 7, 20, 35, 0);
  const phase = ((now.getTime() - new_moon.getTime()) / 1000) % lp;
  const res = Math.floor((phase / lp) * 8);
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  return phases[res % 8];
};

export const formatTemp = (temp: number, unit: 'celsius' | 'fahrenheit') => {
  const value = unit === 'fahrenheit' ? (temp * 9/5) + 32 : temp;
  return `${Math.round(value)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
};

export const CACHE_TTL = 30 * 60 * 1000;
