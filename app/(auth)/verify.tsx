import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend verification email API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Verification email has been resent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center items-center">
        {/* Icon */}
        <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-6">
          <Ionicons name="mail-open" size={48} color="#0284c7" />
        </View>

        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Check Your Email
        </Text>
        <Text className="text-lg text-gray-600 text-center mb-8 px-4">
          We've sent a verification link to your email address. Please click the link to verify
          your account.
        </Text>

        {/* Instructions */}
        <View className="bg-blue-50 rounded-2xl p-6 mb-8 w-full">
          <Text className="text-sm text-gray-700 mb-2">
            <Text className="font-semibold">1.</Text> Open your email inbox
          </Text>
          <Text className="text-sm text-gray-700 mb-2">
            <Text className="font-semibold">2.</Text> Find the verification email from FluentAI
          </Text>
          <Text className="text-sm text-gray-700">
            <Text className="font-semibold">3.</Text> Click the verification link
          </Text>
        </View>

        {/* Actions */}
        <View className="w-full space-y-3">
          <Button onPress={() => router.replace('/(auth)/login')} fullWidth size="lg">
            Go to Login
          </Button>

          <Button
            onPress={handleResendEmail}
            variant="outline"
            fullWidth
            loading={isResending}
          >
            Resend Verification Email
          </Button>
        </View>

        {/* Help Text */}
        <View className="mt-8">
          <Text className="text-sm text-gray-500 text-center">
            Didn't receive the email? Check your spam folder or{'\n'}
            <TouchableOpacity>
              <Text className="text-primary-600 font-semibold">contact support</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
