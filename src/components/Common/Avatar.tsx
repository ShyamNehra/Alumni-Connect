import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export function Avatar({ name, imageUrl, size = 'md', className = '', onClick }: AvatarProps) {
  return (
    <ProfileAvatar
      name={name}
      imageUrl={imageUrl}
      size={size}
      className={className}
      onClick={onClick}
    />
  );
}