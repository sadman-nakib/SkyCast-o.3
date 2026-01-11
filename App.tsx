
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, MapPin, Droplets, Wind, Sun, Moon, Sunrise, Sunset, 
  AlertCircle, RefreshCcw, Navigation, Sparkles, Mail, Star, 
  History, ShieldCheck, Zap
} from 'lucide-react';
import { searchCity, fetchWeather, reverseGeocode } from './services/weatherService';
import { LocationData, WeatherData, Unit, Theme, CacheEntry } from './types';
import { getWeatherInfo, formatTemp, CACHE_TTL, getAqiInfo, getUvInfo } from './constants';
import { WeatherSkeleton } from './components/Skeleton';
import { HourlyChart } from './components/HourlyChart';
import { WeatherTips } from './components/WeatherTips';
import { AnimatedNumber } from './components/AnimatedNumber';
import { SunMoonCard } from './components/SunMoonCard';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>(() => (localStorage.getItem('skycast-unit') as Unit) || 'celsius');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('skycast-theme') as Theme;
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  const [favorites, setFavorites] = useState<LocationData[]>(() => 
    JSON.parse(localStorage.getItem('skycast-favs') || '[]')
  );
  const [recents, setRecents] = useState<LocationData[]>(() => 
    JSON.parse(localStorage.getItem('skycast-recent') || '[]')
  );

  useEffect(() => {
    localStorage.setItem('skycast-unit', unit);
    localStorage.setItem('skycast-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [unit, theme]);

  const saveRecent = (loc: LocationData) => {
    const updated = [loc, ...recents.filter(r => r.name !== loc.name)].slice(0, 4);
    setRecents(updated);
    localStorage.setItem('skycast-recent', JSON.stringify(updated));
  };

  const toggleFavorite = (loc: LocationData) => {
    const isFav = favorites.some(f => f.name === loc.name);
    const updated = isFav ? favorites.filter(f => f.name !== loc.name) : [...favorites, loc];
    setFavorites(updated);
    localStorage.setItem('skycast-favs', JSON.stringify(updated));
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const loc = await searchCity(term);
      if (!loc) { setError('City not found.'); setLoading(false); return; }
      const data = await fetchWeather(loc.lat, loc.lon);
      setLocation(loc);
      setWeather(data);
      saveRecent(loc);
      localStorage.setItem('skycast-last-location', JSON.stringify(loc));
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = useCallback(async (isInitial = false) => {
    if (!navigator.geolocation) {
      if (isInitial) handleSearch('London');
      return;
    }
    
    if (!isInitial) setDetecting(true);
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        setLoading(true);
        const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (loc) {
          const data = await fetchWeather(loc.lat, loc.lon);
          setLocation(loc);
          setWeather(data);
          localStorage.setItem('skycast-last-location', JSON.stringify(loc));
        }
      } catch { 
        setError('Auto-detect failed.'); 
      } finally { 
        setDetecting(false); 
        setLoading(false);
      }
    }, (err) => {
      setDetecting(false);
      // Only fallback to London or stored location if auto-detect is strictly denied/unavailable
      if (isInitial) {
        const last = localStorage.getItem('skycast-last-location');
        if (last) {
          const loc = JSON.parse(last);
          handleSearch(loc.name);
        } else {
          handleSearch('London');
        }
      } else {
        setError('Location permission denied.');
      }
    });
  }, []);

  useEffect(() => {
    // Proactively detect location on land
    handleAutoDetect(true);
  }, [handleAutoDetect]);

  const weatherInfo = weather ? getWeatherInfo(weather.current.weatherCode) : null;
  const gradientColor = theme === 'light' ? (weatherInfo?.color || 'from-blue-500 to-indigo-600') : (weatherInfo?.darkColor || 'from-slate-950 to-black');
  const aqi = weather ? getAqiInfo(weather.current.aqi) : null;
  const uv = weather ? getUvInfo(weather.current.uvIndex) : null;

  return (
    <div className={`min-h-screen transition-all duration-700 bg-gradient-to-br ${gradientColor} dark:text-slate-100 pb-12 overflow-x-hidden`}>
      {/* Background Particles (Subtle) */}
      <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        <header className="flex flex-col xl:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl animate-pulse">
                <Zap className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">SKYCAST</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Weather Intelligence</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full lg:w-96">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
                placeholder="Find a city..."
                className="w-full bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 px-6 py-4 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-white/20 transition-all text-white placeholder-white/40 shadow-2xl"
              />
              <button onClick={() => handleSearch(query)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => handleAutoDetect()} className="glass p-4 rounded-2xl text-white hover:bg-white/20" title="Detect location"><Navigation className={detecting ? 'animate-spin' : ''} /></button>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="glass p-4 rounded-2xl text-white">{theme === 'light' ? <Moon /> : <Sun />}</button>
              <button onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')} className="glass px-6 py-4 rounded-2xl text-white font-black">{unit === 'celsius' ? '°C' : '°F'}</button>
            </div>
          </div>
        </header>

        {/* Quick Access Bar */}
        {(favorites.length > 0 || recents.length > 0) && (
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide mb-8">
            {favorites.map(f => (
              <button key={f.name} onClick={() => handleSearch(f.name)} className="glass px-5 py-2 rounded-xl text-xs font-black text-white flex items-center gap-2 whitespace-nowrap border-yellow-400/30 border">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {f.name}
              </button>
            ))}
            {recents.map(r => (
              <button key={r.name} onClick={() => handleSearch(r.name)} className="glass px-5 py-2 rounded-xl text-xs font-bold text-white/70 flex items-center gap-2 whitespace-nowrap">
                <History className="w-3 h-3" /> {r.name}
              </button>
            ))}
          </div>
        )}

        {loading ? <WeatherSkeleton /> : weather && location ? (
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 animate-fade-in">
            
            {/* Main Hero Card */}
            <div className="lg:col-span-12 glass rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-white/5">
              <div className="text-center md:text-left relative z-10">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                    <MapPin className="w-3 h-3" /> {location.country}
                  </div>
                  <button onClick={() => toggleFavorite(location)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                    <Star className={`w-4 h-4 ${favorites.some(f => f.name === location.name) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </button>
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-white mb-6 leading-tight group-hover:tracking-tight transition-all duration-700">{location.name}</h2>
                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <span className="text-8xl md:text-[14rem] font-extralight text-white tracking-tighter flex">
                    <AnimatedNumber value={Math.round(unit === 'fahrenheit' ? (weather.current.temp * 9/5) + 32 : weather.current.temp)} />
                    <span className="text-4xl md:text-7xl mt-6 md:mt-12">°</span>
                  </span>
                  <div className="text-white space-y-1">
                    <p className="text-2xl md:text-4xl font-black">{weatherInfo?.label}</p>
                    <p className="text-lg opacity-60 font-medium">Feels like {formatTemp(weather.current.feelsLike, unit)}</p>
                  </div>
                </div>
              </div>
              <div className="relative group-hover:scale-110 transition-transform duration-1000">
                <div className="w-48 h-48 md:w-80 md:h-80 drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]">
                  {React.cloneElement(weatherInfo?.icon as React.ReactElement, { className: 'w-full h-full text-white' })}
                </div>
              </div>
            </div>

            {/* Side-by-side: Air Quality & Celestial Status */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass rounded-[2rem] p-8 text-white h-full border-l-4 border-emerald-400">
                <div className="flex items-center justify-between mb-8">
                  <ShieldCheck className="w-8 h-8 opacity-60" />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Environmental</span>
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold opacity-60 uppercase">Air Quality</p>
                      <p className={`text-xl font-black ${aqi?.color}`}>{aqi?.label}</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-emerald-400 transition-all duration-1000`} style={{ width: `${Math.min(100, weather.current.aqi * 1.5)}%` }}></div>
                    </div>
                    <p className="text-[10px] mt-2 opacity-50 font-bold">{aqi?.desc}</p>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold opacity-60 uppercase">UV Index</p>
                      <p className={`text-xl font-black ${uv?.color}`}>{uv?.label} ({weather.current.uvIndex})</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${(weather.current.uvIndex / 12) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] mt-2 opacity-50 font-bold">{uv?.risk}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <SunMoonCard sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} isDay={weather.current.isDay} />
            </div>

            {/* Forecast Section */}
            <div className="lg:col-span-12 space-y-4 pt-4">
              <div className="flex items-center gap-2 text-white/90">
                 <Sparkles className="w-5 h-5 text-yellow-300" />
                 <h3 className="text-lg font-black uppercase tracking-widest">Personalized Recommendations</h3>
              </div>
              <WeatherTips weather={weather} />
            </div>

            {/* Detailed Hourly Chart */}
            <div className="lg:col-span-7 glass rounded-[2.5rem] p-10 text-white min-h-[400px]">
              <HourlyChart data={weather.hourly.time.map((t, idx) => ({ time: t, temp: weather.hourly.temp[idx], rain: weather.hourly.precipitationProbability[idx] }))} unit={unit} />
            </div>

            {/* Daily Summary */}
            <div className="lg:col-span-5 glass rounded-[2.5rem] p-10 text-white">
               <h3 className="text-xl font-black mb-8 uppercase tracking-tighter">7-Day Outlook</h3>
               <div className="space-y-4">
                 {weather.daily.time.map((day, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                     <span className="w-20 font-black text-sm">{i === 0 ? 'Today' : new Date(day).toLocaleDateString([], { weekday: 'short' })}</span>
                     <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 group-hover:rotate-12 transition-transform">{React.cloneElement(getWeatherInfo(weather.daily.weatherCode[i]).icon as React.ReactElement, { className: 'w-full h-full text-white' })}</div>
                        <span className="text-xs font-bold opacity-40 uppercase tracking-widest hidden sm:block">Rain {weather.hourly.precipitationProbability[i*24]}%</span>
                     </div>
                     <div className="flex gap-4">
                        <span className="font-black">{formatTemp(weather.daily.tempMax[i], unit)}</span>
                        <span className="opacity-40 font-bold">{formatTemp(weather.daily.tempMin[i], unit)}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </main>
        ) : null}

        <footer className="mt-20 flex flex-col items-center">
          <a href="mailto:sadman.nakib@yahoo.com" className="group flex items-center gap-4 glass px-10 py-4 rounded-[2rem] text-white font-black hover:scale-105 active:scale-95 transition-all shadow-2xl">
            <Mail className="w-5 h-5 group-hover:animate-bounce" />
            <span className="tracking-widest uppercase text-sm">Design by Sadman Nakib</span>
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;
