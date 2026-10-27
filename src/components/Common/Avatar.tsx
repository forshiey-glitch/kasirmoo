import React from 'react';

interface AvatarProps {
  name: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  role?: 'admin' | 'kasir';
  showBadge?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  url,
  size = 'md',
  role,
  showBadge = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  // Get initial letters or first 2 characters
  const getInitials = (str: string) => {
    if (!str) return '龍';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {url ? (
        <img
          src={url}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[#D4AF37] shadow-sm`}
          onError={(e) => {
            // fallback to initials on error
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#8B0000] to-[#C8102E] text-[#FAF3E0] font-bold flex items-center justify-center border-2 border-[#D4AF37] shadow-sm select-none font-calligraphy`}
        >
          {getInitials(name)}
        </div>
      )}

      {showBadge && role && (
        <span
          className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider border border-white text-white shadow ${
            role === 'admin' ? 'bg-[#D4AF37] text-[#4A3000]' : 'bg-[#2E7D32]'
          }`}
          title={role.toUpperCase()}
        >
          {role === 'admin' ? 'ADM' : 'POS'}
        </span>
      )}
    </div>
  );
};
