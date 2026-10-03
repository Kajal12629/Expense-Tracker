import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  size,
  color,
}) => {
  // Try to lookup the icon component from Lucide
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[name] || Icons.Tag;

  return <IconComponent className={className} size={size} color={color} />;
};

export const AVAILABLE_ICONS = [
  { name: 'UtensilsCrossed', label: 'Food & Dining' },
  { name: 'ShoppingBag', label: 'Shopping' },
  { name: 'Plane', label: 'Travel' },
  { name: 'Receipt', label: 'Bills & Utilities' },
  { name: 'Film', label: 'Entertainment' },
  { name: 'GraduationCap', label: 'Education' },
  { name: 'HeartPulse', label: 'Health & Wellness' },
  { name: 'Wallet', label: 'Salary / Cash' },
  { name: 'Briefcase', label: 'Work & Projects' },
  { name: 'TrendingUp', label: 'Investments' },
  { name: 'Laptop', label: 'Technology' },
  { name: 'Home', label: 'Housing & Rent' },
  { name: 'Car', label: 'Automotive & Fuel' },
  { name: 'Dumbbell', label: 'Fitness & Gym' },
  { name: 'Coffee', label: 'Café & Drinks' },
  { name: 'Gamepad2', label: 'Gaming' },
  { name: 'Gift', label: 'Gifts & Charity' },
  { name: 'ShieldCheck', label: 'Insurance & Safety' },
  { name: 'Compass', label: 'Adventure' },
  { name: 'MoreHorizontal', label: 'Other' },
];

export const AVAILABLE_COLORS = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Slate', hex: '#64748B' },
];
