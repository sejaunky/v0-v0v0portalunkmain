import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  strokeWidth = 2,
}) => {
  const iconName = name as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <IconComponent size={size} className={className} strokeWidth={strokeWidth} />
  );
};
