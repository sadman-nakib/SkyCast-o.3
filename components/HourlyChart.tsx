
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Unit } from '../types';

interface HourlyChartProps {
  data: { time: string; temp: number; rain: number }[];
  unit: Unit;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ data, unit }) => {
  const [mode, setMode] = useState<'temp' | 'rain'>('temp');

  const chartData = data.map(d => ({
    time: new Date(d.time).getHours() + ':00',
    temp: unit === 'fahrenheit' ? Math.round((d.temp * 9/5) + 32) : Math.round(d.temp),
    rain: d.rain
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end gap-2 mb-4">
        <button 
          onClick={() => setMode('temp')}
          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'temp' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'}`}
        >
          Temp
        </button>
        <button 
          onClick={() => setMode('rain')}
          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'rain' ? 'bg-white text-blue-600' : 'bg-white/10 text-white'}`}
        >
          Rain %
        </button>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'temp' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                interval={2}
                tick={{ fill: '#fff', opacity: 0.7 }}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="temp" stroke="#fff" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                interval={2}
                tick={{ fill: '#fff', opacity: 0.7 }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff' }}
                 itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                 labelStyle={{ display: 'none' }}
              />
              <Bar dataKey="rain" fill="#ffffff" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
