import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card, CardHeader, CardContent } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { apiClient } from '../../src/api/client';

export default function MarketplaceScreen() {
  const { isDark } = useTheme();
  const [packs, setPacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-gray-50';
  const cardColor = isDark ? 'bg-dark-card' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';

  const categories = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'language', name: 'Language', icon: 'language-outline' },
    { id: 'business', name: 'Business', icon: 'briefcase-outline' },
    { id: 'travel', name: 'Travel', icon: 'airplane-outline' },
    { id: 'culture', name: 'Culture', icon: 'globe-outline' },
  ];

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMarketplacePacks();
      setPacks(data);
    } catch (error) {
      console.error('Failed to load packs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPacks();
  };

  const handlePurchase = async (packId: string) => {
    try {
      const response = await apiClient.purchasePack(packId);
      console.log('Checkout URL:', response.checkoutUrl);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#ffffff' : '#0284c7'}
          />
        }
      >
        {/* Header */}
        <View className={`${cardColor} px-6 py-6 mb-4`}>
          <Text className={`text-3xl font-bold ${textColor} mb-2`}>Marketplace</Text>
          <Text className={`text-base ${textSecondary}`}>
            Discover premium skill packs from expert creators
          </Text>
        </View>

        {/* Categories */}
        <View className="px-6 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`px-4 py-2.5 rounded-full flex-row items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600'
                    : isDark
                    ? `${cardColor} border ${borderColor}`
                    : 'bg-white border border-gray-300'
                }`}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? 'white' : isDark ? '#9ca3af' : '#374151'}
                />
                <Text
                  className={`font-semibold ${
                    selectedCategory === category.id ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Pack */}
        <View className="px-6 mb-4">
          <Card variant="elevated">
            <View className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6">
              <View className="flex-row items-center mb-2">
                <View className="bg-white/20 px-3 py-1.5 rounded-full">
                  <Text className="text-white font-bold text-xs">FEATURED</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-white mb-2">
                Business English Mastery
              </Text>
              <Text className="text-white/90 mb-4">
                Master professional communication with 50+ real-world scenarios
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className="text-white font-semibold">4.9</Text>
                  <Text className="text-white/80">(234 reviews)</Text>
                </View>
                <Text className="text-2xl font-bold text-white">$29.99</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* All Packs */}
        <View className="px-6 pb-8">
          <Text className={`text-lg font-bold ${textColor} mb-3`}>All Skill Packs</Text>

          {packs.length === 0 && !isLoading && (
            <View className="py-12">
              <Ionicons
                name="folder-open-outline"
                size={64}
                color={isDark ? '#4b5563' : '#d1d5db'}
                style={{ alignSelf: 'center' }}
              />
              <Text className={`${textSecondary} text-center mt-4`}>No skill packs available</Text>
            </View>
          )}

          {packs.map((pack) => (
            <Card key={pack.id} className="mb-4">
              <View className="flex-row">
                {pack.thumbnailUrl && (
                  <Image
                    source={{ uri: pack.thumbnailUrl }}
                    className="w-24 h-24 rounded-xl mr-4"
                    style={{ resizeMode: 'cover' }}
                  />
                )}
                <View className="flex-1">
                  <Text className={`text-lg font-bold ${textColor} mb-1`}>{pack.name}</Text>
                  <Text className={`text-sm ${textSecondary} mb-2`} numberOfLines={2}>
                    {pack.description}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={14} color="#fbbf24" />
                        <Text className={`text-sm font-semibold ${textColor}`}>
                          {pack.rating || '5.0'}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="download-outline" size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={`text-sm ${textSecondary}`}>
                          {pack.downloads || 0}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xl font-bold text-primary-600">
                      ${(pack.price / 100).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
              <Button
                onPress={() => handlePurchase(pack.id)}
                variant="primary"
                fullWidth
                className="mt-3"
              >
                Purchase
              </Button>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
