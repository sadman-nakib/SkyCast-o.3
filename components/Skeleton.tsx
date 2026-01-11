
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}></div>
);

export const WeatherSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-24 w-32" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);
