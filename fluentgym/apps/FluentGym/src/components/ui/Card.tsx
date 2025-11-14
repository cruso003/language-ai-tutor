import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ children, className, onPress, variant = 'default' }: CardProps) {
  const { isDark } = useTheme();

  const variantStyles = {
    default: isDark
      ? 'bg-dark-card border border-gray-700'
      : 'bg-white border border-gray-200',
    outlined: isDark
      ? 'bg-transparent border-2 border-gray-600'
      : 'bg-transparent border-2 border-gray-300',
    elevated: isDark
      ? 'bg-dark-card shadow-lg'
      : 'bg-white shadow-lg',
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      className={cn('rounded-2xl p-4', variantStyles[variant], className)}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  const { isDark } = useTheme();
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <View className={cn('flex-row items-center justify-between mb-3', className)}>
      <View className="flex-1">
        <Text className={`text-lg font-bold ${textColor}`}>{title}</Text>
        {subtitle && <Text className={`text-sm ${textSecondary} mt-1`}>{subtitle}</Text>}
      </View>
      {action && <View className="ml-3">{action}</View>}
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <View className={cn('', className)}>{children}</View>;
}
