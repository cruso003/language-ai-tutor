import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 px-6 pt-12">
            {/* Header */}
            <View className="mb-8">
              <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-4">
                <Ionicons name="language" size={32} color="#0284c7" />
              </View>
              <Text className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</Text>
              <Text className="text-lg text-gray-600">
                Sign in to continue your learning journey
              </Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Ionicons name="mail" size={20} color="#6b7280" />}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
                leftIcon={<Ionicons name="lock-closed" size={20} color="#6b7280" />}
              />

              <TouchableOpacity className="self-end mb-4">
                <Text className="text-primary-600 font-semibold">Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="lg"
                className="mb-4"
              >
                Sign In
              </Button>

              <View className="flex-row items-center justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text className="text-primary-600 font-bold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500">or continue with</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Login */}
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity className="w-14 h-14 rounded-full border-2 border-gray-300 items-center justify-center">
                <Ionicons name="logo-google" size={24} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 rounded-full border-2 border-gray-300 items-center justify-center">
                <Ionicons name="logo-apple" size={24} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 rounded-full border-2 border-gray-300 items-center justify-center">
                <Ionicons name="logo-github" size={24} color="#181717" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
