import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../utils/cn';

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View className={cn('mb-4', className)}>
      {label && <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>}

      <View
        className={cn(
          'flex-row items-center border-2 rounded-xl px-4 py-3 bg-white',
          isFocused ? 'border-primary-500' : 'border-gray-200',
          error ? 'border-error' : '',
          disabled ? 'bg-gray-100' : ''
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
          className={cn('flex-1 text-base text-gray-900', multiline ? 'min-h-[80px]' : '')}
          placeholderTextColor="#9ca3af"
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="ml-3"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>

      {error && <Text className="text-sm text-error mt-1">{error}</Text>}
    </View>
  );
}
