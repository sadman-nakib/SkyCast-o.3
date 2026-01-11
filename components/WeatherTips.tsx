
import React from 'react';
import { 
  Umbrella, 
  Shirt, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer, 
  Waves,
  Glasses,
  Home,
  Utensils,
  Bug,
  Sparkles
} from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherTipsProps {
  weather: WeatherData;
}

interface Tip {
  icon: React.ReactNode;
  text: string;
  type: 'clothing' | 'activity' | 'warning' | 'lifestyle';
}

export const WeatherTips: React.FC<WeatherTipsProps> = ({ weather }) => {
  const { temp, weatherCode, windSpeed, humidity } = weather.current;
  const tips: Tip[] = [];

  // Weather Condition Constants
  const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
  const isSnowing = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isClear = [0, 1].includes(weatherCode);
  const isCloudy = [2, 3, 45, 48].includes(weatherCode);

  // 1. Precipitation & Warning Tips
  if (isRaining) {
    tips.push({ icon: <Umbrella className="w-5 h-5" />, text: "Carry an umbrella or raincoat.", type: 'warning' });
    tips.push({ icon: <Home className="w-5 h-5" />, text: "Perfect day for indoor activities.", type: 'lifestyle' });
  } else if (isSnowing) {
    tips.push({ icon: <Waves className="w-5 h-5" />, text: "Wear waterproof boots and gloves.", type: 'clothing' });
  }

  // 2. Clothing & Temperature Tips
  if (temp <= 0) {
    tips.push({ icon: <Shirt className="w-5 h-5" />, text: "Heavy winter gear is a must.", type: 'clothing' });
    tips.push({ icon: <Sparkles className="w-5 h-5" />, text: "Dry air alert! Use moisturizer.", type: 'lifestyle' });
  } else if (temp > 0 && temp <= 12) {
    tips.push({ icon: <Shirt className="w-5 h-5" />, text: "Grab a warm sweater or jacket.", type: 'clothing' });
    if (humidity < 35) tips.push({ icon: <Sparkles className="w-5 h-5" />, text: "Low humidity. Use moisturizer.", type: 'lifestyle' });
  } else if (temp > 12 && temp <= 22) {
    tips.push({ icon: <Shirt className="w-5 h-5" />, text: "Perfect for light layers.", type: 'clothing' });
  } else if (temp > 22 && temp <= 32) {
    tips.push({ icon: <Shirt className="w-5 h-5" />, text: "Wear breathable cotton outfits.", type: 'clothing' });
  } else if (temp > 32) {
    tips.push({ icon: <Sun className="w-5 h-5" />, text: "Extreme heat! Use sun protection.", type: 'warning' });
    tips.push({ icon: <Utensils className="w-5 h-5" />, text: "Stay hydrated! Carry a water bottle.", type: 'lifestyle' });
  }

  // 3. Sun & Protection
  if (isClear) {
    tips.push({ icon: <Sun className="w-5 h-5" />, text: "UV levels high. Apply sunscreen.", type: 'warning' });
    tips.push({ icon: <Glasses className="w-5 h-5" />, text: "Bright day! Wear your sunglasses.", type: 'activity' });
  }

  // 4. Laundry Prediction
  if (!isRaining && !isSnowing) {
    if (temp > 18 && humidity < 55) {
      tips.push({ icon: <Shirt className="w-5 h-5" />, text: "Great for laundry! Clothes will dry fast.", type: 'lifestyle' });
    } else if (humidity > 75) {
      tips.push({ icon: <Droplets className="w-5 h-5" />, text: "High humidity. Laundry may stay damp.", type: 'lifestyle' });
    }
  } else {
    tips.push({ icon: <Shirt className="w-5 h-5" />, text: "Rainy! Avoid washing clothes today.", type: 'lifestyle' });
  }

  // 5. Environmental Factors
  if (windSpeed > 25) {
    tips.push({ icon: <Wind className="w-5 h-5" />, text: "Breezy. Avoid light hats or umbrellas.", type: 'warning' });
  }

  if (temp > 22 && humidity > 70) {
    tips.push({ icon: <Bug className="w-5 h-5" />, text: "Humid & Warm. Use mosquito repellent.", type: 'lifestyle' });
  }

  if (humidity > 80 && temp > 28) {
    tips.push({ icon: <Utensils className="w-5 h-5" />, text: "Sultry day. Keep extra water handy.", type: 'lifestyle' });
  }

  if (tips.length === 0) return null;

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x touch-pan-x">
        {tips.map((tip, idx) => (
          <div 
            key={idx} 
            className="glass flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-white snap-center hover:bg-white/20 transition-all cursor-default min-w-[240px] border border-white/10 shadow-lg"
          >
            <div className={`p-3 rounded-2xl shadow-inner ${tip.type === 'warning' ? 'bg-orange-500/30' : tip.type === 'clothing' ? 'bg-blue-500/30' : 'bg-white/10'}`}>
              {React.cloneElement(tip.icon as React.ReactElement, { className: 'w-5 h-5' })}
            </div>
            <span className="text-sm font-bold tracking-tight leading-snug">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
