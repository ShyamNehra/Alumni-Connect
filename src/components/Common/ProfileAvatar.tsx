import React from 'react';

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export function ProfileAvatar({ name, imageUrl, size = 'md', className = '', onClick }: ProfileAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-bold`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${name}'s profile`}
        className={`${baseClasses} ${interactiveClasses} ${className} object-cover`}
        onClick={onClick}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className} bg-blue-100 text-blue-800`}
      onClick={onClick}
    >
      {getInitials(name)}
    </div>
  );
}