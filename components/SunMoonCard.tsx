
import React from 'react';
import { Sunrise, Sunset, Moon, Sparkles } from 'lucide-react';
import { getMoonPhase } from '../constants';

interface SunMoonCardProps {
  sunrise: string;
  sunset: string;
  isDay: boolean;
}

export const SunMoonCard: React.FC<SunMoonCardProps> = ({ sunrise, sunset, isDay }) => {
  const now = new Date();
  const sr = new Date(sunrise);
  const ss = new Date(sunset);
  
  const sunProgress = Math.max(0, Math.min(100, 
    ((now.getTime() - sr.getTime()) / (ss.getTime() - sr.getTime())) * 100
  ));

  return (
    <div className="glass rounded-[2rem] p-6 text-white h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest opacity-60">Celestial Status</h4>
        <div className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold">
          {isDay ? 'Golden Hour' : 'Starry Night'}
        </div>
      </div>

      <div className="relative h-24 mb-6">
        {/* Sun Path Arc */}
        <div className="absolute inset-0 border-t-2 border-dashed border-white/20 rounded-t-full mt-4 h-full"></div>
        {isDay && (
          <div 
            className="absolute transition-all duration-1000"
            style={{ 
              left: `${sunProgress}%`, 
              top: `${Math.sin((sunProgress / 100) * Math.PI) * -40 + 40}%`,
              transform: 'translate(-50%, -50%)' 
            }}
          >
            <div className="p-2 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)]">
              <Sunrise className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Sunrise className="w-5 h-5 text-orange-300" />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-50">Rise</p>
            <p className="text-sm font-black">{sr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Sunset className="w-5 h-5 text-purple-300" />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-50">Set</p>
            <p className="text-sm font-black">{ss.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 col-span-2 pt-2 border-t border-white/10">
          <Moon className="w-5 h-5 text-blue-200" />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-50">Moon Phase</p>
            <p className="text-sm font-black">{getMoonPhase(now)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
