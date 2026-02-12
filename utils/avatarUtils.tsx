import React from 'react';
import { User } from 'lucide-react';

export type Gender = 'M' | 'F';

interface AvatarProps {
  name: string;
  gender?: Gender;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StudentAvatar: React.FC<AvatarProps> = ({ 
  name, 
  gender = 'M', 
  size = 'md',
  className = ''
}) => {
  // Generate initials
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate colors based on gender
  const isMale = gender === 'M';
  
  // Male colors: Blue tones
  const maleColors = [
    'from-blue-400 to-blue-600',
    'from-sky-400 to-sky-600',
    'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600'
  ];

  // Female colors: Pink/Purple tones
  const femaleColors = [
    'from-pink-400 to-pink-600',
    'from-rose-400 to-rose-600',
    'from-purple-400 to-purple-600',
    'from-fuchsia-400 to-fuchsia-600'
  ];

  // Pick a color based on name hash
  const colorIndex = name.charCodeAt(0) % (isMale ? maleColors.length : femaleColors.length);
  const colorClass = isMale ? maleColors[colorIndex] : femaleColors[colorIndex];

  // Size mapping
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center font-bold text-white shadow-md ${className}`}
    >
      {initials}
    </div>
  );
};

export const getGenderColor = (gender?: Gender) => {
  return gender === 'M' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-pink-600 bg-pink-50 border-pink-200';
};

export const getGenderLabel = (gender?: Gender) => {
  return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'N/A';
};
