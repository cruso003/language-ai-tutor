import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  className,
  leftIcon,
  rightIcon,
}: InputProps) {
  const { isDark } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry;

  // Dark mode colors
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-200';
  const inputText = isDark ? 'text-gray-100' : 'text-gray-900';
  const disabledBg = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const iconColor = isDark ? '#9ca3af' : '#6b7280';
  const placeholderColor = isDark ? '#6b7280' : '#9ca3af';

  return (
    <View className={cn('mb-4', className)}>
      {label && <Text className={cn('text-sm font-semibold mb-2', labelColor)}>{label}</Text>}

      <View
        className={cn(
          'flex-row items-center border-2 rounded-xl px-4 py-3',
          inputBg,
          isFocused ? 'border-primary-500' : inputBorder,
          error ? 'border-error' : '',
          disabled ? disabledBg : ''
        )}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={isPassword && !isPasswordVisible}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn('flex-1 text-base', inputText, multiline ? 'min-h-[80px]' : '')}
          placeholderTextColor={placeholderColor}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="ml-3"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>

      {error && <Text className="text-sm text-error mt-1">{error}</Text>}
    </View>
  );
}
