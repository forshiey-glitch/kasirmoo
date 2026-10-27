import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = 'h-24 w-full',
}) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${className} bg-stone-200/80 rounded-xl animate-pulse border border-[#D4AF37]/20`}
        />
      ))}
    </div>
  );
};
