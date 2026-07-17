import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface TabBarIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function TabBarIcon({ name, size = 24, color }: TabBarIconProps) {
  return <Ionicons name={name as any} size={size} color={color} />;
}
